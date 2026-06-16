import { Router } from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /posts or /posts?userId=X
router.get("/", async (req, res) => {
  const { userId } = req.query;
  let sql = "SELECT * FROM posts";
  const params = [];
  if (userId) { sql += " WHERE userId = ?"; params.push(userId); }
  sql += " ORDER BY id";
  const [rows] = await pool.execute(sql, params);
  res.json(rows);
});

// GET /posts/:id
router.get("/:id", async (req, res) => {
  const [[row]] = await pool.execute("SELECT * FROM posts WHERE id = ?", [req.params.id]);
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(row);
});

// POST /posts  (always created for the authenticated user)
router.post("/", requireAuth, async (req, res) => {
  const { title, body } = req.body;
  const [result] = await pool.execute(
    "INSERT INTO posts (userId, title, body) VALUES (?,?,?)",
    [req.userId, title, body]
  );
  const [[row]] = await pool.execute("SELECT * FROM posts WHERE id = ?", [result.insertId]);
  res.status(201).json(row);
});

// PUT/PATCH /posts/:id  (only the owning user may update)
router.put("/:id", requireAuth, handleUpdate);
router.patch("/:id", requireAuth, handleUpdate);

async function handleUpdate(req, res) {
  const [[existing]] = await pool.execute("SELECT * FROM posts WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only update your own posts" });
  }

  const title = req.body.title ?? existing.title;
  const body = req.body.body ?? existing.body;

  await pool.execute("UPDATE posts SET title=?, body=? WHERE id=?", [title, body, req.params.id]);
  const [[row]] = await pool.execute("SELECT * FROM posts WHERE id = ?", [req.params.id]);
  res.json(row);
}

// DELETE /posts/:id  (only the owning user may delete)
router.delete("/:id", requireAuth, async (req, res) => {
  const [[existing]] = await pool.execute("SELECT * FROM posts WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only delete your own posts" });
  }
  await pool.execute("DELETE FROM posts WHERE id = ?", [req.params.id]);
  res.json({});
});

export default router;
