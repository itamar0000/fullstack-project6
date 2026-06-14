import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /albums or /albums?userId=X
router.get("/", async (req, res) => {
  const { userId } = req.query;
  let sql = "SELECT * FROM albums";
  const params = [];
  if (userId) { sql += " WHERE userId = ?"; params.push(userId); }
  sql += " ORDER BY id";
  const [rows] = await pool.execute(sql, params);
  res.json(rows);
});

// GET /albums/:id
router.get("/:id", async (req, res) => {
  const [[row]] = await pool.execute("SELECT * FROM albums WHERE id = ?", [req.params.id]);
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(row);
});

// POST /albums
router.post("/", async (req, res) => {
  const { userId, title } = req.body;
  const [result] = await pool.execute(
    "INSERT INTO albums (userId, title) VALUES (?,?)",
    [userId, title]
  );
  const [[row]] = await pool.execute("SELECT * FROM albums WHERE id = ?", [result.insertId]);
  res.status(201).json(row);
});

// PUT/PATCH /albums/:id
router.put("/:id", handleUpdate);
router.patch("/:id", handleUpdate);

async function handleUpdate(req, res) {
  const [[existing]] = await pool.execute("SELECT * FROM albums WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });

  const title = req.body.title ?? existing.title;
  await pool.execute("UPDATE albums SET title=? WHERE id=?", [title, req.params.id]);
  const [[row]] = await pool.execute("SELECT * FROM albums WHERE id = ?", [req.params.id]);
  res.json(row);
}

// DELETE /albums/:id
router.delete("/:id", async (req, res) => {
  await pool.execute("DELETE FROM albums WHERE id = ?", [req.params.id]);
  res.json({});
});

export default router;
