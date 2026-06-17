import { Router } from "express";
import pool from "../db.js";
import { logAction } from "../audit.js";
import { requireAuth } from "../middleware/auth.js";
import { getPagination, setTotalCountHeader } from "../pagination.js";

const router = Router();

// GET /posts or /posts?userId=X&_page=N
router.get("/", async (req, res) => {
  const { userId } = req.query;
  let countSql = "SELECT COUNT(*) AS total FROM posts";
  let dataSql = "SELECT * FROM posts";
  const params = [];

  if (userId) {
    countSql += " WHERE userId = ?";
    dataSql += " WHERE userId = ?";
    params.push(userId);
  }

  const [[{ total }]] = await pool.execute(countSql, params);
  setTotalCountHeader(res, total);

  const { limit, offset } = getPagination(req.query, 5);
  dataSql += ` ORDER BY id LIMIT ${limit} OFFSET ${offset}`;

  const [rows] = await pool.execute(dataSql, params);
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
  await logAction(req.userId, "CREATE_POST", "posts", row.id);
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
  await logAction(req.userId, "UPDATE_POST", "posts", row.id);
  res.json(row);
}

// DELETE /posts/:id  (only the owning user may delete)
router.delete("/:id", requireAuth, async (req, res) => {
  const [[existing]] = await pool.execute("SELECT * FROM posts WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only delete your own posts" });
  }
  await logAction(req.userId, "DELETE_POST", "posts", Number(req.params.id));
  await pool.execute("DELETE FROM posts WHERE id = ?", [req.params.id]);
  res.json({});
});

export default router;
