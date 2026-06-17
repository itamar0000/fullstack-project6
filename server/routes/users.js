import { Router } from "express";
import bcrypt from "bcryptjs";
import { logAction } from "../repositories/auditRepository.js";
import { requireAuth } from "../middleware/auth.js";
import { rowToUser } from "../utils/userMapper.js";
import * as userRepo from "../repositories/userRepository.js";

const router = Router();

// GET /users or /users?username=x  (no password involved — public profile lookup only)
router.get("/", async (req, res) => {
  const { username } = req.query;
  const rows = username
    ? [await userRepo.findByUsername(username)].filter(Boolean)
    : await userRepo.findAll();
  res.json(rows.map(rowToUser));
});

// GET /users/:id
router.get("/:id", async (req, res) => {
  const row = await userRepo.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "User not found" });
  res.json(rowToUser(row));
});

// POST /users  (register)
router.post("/", async (req, res) => {
  const { name, username, email, phone, password, website = "", address = {}, company = {} } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (await userRepo.existsByUsername(username)) {
    return res.status(409).json({ message: "Username already taken" });
  }

  const newUser = await userRepo.create({
    name, username, email, phone, website,
    street: address.street || "", suite: address.suite || "", city: address.city || "", zipcode: address.zipcode || "",
    company_name: company.name || "", company_catchphrase: company.catchPhrase || "", company_bs: company.bs || "",
  });

  const hash = await bcrypt.hash(password, 10);
  await userRepo.createPassword(newUser.id, hash);
  await logAction(newUser.id, "REGISTER_USER", "users", newUser.id, { username });

  res.status(201).json(rowToUser(newUser));
});

// PUT/PATCH /users/:id  (only the authenticated user may edit their own profile)
router.put("/:id", requireAuth, handleUpdate);
router.patch("/:id", requireAuth, handleUpdate);

async function handleUpdate(req, res) {
  const id = req.params.id;
  if (Number(id) !== req.userId) {
    return res.status(403).json({ message: "You can only edit your own profile" });
  }

  const { name, username, email, phone, website, address = {}, company = {} } = req.body;

  const existing = await userRepo.findById(id);
  if (!existing) return res.status(404).json({ message: "User not found" });

  const updated = await userRepo.update(id, {
    name: name ?? existing.name,
    username: username ?? existing.username,
    email: email ?? existing.email,
    phone: phone ?? existing.phone,
    website: website ?? existing.website,
    street: address.street ?? existing.street,
    suite: address.suite ?? existing.suite,
    city: address.city ?? existing.city,
    zipcode: address.zipcode ?? existing.zipcode,
    company_name: company.name ?? existing.company_name,
    company_catchphrase: company.catchPhrase ?? existing.company_catchphrase,
    company_bs: company.bs ?? existing.company_bs,
  });

  await logAction(req.userId, "UPDATE_PROFILE", "users", Number(id), { username: updated.username });
  res.json(rowToUser(updated));
}

// PATCH /users/:id/password  (only the authenticated user may change their password)
router.patch("/:id/password", requireAuth, async (req, res) => {
  const id = req.params.id;
  if (Number(id) !== req.userId) {
    return res.status(403).json({ message: "You can only change your own password" });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required" });
  }

  const hash = await userRepo.getPasswordHash(id);
  if (!hash) return res.status(404).json({ message: "Password record not found" });

  const matches = await bcrypt.compare(currentPassword, hash);
  if (!matches) return res.status(401).json({ message: "Current password is incorrect" });

  await userRepo.updatePassword(id, await bcrypt.hash(newPassword, 10));
  await logAction(req.userId, "CHANGE_PASSWORD", "users", Number(id));

  res.json({ message: "Password changed" });
});

// DELETE /users/:id  (only the authenticated user may delete their own account)
router.delete("/:id", requireAuth, async (req, res) => {
  if (Number(req.params.id) !== req.userId) {
    return res.status(403).json({ message: "You can only delete your own account" });
  }
  await logAction(req.userId, "DELETE_USER", "users", Number(req.params.id));
  await userRepo.remove(req.params.id);
  res.json({});
});

export default router;
