import pool from "../db/pool.js";

export async function countByUser(userId) {
  const sql = "SELECT COUNT(*) AS total FROM albums" + (userId ? " WHERE userId = ?" : "");
  const [[{ total }]] = await pool.execute(sql, userId ? [userId] : []);
  return total;
}

export async function findPage({ userId, limit, offset }) {
  let sql = "SELECT * FROM albums" + (userId ? " WHERE userId = ?" : "");
  sql += ` ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
  const [rows] = await pool.execute(sql, userId ? [userId] : []);
  return rows;
}

export async function findById(id) {
  const [[row]] = await pool.execute("SELECT * FROM albums WHERE id = ?", [id]);
  return row || null;
}

export async function create({ userId, title }) {
  const [r] = await pool.execute(
    "INSERT INTO albums (userId, title) VALUES (?,?)",
    [userId, title]
  );
  return findById(r.insertId);
}

export async function update(id, { title }) {
  await pool.execute("UPDATE albums SET title=? WHERE id=?", [title, id]);
  return findById(id);
}

export async function remove(id) {
  await pool.execute("DELETE FROM albums WHERE id = ?", [id]);
}
