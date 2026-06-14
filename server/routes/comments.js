import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /comments or /comments?postId=X
router.get("/", async (req, res) => {
  const { postId } = req.query;
  let sql = "SELECT * FROM comments";
  const params = [];
  if (postId) { sql += " WHERE postId = ?"; params.push(postId); }
  sql += " ORDER BY id";
  const [rows] = await pool.execute(sql, params);
  res.json(rows);
});

// GET /comments/:id
router.get("/:id", async (req, res) => {
  const [[row]] = await pool.execute("SELECT * FROM comments WHERE id = ?", [req.params.id]);
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(row);
});

// POST /comments
router.post("/", async (req, res) => {
  const { postId, name, email, body } = req.body;
  const [result] = await pool.execute(
    "INSERT INTO comments (postId, name, email, body) VALUES (?,?,?,?)",
    [postId, name, email, body]
  );
  const [[row]] = await pool.execute("SELECT * FROM comments WHERE id = ?", [result.insertId]);
  res.status(201).json(row);
});

// PUT/PATCH /comments/:id
router.put("/:id", handleUpdate);
router.patch("/:id", handleUpdate);

async function handleUpdate(req, res) {
  const [[existing]] = await pool.execute("SELECT * FROM comments WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });

  const name  = req.body.name  ?? existing.name;
  const email = req.body.email ?? existing.email;
  const body  = req.body.body  ?? existing.body;

  await pool.execute(
    "UPDATE comments SET name=?, email=?, body=? WHERE id=?",
    [name, email, body, req.params.id]
  );
  const [[row]] = await pool.execute("SELECT * FROM comments WHERE id = ?", [req.params.id]);
  res.json(row);
}

// DELETE /comments/:id
router.delete("/:id", async (req, res) => {
  await pool.execute("DELETE FROM comments WHERE id = ?", [req.params.id]);
  res.json({});
});

export default router;
