import { config } from "../config.js";

/**
 * Cookie-authenticated endpoints are also origin-checked. Browsers always
 * send Origin on cross-site POSTs; same-origin requests may omit it.
 */
export function requireTrustedOrigin(req, res, next) {
  const origin = req.headers.origin;
  if (!origin || config.corsOrigins.includes(origin)) return next();
  return res.status(403).json({ error: "Untrusted origin" });
}
