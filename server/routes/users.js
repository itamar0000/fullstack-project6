import { Router } from "express";
import pool from "../db.js";

const router = Router();

function rowToUser(r) {
  return {
    id: r.id,
    name: r.name,
    username: r.username,
    email: r.email,
    phone: r.phone,
    website: r.website,
    address: {
      street: r.street,
      suite: r.suite,
      city: r.city,
      zipcode: r.zipcode,
    },
    company: {
      name: r.company_name,
      catchPhrase: r.company_catchphrase,
      bs: r.company_bs,
    },
  };
}

// GET /users or /users?username=x or /users?username=x&website=pw
router.get("/", async (req, res) => {
  const { username, website } = req.query;

  let sql = "SELECT * FROM users";
  const params = [];

  if (username) {
    sql += " WHERE username = ?";
    params.push(username);
    // if website (password) provided, verify against user_passwords
    if (website) {
      const [rows] = await pool.execute(sql, params);
      if (!rows.length) return res.json([]);
      const user = rows[0];
      const [[pwd]] = await pool.execute(
        "SELECT password FROM user_passwords WHERE user_id = ?",
        [user.id]
      );
      if (!pwd || pwd.password !== website) return res.json([]);
      return res.json([rowToUser(user)]);
    }
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
  const { name, username, email, phone, website, address = {}, company = {} } = req.body;

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
  await pool.execute(
    "INSERT INTO user_passwords (user_id, password) VALUES (?,?)",
    [newId, website || ""]
  );

  const [[newUser]] = await pool.execute("SELECT * FROM users WHERE id = ?", [newId]);
  res.status(201).json(rowToUser(newUser));
});

// PUT/PATCH /users/:id
router.put("/:id", handleUpdate);
router.patch("/:id", handleUpdate);

async function handleUpdate(req, res) {
  const { name, username, email, phone, website, address = {}, company = {} } = req.body;
  const id = req.params.id;

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

  if (website !== undefined) {
    await pool.execute(
      "INSERT INTO user_passwords (user_id,password) VALUES (?,?) ON DUPLICATE KEY UPDATE password=?",
      [id, website, website]
    );
  }

  const [[updated]] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
  res.json(rowToUser(updated));
}

// DELETE /users/:id
router.delete("/:id", async (req, res) => {
  await pool.execute("DELETE FROM users WHERE id = ?", [req.params.id]);
  res.json({});
});

export default router;
