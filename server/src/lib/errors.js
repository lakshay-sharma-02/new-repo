/** Typed application error with an HTTP status and optional details. */
export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
  }
}

/** Wrap an async route so rejected promises reach the error middleware. */
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/** Log the real error, return a generic message (no internals to clients). */
export function sendServerError(res, err) {
  console.error(err);
  return res.status(500).json({ error: "Something went wrong" });
}
