import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import pool from "../db.js";

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      isAdmin: !!user.is_admin
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    req.isAdmin = !!payload.isAdmin;

    const [[user]] = await pool.execute(
      "SELECT is_admin, is_blocked FROM users WHERE id = ?",
      [payload.id]
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    if (user.is_blocked) {
      return res.status(403).json({ message: "This account is blocked" });
    }

    req.isAdmin = !!user.is_admin;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}
