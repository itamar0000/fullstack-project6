import { Router } from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /todos or /todos?userId=X
router.get("/", async (req, res) => {
  const { userId } = req.query;
  let sql = "SELECT * FROM todos";
  const params = [];
  if (userId) { sql += " WHERE userId = ?"; params.push(userId); }
  sql += " ORDER BY id";
  const [rows] = await pool.execute(sql, params);
  res.json(rows.map(r => ({ ...r, completed: !!r.completed })));
});

// GET /todos/:id
router.get("/:id", async (req, res) => {
  const [[row]] = await pool.execute("SELECT * FROM todos WHERE id = ?", [req.params.id]);
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json({ ...row, completed: !!row.completed });
});

// POST /todos  (always created for the authenticated user)
router.post("/", requireAuth, async (req, res) => {
  const { title, completed = false } = req.body;
  const [result] = await pool.execute(
    "INSERT INTO todos (userId, title, completed) VALUES (?,?,?)",
    [req.userId, title, completed ? 1 : 0]
  );
  const [[row]] = await pool.execute("SELECT * FROM todos WHERE id = ?", [result.insertId]);
  res.status(201).json({ ...row, completed: !!row.completed });
});

// PUT/PATCH /todos/:id  (only the owning user may update)
router.put("/:id", requireAuth, handleUpdate);
router.patch("/:id", requireAuth, handleUpdate);

async function handleUpdate(req, res) {
  const [[existing]] = await pool.execute("SELECT * FROM todos WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only update your own todos" });
  }

  const title = req.body.title ?? existing.title;
  const completed = req.body.completed !== undefined ? req.body.completed : !!existing.completed;

  await pool.execute(
    "UPDATE todos SET title=?, completed=? WHERE id=?",
    [title, completed ? 1 : 0, req.params.id]
  );
  const [[row]] = await pool.execute("SELECT * FROM todos WHERE id = ?", [req.params.id]);
  res.json({ ...row, completed: !!row.completed });
}

// DELETE /todos/:id  (only the owning user may delete)
router.delete("/:id", requireAuth, async (req, res) => {
  const [[existing]] = await pool.execute("SELECT * FROM todos WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only delete your own todos" });
  }
  await pool.execute("DELETE FROM todos WHERE id = ?", [req.params.id]);
  res.json({});
});

export default router;
