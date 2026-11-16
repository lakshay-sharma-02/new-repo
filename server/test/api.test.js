import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

// Must be set before the app/config modules are imported.
process.env.NODE_ENV = "test";
process.env.MOCK_MODE = "true";
process.env.JWT_SECRET = "test-secret";
process.env.CORS_ORIGINS = "http://localhost:5173";
process.env.REQUIRE_VERIFIED_EMAIL = "false";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let app;
let wardenToken;
let payerToken;

function auth(req, token) {
  return req.set("Authorization", `Bearer ${token}`);
}

async function login(email, password = "demo123") {
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/login").send({ email, password });
  return { agent, res, token: res.body.accessToken };
}

async function register(payload) {
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/register").send(payload);
  return { agent, res, token: res.body.accessToken };
}

async function publishSchedule(hostelBlock, laundryDays) {
  return auth(request(app).post("/api/timings"), wardenToken).send({
    hostelBlock,
    laundryDays,
    dropoffStart: "00:00",
    dropoffEnd: "23:59",
    pickupStart: "00:00",
    pickupEnd: "23:59",
    cutoffTime: "23:59",
    turnaroundDays: 2,
  });
}

beforeAll(async () => {
  ({ app } = await import("../src/app.js"));
  const { seedDemoData } = await import("../src/mock/seed.js");
  await seedDemoData();

  const warden = await login("meera@hostel.edu");
  wardenToken = warden.token;

  await publishSchedule("T1", DAY_NAMES);
  await publishSchedule("Z9", [DAY_NAMES[(new Date().getDay() + 1) % 7]]);

  const payer = await register({
    name: "Payer One",
    email: "payer@hostel.edu",
    password: "payerpass1",
    hostelBlock: "T1",
  });
  payerToken = payer.token;
});

describe("auth", () => {
  it("logs in and never returns the password hash", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "aarav@hostel.edu", password: "demo123" });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.user.password).toBeUndefined();
    expect(String(res.headers["set-cookie"])).toContain("lr_refresh");
  });

  it("enforces the password policy on registration", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Short Pass",
      email: "short@hostel.edu",
      password: "abc123",
    });

    expect(res.status).toBe(400);
  });

  it("rotates refresh tokens and rejects replay of the old cookie", async () => {
    const agent = request.agent(app);
    const loginRes = await agent
      .post("/api/auth/login")
      .send({ email: "priya@hostel.edu", password: "demo123" });
    expect(loginRes.status).toBe(200);

    const originalCookie = loginRes.headers["set-cookie"][0].split(";")[0];
    const rotated = await agent.post("/api/auth/refresh");
    expect(rotated.status).toBe(200);
    expect(rotated.body.accessToken).toBeTruthy();

    const replay = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", originalCookie);
    expect(replay.status).toBe(401);
  });

  it("verifies email and resets the password with one-time tokens", async () => {
    const reg = await register({
      name: "Flow User",
      email: "flow@hostel.edu",
      password: "startpass1",
    });
    expect(reg.res.status).toBe(201);
    expect(reg.res.body.user.emailVerified).toBe(false);
    expect(reg.res.body.verifyToken).toBeTruthy();

    const verify = await request(app)
      .post("/api/auth/verify-email")
      .send({ token: reg.res.body.verifyToken });
    expect(verify.status).toBe(200);

    const me = await auth(request(app).get("/api/auth/me"), reg.token);
    expect(me.body.user.emailVerified).toBe(true);

    const forgot = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "flow@hostel.edu" });
    expect(forgot.body.resetToken).toBeTruthy();

    const reset = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: forgot.body.resetToken, password: "secondpass2" });
    expect(reset.status).toBe(200);

    const relogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "flow@hostel.edu", password: "secondpass2" });
    expect(relogin.status).toBe(200);

    const reuse = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: forgot.body.resetToken, password: "thirdpass3" });
    expect(reuse.status).toBe(400);
  });

  it("revokes refresh tokens after a password change", async () => {
    const reg = await register({
      name: "Change User",
      email: "pwchange@hostel.edu",
      password: "oldpass11",
    });

    const change = await auth(
      reg.agent.patch(`/api/users/${reg.res.body.user._id}/password`),
      reg.token
    ).send({ currentPassword: "oldpass11", newPassword: "newpass22" });
    expect(change.status).toBe(200);

    const refresh = await reg.agent.post("/api/auth/refresh");
    expect(refresh.status).toBe(401);

    const relogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "pwchange@hostel.edu", password: "newpass22" });
    expect(relogin.status).toBe(200);
  });
});

