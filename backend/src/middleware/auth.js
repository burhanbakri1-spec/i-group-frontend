import { sessions } from "../data/store.js";

export function getSessionUser(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  return token ? sessions.get(token) || null : null;
}

export function requireAuth(req, res, next) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ message: "Authentication required." });
  }
  req.user = user;
  return next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  return next();
}

export function publicUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}
