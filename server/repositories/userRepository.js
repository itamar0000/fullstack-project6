import pool from "../db/pool.js";

// ── users table ──────────────────────────────────────────────────────────────

export async function findAll() {
  const [rows] = await pool.execute("SELECT * FROM users ORDER BY id");
  return rows;
}

export async function findByUsername(username) {
  const [[row]] = await pool.execute("SELECT * FROM users WHERE username = ?", [username]);
  return row || null;
}

export async function findById(id) {
  const [[row]] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
  return row || null;
}

export async function existsByUsername(username) {
  const [rows] = await pool.execute("SELECT id FROM users WHERE username = ?", [username]);
  return rows.length > 0;
}

export async function create(user) {
  const [r] = await pool.execute(
    `INSERT INTO users (name,username,email,phone,website,street,suite,city,zipcode,company_name,company_catchphrase,company_bs)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      user.name, user.username, user.email, user.phone, user.website,
      user.street, user.suite, user.city, user.zipcode,
      user.company_name, user.company_catchphrase, user.company_bs,
    ]
  );
  return findById(r.insertId);
}

export async function update(id, fields) {
  await pool.execute(
    `UPDATE users SET name=?,username=?,email=?,phone=?,website=?,
     street=?,suite=?,city=?,zipcode=?,company_name=?,company_catchphrase=?,company_bs=? WHERE id=?`,
    [
      fields.name, fields.username, fields.email, fields.phone, fields.website,
      fields.street, fields.suite, fields.city, fields.zipcode,
      fields.company_name, fields.company_catchphrase, fields.company_bs, id,
    ]
  );
  return findById(id);
}

export async function remove(id) {
  await pool.execute("DELETE FROM users WHERE id = ?", [id]);
}

export async function setBlocked(id, blocked) {
  await pool.execute("UPDATE users SET is_blocked = ? WHERE id = ?", [blocked ? 1 : 0, id]);
  return findById(id);
}

export async function setAdmin(id, isAdmin) {
  await pool.execute("UPDATE users SET is_admin = ? WHERE id = ?", [isAdmin ? 1 : 0, id]);
  return findById(id);
}

// ── user_passwords table ─────────────────────────────────────────────────────

export async function getPasswordHash(userId) {
  const [[record]] = await pool.execute(
    "SELECT password FROM user_passwords WHERE user_id = ?",
    [userId]
  );
  return record ? record.password : null;
}

export async function createPassword(userId, hash) {
  await pool.execute(
    "INSERT INTO user_passwords (user_id, password) VALUES (?,?)",
    [userId, hash]
  );
}

export async function updatePassword(userId, hash) {
  await pool.execute(
    "UPDATE user_passwords SET password = ? WHERE user_id = ?",
    [hash, userId]
  );
}