describe("access scoping", () => {
  it("scopes batch lists by role and block", async () => {
    const aarav = await login("aarav@hostel.edu");
    const mine = await auth(request(app).get("/api/batches"), aarav.token);
    expect(mine.status).toBe(200);
    expect(mine.body.length).toBeGreaterThanOrEqual(3);
    expect(mine.body.every((batch) => batch.hostelBlock === "B6")).toBe(true);

    const ramesh = await login("ramesh@hostel.edu");
    const staff = await auth(request(app).get("/api/batches"), ramesh.token);
    expect(staff.body.every((batch) => batch.hostelBlock === "B6")).toBe(true);

    const all = await auth(request(app).get("/api/batches"), wardenToken);
    expect(all.body.length).toBeGreaterThanOrEqual(5);
  });

  it("never exposes password hashes in the user directory", async () => {
    const ramesh = await login("ramesh@hostel.edu");
    const res = await auth(request(app).get("/api/users"), ramesh.token);

    expect(res.status).toBe(200);
    expect(res.body.users.every((user) => user.password === undefined)).toBe(true);
    expect(res.body.byRole.student).toBeGreaterThan(0);
  });
});

describe("pricing and schedule rules", () => {
  it("prices XL server-side and rejects unknown sizes", async () => {
    const quote = await auth(
      request(app).post("/api/payments/calculate"),
      payerToken
    ).send({ itemEstimate: "xl" });

    expect(quote.status).toBe(200);
    expect(quote.body.items[0].price).toBe(350);
    expect(quote.body.total).toBe(368);

    const bad = await auth(
      request(app).post("/api/payments/calculate"),
      payerToken
    ).send({ itemEstimate: "gigantic" });
    expect(bad.status).toBe(400);
  });

  it("rejects submissions on a non-laundry day", async () => {
    const z9 = await register({
      name: "Zed Nine",
      email: "z9@hostel.edu",
      password: "z9pass123",
      hostelBlock: "Z9",
    });

    const res = await auth(
      request(app).post("/api/batches"),
      z9.token
    ).send({ description: "2 tees", itemEstimate: "small" });

    expect(res.status).toBe(400);
    expect(String(res.body.error)).toMatch(/laundry drop-off/i);
  });
});

describe("checkout", () => {
  it("prices, charges and creates a paid batch in one request", async () => {
    const body = {
      description: "2 tees and a hoodie",
      itemEstimate: "medium",
      method: "upi",
      idempotencyKey: "idem-test-key-0001",
    };

    const first = await auth(
      request(app).post("/api/payments/checkout"),
      payerToken
    ).send(body);

    expect(first.status).toBe(201);
    expect(first.body.payment.amount).toBe(189);
    expect(first.body.payment.breakdown.subtotal).toBe(180);
    expect(first.body.batch.paid).toBe(true);
    expect(first.body.batch.status).toBe("submitted");

    const replay = await auth(
      request(app).post("/api/payments/checkout"),
      payerToken
    ).send(body);

    expect(replay.status).toBe(200);
    expect(replay.body.replayed).toBe(true);
    expect(String(replay.body.payment._id)).toBe(String(first.body.payment._id));
  });

  it("applies a coupon once per user", async () => {
    const couponUser = await register({
      name: "Coupon User",
      email: "coupon@hostel.edu",
      password: "couponpass1",
      hostelBlock: "T1",
    });

    const first = await auth(
      request(app).post("/api/payments/checkout"),
      couponUser.token
    ).send({
      description: "coupon order",
      itemEstimate: "medium",
      couponCode: "WELCOME10",
      method: "upi",
      idempotencyKey: "coupon-key-0001",
    });

    expect(first.status).toBe(201);
    expect(first.body.payment.breakdown.discount).toBe(18);
    expect(first.body.payment.amount).toBe(170);

    const second = await auth(
      request(app).post("/api/payments/checkout"),
      couponUser.token
    ).send({
      description: "coupon order again",
      itemEstimate: "medium",
      couponCode: "WELCOME10",
      method: "upi",
      idempotencyKey: "coupon-key-0002",
    });

    expect(second.status).toBe(400);
  });

  it("recomputes the amount for /process and blocks double payment", async () => {
    const batchRes = await auth(
      request(app).post("/api/batches"),
      payerToken
    ).send({ description: "jeans", itemEstimate: "medium" });
    expect(batchRes.status).toBe(201);

    const tampered = await auth(
      request(app).post("/api/payments/process"),
      payerToken
    ).send({ batchId: batchRes.body._id, amount: 1, method: "upi" });

    expect(tampered.status).toBe(201);
    expect(tampered.body.payment.amount).toBe(189);

    const double = await auth(
      request(app).post("/api/payments/process"),
      payerToken
    ).send({ batchId: batchRes.body._id, method: "upi" });
    expect(double.status).toBe(409);
  });
});

