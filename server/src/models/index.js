import dotenv from "dotenv";
dotenv.config();

/**
 * Model adapter — exports either real Mongoose models or mock in-memory models
 * depending on the MOCK_MODE environment variable.
 */

const useMock = process.env.MOCK_MODE === "true";

let User, LaundryTimings, LaundryBatch, Notification, Payment, Coupon, Review, Service;

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
} else {
  const real = await import("./User.js");
  const timings = await import("./LaundryTimings.js");
  const batch = await import("./LaundryBatch.js");
  const notification = await import("./Notification.js");
  const payment = await import("./Payment.js");
  const coupon = await import("./Coupon.js");
  const review = await import("./Review.js");
  const service = await import("./Service.js");
  User = real.default;
  LaundryTimings = timings.default;
  LaundryBatch = batch.default;
  Notification = notification.default;
  Payment = payment.default;
  Coupon = coupon.default;
  Review = review.default;
  Service = service.default;
}

export { User, LaundryTimings, LaundryBatch, Notification, Payment, Coupon, Review, Service };
