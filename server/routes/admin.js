import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { rowToUser } from "../utils/userMapper.js";
import * as userRepo from "../repositories/userRepository.js";
import * as auditRepo from "../repositories/auditRepository.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", async (_req, res) => {
  const rows = await userRepo.findAll();
  res.json(rows.map(rowToUser));
});

router.patch("/users/:id/block", async (req, res) => {
  const targetId = Number(req.params.id);
  const blocked = Boolean(req.body.blocked);

  if (targetId === req.userId) {
    return res.status(400).json({ message: "Admins cannot block their own account" });
  }

  const target = await userRepo.findById(targetId);
  if (!target) return res.status(404).json({ message: "User not found" });
  if (target.is_admin) return res.status(400).json({ message: "Admin accounts cannot be blocked" });

  const updated = await userRepo.setBlocked(targetId, blocked);
  await auditRepo.logAction(req.userId, blocked ? "BLOCK_USER" : "UNBLOCK_USER", "users", targetId);

  res.json(rowToUser(updated));
});

router.patch("/users/:id/admin", async (req, res) => {
  const targetId = Number(req.params.id);

  const target = await userRepo.findById(targetId);
  if (!target) return res.status(404).json({ message: "User not found" });
  if (target.is_blocked) {
    return res.status(400).json({ message: "Blocked users cannot be promoted to admin" });
  }

  if (!target.is_admin) {
    await userRepo.setAdmin(targetId, true);
    await auditRepo.logAction(req.userId, "PROMOTE_ADMIN", "users", targetId);
  }

  const updated = await userRepo.findById(targetId);
  res.json(rowToUser(updated));
});

router.get("/audit-logs", async (_req, res) => {
  const rows = await auditRepo.listRecent(100);
  res.json(rows.map((row) => ({
    ...row,
    details: row.details ? JSON.parse(row.details) : null
  })));
});

export default router;