describe("batch state machine", () => {
  it("blocks illegal transitions and lets a warden override with a reason", async () => {
    const created = await auth(
      request(app).post("/api/batches"),
      payerToken
    ).send({ description: "transition test", itemEstimate: "small" });
    const batchId = created.body._id;

    const studentMove = await auth(
      request(app).patch(`/api/batches/${batchId}/status`),
      payerToken
    ).send({ status: "received" });
    expect(studentMove.status).toBe(403);

    const ramesh = await login("ramesh@hostel.edu");
    const crossBlock = await auth(
      request(app).patch(`/api/batches/${batchId}/status`),
      ramesh.token
    ).send({ status: "received" });
    expect(crossBlock.status).toBe(404);

    const received = await auth(
      request(app).patch(`/api/batches/${batchId}/status`),
      wardenToken
    ).send({ status: "received" });
    expect(received.status).toBe(200);

    const skip = await auth(
      request(app).patch(`/api/batches/${batchId}/status`),
      wardenToken
    ).send({ status: "picked_up" });
    expect(skip.status).toBe(409);

    const reason = "Customer requested an expedited pickup";
    const forced = await auth(
      request(app).patch(`/api/batches/${batchId}/status`),
      wardenToken
    ).send({ status: "picked_up", reason });
    expect(forced.status).toBe(200);

    const history = forced.body.statusHistory;
    const last = history[history.length - 1];
    expect(last.status).toBe("picked_up");
    expect(last.byName).toBe("Meera Iyer");
    expect(last.reason).toBe(reason);
  });
});

describe("account administration", () => {
  it("prevents a warden from deleting themselves", async () => {
    const users = await auth(request(app).get("/api/admin/users"), wardenToken);
    const meera = users.body.find((user) => user.email === "meera@hostel.edu");

    const res = await auth(
      request(app).delete(`/api/admin/users/${meera.id}`),
      wardenToken
    );
    expect(res.status).toBe(400);
  });

  it("soft-deletes a user and revokes their login", async () => {
    const victim = await register({
      name: "Delete Me",
      email: "victim@hostel.edu",
      password: "victimpass1",
    });

    const removed = await auth(
      request(app).delete(`/api/admin/users/${victim.res.body.user._id}`),
      wardenToken
    );
    expect(removed.status).toBe(200);

    const blockedLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "victim@hostel.edu", password: "victimpass1" });
    expect(blockedLogin.status).toBe(401);

    const list = await auth(request(app).get("/api/admin/users"), wardenToken);
    expect(list.body.some((user) => user.email === "victim@hostel.edu")).toBe(false);
  });
});

describe("support and reviews", () => {
  it("routes support tickets to the warden queue", async () => {
    const ticket = await auth(
      request(app).post("/api/support"),
      payerToken
    ).send({
      subject: "Missing sock",
      message: "One black sock is missing from my batch.",
    });
    expect(ticket.status).toBe(201);
    expect(ticket.body.ticketId).toBeTruthy();

    const queue = await auth(request(app).get("/api/support"), wardenToken);
    expect(queue.status).toBe(200);
    expect(queue.body.some((item) => item.subject === "Missing sock")).toBe(true);
  });

  it("returns aggregate review stats without leaking reviewers", async () => {
    const res = await request(app).get("/api/reviews");

    expect(res.status).toBe(200);
    expect(typeof res.body.average).toBe("number");
    expect(typeof res.body.total).toBe("number");
    expect(res.body.reviews.every((review) => review.user === undefined)).toBe(true);
  });
});
