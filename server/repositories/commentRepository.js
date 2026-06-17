import pool from "../db/pool.js";

export async function countByPost(postId) {
  const sql = "SELECT COUNT(*) AS total FROM comments" + (postId ? " WHERE postId = ?" : "");
  const [[{ total }]] = await pool.execute(sql, postId ? [postId] : []);
  return total;
}

export async function findPage({ postId, limit, offset }) {
  let sql = "SELECT * FROM comments" + (postId ? " WHERE postId = ?" : "");
  sql += ` ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
  const [rows] = await pool.execute(sql, postId ? [postId] : []);
  return rows;
}

export async function findById(id) {
  const [[row]] = await pool.execute("SELECT * FROM comments WHERE id = ?", [id]);
  return row || null;
}

export async function create({ postId, userId, name, email, body }) {
  const [r] = await pool.execute(
    "INSERT INTO comments (postId, userId, name, email, body) VALUES (?,?,?,?,?)",
    [postId, userId, name, email, body]
  );
  return findById(r.insertId);
}

export async function update(id, { name, email, body }) {
  await pool.execute(
    "UPDATE comments SET name=?, email=?, body=? WHERE id=?",
    [name, email, body, id]
  );
  return findById(id);
}

export async function remove(id) {
  await pool.execute("DELETE FROM comments WHERE id = ?", [id]);
}
