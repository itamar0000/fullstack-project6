import { Router } from "express";
import pool from "../db.js";
import { logAction } from "../audit.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { rowToUser } from "../userMapper.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", async (_req, res) => {
  const [rows] = await pool.execute("SELECT * FROM users ORDER BY id");
  res.json(rows.map(rowToUser));
});

router.patch("/users/:id/block", async (req, res) => {
  const targetId = Number(req.params.id);
  const blocked = Boolean(req.body.blocked);

  if (targetId === req.userId) {
    return res.status(400).json({ message: "Admins cannot block their own account" });
  }

  const [[target]] = await pool.execute("SELECT * FROM users WHERE id = ?", [targetId]);
  if (!target) return res.status(404).json({ message: "User not found" });
  if (target.is_admin) return res.status(400).json({ message: "Admin accounts cannot be blocked" });

  await pool.execute("UPDATE users SET is_blocked = ? WHERE id = ?", [blocked ? 1 : 0, targetId]);
  await logAction(req.userId, blocked ? "BLOCK_USER" : "UNBLOCK_USER", "users", targetId);

  const [[updated]] = await pool.execute("SELECT * FROM users WHERE id = ?", [targetId]);
  res.json(rowToUser(updated));
});

router.patch("/users/:id/admin", async (req, res) => {
  const targetId = Number(req.params.id);

  const [[target]] = await pool.execute("SELECT * FROM users WHERE id = ?", [targetId]);
  if (!target) return res.status(404).json({ message: "User not found" });
  if (target.is_blocked) {
    return res.status(400).json({ message: "Blocked users cannot be promoted to admin" });
  }

  if (!target.is_admin) {
    await pool.execute("UPDATE users SET is_admin = 1 WHERE id = ?", [targetId]);
    await logAction(req.userId, "PROMOTE_ADMIN", "users", targetId);
  }

  const [[updated]] = await pool.execute("SELECT * FROM users WHERE id = ?", [targetId]);
  res.json(rowToUser(updated));
});

router.get("/audit-logs", async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT l.id, l.actorId, u.username AS actorUsername, l.action, l.targetType,
            l.targetId, l.details, l.createdAt
     FROM audit_logs l
     LEFT JOIN users u ON l.actorId = u.id
     ORDER BY l.id DESC
     LIMIT 100`
  );

  res.json(rows.map((row) => ({
    ...row,
    details: row.details ? JSON.parse(row.details) : null
  })));
});

export default router;
