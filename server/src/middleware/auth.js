import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

/**
 * Verifies the JWT and attaches req.userId + req.user
 * (id, name, email, role, hostelBlock) for role-aware routing.
 */
export async function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Account no longer exists" });
    }

    req.userId = decoded.userId;
    req.user = {
      id: String(user._id),
      name: user.name || "",
      email: user.email || "",
      role: user.role || "student",
      hostelBlock: (user.hostelBlock || "").trim(),
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/** Route guard: only allows the given roles through. */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No token provided" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized for this action" });
    }
    next();
  };
}
