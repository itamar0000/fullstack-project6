import pool from "../db/pool.js";

export async function countByUser(userId) {
  const sql = "SELECT COUNT(*) AS total FROM todos" + (userId ? " WHERE userId = ?" : "");
  const [[{ total }]] = await pool.execute(sql, userId ? [userId] : []);
  return total;
}

export async function findPage({ userId, limit, offset }) {
  let sql = "SELECT * FROM todos" + (userId ? " WHERE userId = ?" : "");
  sql += ` ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
  const [rows] = await pool.execute(sql, userId ? [userId] : []);
  return rows;
}

export async function findById(id) {
  const [[row]] = await pool.execute("SELECT * FROM todos WHERE id = ?", [id]);
  return row || null;
}

export async function create({ userId, title, completed }) {
  const [r] = await pool.execute(
    "INSERT INTO todos (userId, title, completed) VALUES (?,?,?)",
    [userId, title, completed ? 1 : 0]
  );
  return findById(r.insertId);
}

export async function update(id, { title, completed }) {
  await pool.execute(
    "UPDATE todos SET title=?, completed=? WHERE id=?",
    [title, completed ? 1 : 0, id]
  );
  return findById(id);
}

export async function remove(id) {
  await pool.execute("DELETE FROM todos WHERE id = ?", [id]);
}
