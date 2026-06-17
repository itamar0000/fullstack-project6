import pool from "../db/pool.js";

export async function countByAlbum(albumId) {
  const sql = "SELECT COUNT(*) AS total FROM photos" + (albumId ? " WHERE albumId = ?" : "");
  const [[{ total }]] = await pool.execute(sql, albumId ? [albumId] : []);
  return total;
}

export async function findPage({ albumId, limit, offset }) {
  let sql = "SELECT * FROM photos" + (albumId ? " WHERE albumId = ?" : "");
  // mysql2 prepared statements require integer type for LIMIT/OFFSET.
  sql += ` ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
  const [rows] = await pool.execute(sql, albumId ? [albumId] : []);
  return rows;
}

export async function findById(id) {
  const [[row]] = await pool.execute("SELECT * FROM photos WHERE id = ?", [id]);
  return row || null;
}

// The owning album, used by routes to authorize photo writes.
export async function findAlbum(albumId) {
  const [[album]] = await pool.execute("SELECT * FROM albums WHERE id = ?", [albumId]);
  return album || null;
}

export async function create({ albumId, title, url, thumbnailUrl }) {
  const [r] = await pool.execute(
    "INSERT INTO photos (albumId, title, url, thumbnailUrl) VALUES (?,?,?,?)",
    [albumId, title, url, thumbnailUrl]
  );
  return findById(r.insertId);
}

export async function update(id, { title, url, thumbnailUrl }) {
  await pool.execute(
    "UPDATE photos SET title=?, url=?, thumbnailUrl=? WHERE id=?",
    [title, url, thumbnailUrl, id]
  );
  return findById(id);
}

export async function remove(id) {
  await pool.execute("DELETE FROM photos WHERE id = ?", [id]);
}
