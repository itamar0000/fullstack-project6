import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import { logAction } from "../audit.js";
import { requireAuth } from "../middleware/auth.js";
import { rowToUser } from "../userMapper.js";

const router = Router();

// GET /users or /users?username=x  (no password involved — public profile lookup only)
router.get("/", async (req, res) => {
  const { username } = req.query;

  let sql = "SELECT * FROM users";
  const params = [];
  if (username) {
    sql += " WHERE username = ?";
    params.push(username);
  }

  const [rows] = await pool.execute(sql, params);
  res.json(rows.map(rowToUser));
});

// GET /users/:id
router.get("/:id", async (req, res) => {
  const [[row]] = await pool.execute("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!row) return res.status(404).json({ message: "User not found" });
  res.json(rowToUser(row));
});

// POST /users  (register)
router.post("/", async (req, res) => {
  const { name, username, email, phone, password, website = "", address = {}, company = {} } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const [existing] = await pool.execute("SELECT id FROM users WHERE username = ?", [username]);
  if (existing.length) return res.status(409).json({ message: "Username already taken" });

  const [result] = await pool.execute(
    `INSERT INTO users (name,username,email,phone,website,street,suite,city,zipcode,company_name,company_catchphrase,company_bs)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      name, username, email, phone, website,
      address.street || "", address.suite || "", address.city || "", address.zipcode || "",
      company.name || "", company.catchPhrase || "", company.bs || "",
    ]
  );

  const newId = result.insertId;
  const hash = await bcrypt.hash(password, 10);
  await pool.execute(
    "INSERT INTO user_passwords (user_id, password) VALUES (?,?)",
    [newId, hash]
  );
  await logAction(newId, "REGISTER_USER", "users", newId, { username });

  const [[newUser]] = await pool.execute("SELECT * FROM users WHERE id = ?", [newId]);
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

  const [[existing]] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
  if (!existing) return res.status(404).json({ message: "User not found" });

  const merged = {
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
  };

  await pool.execute(
    `UPDATE users SET name=?,username=?,email=?,phone=?,website=?,
     street=?,suite=?,city=?,zipcode=?,company_name=?,company_catchphrase=?,company_bs=? WHERE id=?`,
    [...Object.values(merged), id]
  );

  const [[updated]] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
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

  const [[record]] = await pool.execute(
    "SELECT password FROM user_passwords WHERE user_id = ?",
    [id]
  );
  if (!record) return res.status(404).json({ message: "Password record not found" });

  const matches = await bcrypt.compare(currentPassword, record.password);
  if (!matches) return res.status(401).json({ message: "Current password is incorrect" });

  const hash = await bcrypt.hash(newPassword, 10);
  await pool.execute("UPDATE user_passwords SET password = ? WHERE user_id = ?", [hash, id]);
  await logAction(req.userId, "CHANGE_PASSWORD", "users", Number(id));

  res.json({ message: "Password changed" });
});

// DELETE /users/:id  (only the authenticated user may delete their own account)
router.delete("/:id", requireAuth, async (req, res) => {
  if (Number(req.params.id) !== req.userId) {
    return res.status(403).json({ message: "You can only delete your own account" });
  }
  await logAction(req.userId, "DELETE_USER", "users", Number(req.params.id));
  await pool.execute("DELETE FROM users WHERE id = ?", [req.params.id]);
  res.json({});
});

export default router;
