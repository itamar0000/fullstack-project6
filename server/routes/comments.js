import { Router } from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

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

// POST /comments  (always attributed to the authenticated user)
router.post("/", requireAuth, async (req, res) => {
  const { postId, name, email, body } = req.body;
  const [result] = await pool.execute(
    "INSERT INTO comments (postId, userId, name, email, body) VALUES (?,?,?,?,?)",
    [postId, req.userId, name, email, body]
  );
  const [[row]] = await pool.execute("SELECT * FROM comments WHERE id = ?", [result.insertId]);
  res.status(201).json(row);
});

// PUT/PATCH /comments/:id  (only the owning user may update)
router.put("/:id", requireAuth, handleUpdate);
router.patch("/:id", requireAuth, handleUpdate);

async function handleUpdate(req, res) {
  const [[existing]] = await pool.execute("SELECT * FROM comments WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only update your own comments" });
  }

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

// DELETE /comments/:id  (only the owning user may delete)
router.delete("/:id", requireAuth, async (req, res) => {
  const [[existing]] = await pool.execute("SELECT * FROM comments WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only delete your own comments" });
  }
  await pool.execute("DELETE FROM comments WHERE id = ?", [req.params.id]);
  res.json({});
});

export default router;
