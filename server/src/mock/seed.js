import {
  MockUser,
  MockLaundryTimings,
  MockLaundryBatch,
  MockNotification,
  MockPayment,
  MockCoupon,
  MockReview,
  MockService,
} from "./models.js";

/**
 * Seeds the in-memory store with a full demo world:
 *  - 2 students (B6, C3), 2 laundry staff (one per block), 1 warden
 *  - Published laundry schedules per block (owned by staff)
 *  - Batches in various stages, incl. one with an open issue
 *  - A couple of notifications so the bell isn't empty
 */
export async function seedDemoData() {
  const now = new Date();
  const hoursAgo = (h) => new Date(now - h * 3600000).toISOString();
  const daysFromNow = (d, hour = 18) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + d);
    dt.setHours(hour, 0, 0, 0);
    return dt.toISOString();
  };

  // ----- Users: students / staff / warden -----
  const aarav = await MockUser.create({
    name: "Aarav Mehta",
    email: "aarav@hostel.edu",
    password: "demo123",
    hostelBlock: "B6",
    role: "student",
  });
  const priya = await MockUser.create({
    name: "Priya Sharma",
    email: "priya@hostel.edu",
    password: "demo123",
    hostelBlock: "C3",
    role: "student",
  });
  const ramesh = await MockUser.create({
    name: "Ramesh Kumar",
    email: "ramesh@hostel.edu",
    password: "demo123",
    hostelBlock: "B6",
    role: "staff",
  });
  const suresh = await MockUser.create({
    name: "Suresh Rao",
    email: "suresh@hostel.edu",
    password: "demo123",
    hostelBlock: "C3",
    role: "staff",
  });
  const meera = await MockUser.create({
    name: "Meera Iyer",
    email: "meera@hostel.edu",
    password: "demo123",
    hostelBlock: "ALL",
    role: "warden",
  });

  // ----- Published block schedules (owned by block staff) -----
  await MockLaundryTimings.create({
    user: ramesh._id,
    hostelBlock: "B6",
    laundryDays: ["Mon", "Wed", "Fri"],
    dropoffStart: "09:00",
    dropoffEnd: "12:00",
    pickupStart: "16:00",
    pickupEnd: "18:00",
    cutoffTime: "12:00",
    turnaroundDays: 2,
  });
  await MockLaundryTimings.create({
    user: suresh._id,
    hostelBlock: "C3",
    laundryDays: ["Tue", "Thu", "Sat"],
    dropoffStart: "10:00",
    dropoffEnd: "13:00",
    pickupStart: "17:00",
    pickupEnd: "19:00",
    cutoffTime: "13:00",
    turnaroundDays: 3,
  });

  // ----- Batches (B6 — Aarav) -----
  const b1 = await MockLaundryBatch.create({
    user: aarav._id,
    hostelBlock: "B6",
    status: "washing",
    description: "2 shirts, 3 t-shirts, 1 pair jeans",
    itemEstimate: "medium",
    estimatedReady: daysFromNow(2),
    statusHistory: [
      { status: "submitted", updatedAt: hoursAgo(26) },
      { status: "received", updatedAt: hoursAgo(20) },
      { status: "washing", updatedAt: hoursAgo(1) },
    ],
  });

  const b2 = await MockLaundryBatch.create({
    user: aarav._id,
    hostelBlock: "B6",
    status: "ready",
    description: "4 t-shirts, 2 shorts",
    itemEstimate: "small",
    estimatedReady: daysFromNow(1),
    statusHistory: [
      { status: "submitted", updatedAt: hoursAgo(50) },
      { status: "received", updatedAt: hoursAgo(44) },
      { status: "washing", updatedAt: hoursAgo(30) },
      { status: "drying", updatedAt: hoursAgo(20) },
      { status: "folding", updatedAt: hoursAgo(8) },
      { status: "ready", updatedAt: hoursAgo(2) },
    ],
  });

  await MockLaundryBatch.create({
    user: aarav._id,
    hostelBlock: "B6",
    status: "picked_up",
    description: "Bed sheets, pillow covers",
    itemEstimate: "medium",
    estimatedReady: daysFromNow(-1),
    statusHistory: [
      { status: "submitted", updatedAt: hoursAgo(100) },
      { status: "received", updatedAt: hoursAgo(94) },
      { status: "washing", updatedAt: hoursAgo(80) },
      { status: "drying", updatedAt: hoursAgo(60) },
      { status: "folding", updatedAt: hoursAgo(48) },
      { status: "ready", updatedAt: hoursAgo(26) },
      { status: "picked_up", updatedAt: hoursAgo(4) },
    ],
  });

  // ----- Batch with an open issue (C3 — Priya) -----
  const b4 = await MockLaundryBatch.create({
    user: priya._id,
    hostelBlock: "C3",
    status: "folding",
    description: "1 kurta, 3 tops, 2 pants",
    itemEstimate: "medium",
    estimatedReady: daysFromNow(2),
    statusHistory: [
      { status: "submitted", updatedAt: hoursAgo(48) },
      { status: "received", updatedAt: hoursAgo(42) },
      { status: "washing", updatedAt: hoursAgo(30) },
      { status: "drying", updatedAt: hoursAgo(16) },
      { status: "folding", updatedAt: hoursAgo(3) },
    ],
    issueReported: true,
    issueDescription: "One white top has a blue stain — looks like it was washed with dark clothes.",
  });

  // A C3 batch that's ready so the C3 staff console isn't empty
  await MockLaundryBatch.create({
    user: priya._id,
    hostelBlock: "C3",
    status: "ready",
    description: "Jeans, 2 kurtas, 4 tops",
    itemEstimate: "medium",
    estimatedReady: daysFromNow(1),
    statusHistory: [
      { status: "submitted", updatedAt: hoursAgo(70) },
      { status: "received", updatedAt: hoursAgo(64) },
      { status: "washing", updatedAt: hoursAgo(52) },
      { status: "drying", updatedAt: hoursAgo(40) },
      { status: "folding", updatedAt: hoursAgo(28) },
      { status: "ready", updatedAt: hoursAgo(6) },
    ],
  });

  // ----- Notifications (seeded so the bell demos immediately) -----
  await MockNotification.create({
    user: aarav._id,
    type: "status",
    title: "Ready for pickup 🎉",
    message: "Your batch “4 t-shirts, 2 shorts” is ready. Pickup window: 4–6 PM.",
    batch: b2._id,
  });
  await MockNotification.create({
    user: aarav._id,
    type: "status",
    title: "Batch update",
    message: "Your batch “2 shirts, 3 t-shirts, 1 pair jeans” is now being washed.",
    batch: b1._id,
  });
  await MockNotification.create({
    user: priya._id,
    type: "issue",
    title: "Issue received",
    message: "Suresh Rao (C3) has been alerted about the stain on your white top and will take a look.",
    batch: b4._id,
  });

  // ----- Service tiers -----
  const standard = await MockService.create({
    name: "Standard",
    priceSmall: 120,
    priceMedium: 180,
    priceLarge: 250,
    priceXL: 350,
    description: "Standard laundry service — wash, dry, fold",
    isDefault: true,
  });
  await MockService.create({
    name: "Express",
    priceSmall: 180,
    priceMedium: 250,
    priceLarge: 350,
    priceXL: 480,
    description: "Express 24h turnaround — priority lane",
    isDefault: false,
  });

  // ----- Coupons -----
  await MockCoupon.create({
    code: "WELCOME10",
    discountType: "percentage",
    value: 10,
    minOrderAmount: 0,
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    usageLimit: 100,
    usedCount: 2,
    active: true,
  });
  await MockCoupon.create({
    code: "BULK500",
    discountType: "fixed",
    value: 50,
    minOrderAmount: 500,
    expiryDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    usageLimit: 25,
    usedCount: 8,
    active: true,
  });
  await MockCoupon.create({
    code: "STUDENT20",
    discountType: "percentage",
    value: 20,
    minOrderAmount: 200,
    expiryDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    usageLimit: 50,
    usedCount: 12,
    active: true,
  });

  // ----- Payments (demo) -----
  // Reference the picked_up batch created above (the third B6 batch)
  const pickedUpBatchId = (await MockLaundryBatch.find({})).find((b) => b.status === "picked_up")?._id || b1._id;

  await MockPayment.create({
    user: aarav._id,
    batch: pickedUpBatchId,
    amount: 189,
    currency: "INR",
    status: "success",
    method: "upi",
    paidAt: hoursAgo(100),
    transactionRef: "txn_DEMOAARAV1",
    breakdown: {
      subtotal: 180,
      discount: 0,
      tax: 9,
      total: 189,
      couponCode: "",
      items: [{ type: "medium", count: 1, price: 180 }],
    },
    invoiceUrl: "/api/payments/inv_aarav01/invoice",
  });
  await MockPayment.create({
    user: aarav._id,
    batch: b2._id,
    amount: 209,
    currency: "INR",
    status: "success",
    method: "card",
    paidAt: hoursAgo(50),
    transactionRef: "txn_DEMOAARAV2",
    breakdown: {
      subtotal: 200,
      discount: 10,
      tax: 10,
      total: 200,
      couponCode: "WELCOME10",
      items: [{ type: "small", count: 1, price: 120 }],
    },
    invoiceUrl: "/api/payments/inv_aarav02/invoice",
  });
  await MockPayment.create({
    user: aarav._id,
    batch: b1._id,
    amount: 378,
    currency: "INR",
    status: "success",
    method: "netbanking",
    paidAt: hoursAgo(26),
    transactionRef: "txn_DEMOAARAV3",
    breakdown: {
      subtotal: 360,
      discount: 0,
      tax: 18,
      total: 378,
      couponCode: "",
      items: [{ type: "medium", count: 2, price: 180 }],
    },
    invoiceUrl: "/api/payments/inv_aarav03/invoice",
  });
  // A failed payment for demo
  await MockPayment.create({
    user: priya._id,
    batch: b4._id,
    amount: 189,
    currency: "INR",
    status: "failed",
    method: "upi",
    paidAt: null,
    transactionRef: "txn_DEMOPRIYA1",
    breakdown: {
      subtotal: 180,
      discount: 0,
      tax: 9,
      total: 189,
      couponCode: "",
      items: [{ type: "medium", count: 1, price: 180 }],
    },
    invoiceUrl: "",
  });
  await MockPayment.create({
    user: priya._id,
    batch: null,
    amount: 630,
    currency: "INR",
    status: "success",
    method: "upi",
    paidAt: hoursAgo(4),
    transactionRef: "txn_DEMOPRIYA2",
    breakdown: {
      subtotal: 650,
      discount: 50,
      tax: 30,
      total: 630,
      couponCode: "BULK500",
      items: [{ type: "xl", count: 1, price: 350 }, { type: "large", count: 1, price: 250 }],
    },
    invoiceUrl: "/api/payments/inv_priya01/invoice",
  });

  // ----- Reviews (on picked-up / completed batches) -----
  await MockReview.create({
    user: aarav._id,
    batch: pickedUpBatchId,
    rating: 5,
    comment: "Fast turnaround, clothes came back spotless. The live tracker was a game-changer — no more guessing!",
    anonymousName: "Aarav M.",
    anonymous: true,
  });
  await MockReview.create({
    user: priya._id,
    batch: null,
    rating: 4,
    comment: "Really good service overall. The stain issue was resolved quickly once staff saw my report.",
    anonymousName: "Priya S.",
    anonymous: true,
  });
  await MockReview.create({
    user: aarav._id,
    batch: null,
    rating: 3,
    comment: "Decent service but pickup windows are tight. Would love more flexible hours.",
    anonymousName: "Aarav M.",
    anonymous: true,
  });

  console.log("✅ Demo world seeded:");
  console.log("   Students: aarav@hostel.edu, priya@hostel.edu   (demo123)");
  console.log("   Staff:    ramesh@hostel.edu (B6), suresh@hostel.edu (C3)   (demo123)");
  console.log("   Warden:   meera@hostel.edu   (demo123)");
  console.log("   Schedules published for B6 (Mon/Wed/Fri) and C3 (Tue/Thu/Sat)");
  console.log("   Batches: Aarav x3 (washing · ready · picked_up), Priya x2 (folding+issue · ready)");
  console.log("   Services: Standard (default) + Express");
  console.log("   Coupons: WELCOME10 (10%), BULK500 (₹50 off), STUDENT20 (20% off)");
  console.log("   Payments: 4 success + 1 failed");
  console.log("   Reviews: 3 (5★, 4★, 3★)");
}
