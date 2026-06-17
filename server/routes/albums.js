import { Router } from "express";
import pool from "../db.js";
import { logAction } from "../audit.js";
import { requireAuth } from "../middleware/auth.js";
import { getPagination, setTotalCountHeader } from "../pagination.js";

const router = Router();

// GET /albums or /albums?userId=X&_page=N
router.get("/", async (req, res) => {
  const { userId } = req.query;
  let countSql = "SELECT COUNT(*) AS total FROM albums";
  let dataSql = "SELECT * FROM albums";
  const params = [];

  if (userId) {
    countSql += " WHERE userId = ?";
    dataSql += " WHERE userId = ?";
    params.push(userId);
  }

  const [[{ total }]] = await pool.execute(countSql, params);
  setTotalCountHeader(res, total);

  const { limit, offset } = getPagination(req.query);
  dataSql += ` ORDER BY id LIMIT ${limit} OFFSET ${offset}`;

  const [rows] = await pool.execute(dataSql, params);
  res.json(rows);
});

// GET /albums/:id
router.get("/:id", async (req, res) => {
  const [[row]] = await pool.execute("SELECT * FROM albums WHERE id = ?", [req.params.id]);
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(row);
});

// POST /albums  (always created for the authenticated user)
router.post("/", requireAuth, async (req, res) => {
  const { title } = req.body;
  const [result] = await pool.execute(
    "INSERT INTO albums (userId, title) VALUES (?,?)",
    [req.userId, title]
  );
  const [[row]] = await pool.execute("SELECT * FROM albums WHERE id = ?", [result.insertId]);
  await logAction(req.userId, "CREATE_ALBUM", "albums", row.id);
  res.status(201).json(row);
});

// PUT/PATCH /albums/:id  (only the owning user may update)
router.put("/:id", requireAuth, handleUpdate);
router.patch("/:id", requireAuth, handleUpdate);

async function handleUpdate(req, res) {
  const [[existing]] = await pool.execute("SELECT * FROM albums WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only update your own albums" });
  }

  const title = req.body.title ?? existing.title;
  await pool.execute("UPDATE albums SET title=? WHERE id=?", [title, req.params.id]);
  const [[row]] = await pool.execute("SELECT * FROM albums WHERE id = ?", [req.params.id]);
  await logAction(req.userId, "UPDATE_ALBUM", "albums", row.id);
  res.json(row);
}

// DELETE /albums/:id  (only the owning user may delete)
router.delete("/:id", requireAuth, async (req, res) => {
  const [[existing]] = await pool.execute("SELECT * FROM albums WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only delete your own albums" });
  }
  await logAction(req.userId, "DELETE_ALBUM", "albums", Number(req.params.id));
  await pool.execute("DELETE FROM albums WHERE id = ?", [req.params.id]);
  res.json({});
});

export default router;
