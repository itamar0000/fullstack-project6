import pool from "../db/pool.js";

export async function countByUser(userId) {
  const sql = "SELECT COUNT(*) AS total FROM posts" + (userId ? " WHERE userId = ?" : "");
  const [[{ total }]] = await pool.execute(sql, userId ? [userId] : []);
  return total;
}

export async function findPage({ userId, limit, offset }) {
  let sql = "SELECT * FROM posts" + (userId ? " WHERE userId = ?" : "");
  sql += ` ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
  const [rows] = await pool.execute(sql, userId ? [userId] : []);
  return rows;
}

export async function findById(id) {
  const [[row]] = await pool.execute("SELECT * FROM posts WHERE id = ?", [id]);
  return row || null;
}

export async function create({ userId, title, body }) {
  const [r] = await pool.execute(
    "INSERT INTO posts (userId, title, body) VALUES (?,?,?)",
    [userId, title, body]
  );
  return findById(r.insertId);
}

export async function update(id, { title, body }) {
  await pool.execute("UPDATE posts SET title=?, body=? WHERE id=?", [title, body, id]);
  return findById(id);
}

export async function remove(id) {
  await pool.execute("DELETE FROM posts WHERE id = ?", [id]);
}
