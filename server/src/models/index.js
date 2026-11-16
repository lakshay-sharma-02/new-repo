import { config } from "../config.js";

/**
 * Model adapter — exports either real Mongoose models or mock in-memory
 * models depending on MOCK_MODE. Both must satisfy the same contract; the
 * server test suite runs against mock mode.
 */

const useMock = config.mockMode;

let User,
  LaundryTimings,
  LaundryBatch,
  Notification,
  Payment,
  Coupon,
  Review,
  Service,
  AuthToken,
  SupportTicket;

if (useMock) {
  const mock = await import("../mock/models.js");
  User = mock.MockUser;
  LaundryTimings = mock.MockLaundryTimings;
  LaundryBatch = mock.MockLaundryBatch;
  Notification = mock.MockNotification;
  Payment = mock.MockPayment;
  Coupon = mock.MockCoupon;
  Review = mock.MockReview;
  Service = mock.MockService;
  AuthToken = mock.MockAuthToken;
  SupportTicket = mock.MockSupportTicket;
} else {
  const real = await import("./User.js");
  const timings = await import("./LaundryTimings.js");
  const batch = await import("./LaundryBatch.js");
  const notification = await import("./Notification.js");
  const payment = await import("./Payment.js");
  const coupon = await import("./Coupon.js");
  const review = await import("./Review.js");
  const service = await import("./Service.js");
  const authToken = await import("./AuthToken.js");
  const supportTicket = await import("./SupportTicket.js");
  User = real.default;
  LaundryTimings = timings.default;
  LaundryBatch = batch.default;
  Notification = notification.default;
  Payment = payment.default;
  Coupon = coupon.default;
  Review = review.default;
  Service = service.default;
  AuthToken = authToken.default;
  SupportTicket = supportTicket.default;
}

export {
  User,
  LaundryTimings,
  LaundryBatch,
  Notification,
  Payment,
  Coupon,
  Review,
  Service,
  AuthToken,
  SupportTicket,
};
