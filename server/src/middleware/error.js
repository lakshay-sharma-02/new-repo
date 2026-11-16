import { AppError } from "../lib/errors.js";

export function notFound(req, res) {
  res.status(404).json({
    error: `Not found: ${req.method} ${req.originalUrl}`,
    requestId: req.id,
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status =
    err.status ||
    (err.name === "ValidationError"
      ? 400
      : err.name === "CastError"
        ? 400
        : err.code === 11000
          ? 409
          : 500);

  if (status >= 500) {
    console.error(`[${req.id || "-"}]`, err.stack || err);
  }

  const body = {
    error: status >= 500 ? "Something went wrong" : err.message || "Request failed",
    requestId: req.id,
  };
  if (err.details) body.details = err.details;
  return res.status(status).json(body);
}

export function assertFound(doc, message = "Not found") {
  if (!doc) throw new AppError(404, message);
  return doc;
}
