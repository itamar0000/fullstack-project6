import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /photos?albumId=X&_page=N&_limit=M
// Returns X-Total-Count header for pagination (matches json-server / axios client behaviour)
router.get("/", async (req, res) => {
  const { albumId, _page, _limit } = req.query;

  let countSql = "SELECT COUNT(*) AS total FROM photos";
  let dataSql  = "SELECT * FROM photos";
  const params = [];

  if (albumId) {
    countSql += " WHERE albumId = ?";
    dataSql  += " WHERE albumId = ?";
    params.push(albumId);
  }

  dataSql += " ORDER BY id";

  const [[{ total }]] = await pool.execute(countSql, params);
  res.setHeader("X-Total-Count", total);
  res.setHeader("Access-Control-Expose-Headers", "X-Total-Count");

  if (_page && _limit) {
    const page   = Math.max(1, parseInt(_page,  10));
    const limit  = Math.max(1, parseInt(_limit, 10));
    const offset = (page - 1) * limit;
    // mysql2 prepared statements require integer type for LIMIT/OFFSET
    dataSql += ` LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await pool.execute(dataSql, params);
    return res.json(rows);
  }

  const [rows] = await pool.execute(dataSql, params);
  res.json(rows);
});

// GET /photos/:id
router.get("/:id", async (req, res) => {
  const [[row]] = await pool.execute("SELECT * FROM photos WHERE id = ?", [req.params.id]);
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(row);
});

// POST /photos
router.post("/", async (req, res) => {
  const { albumId, title, url, thumbnailUrl } = req.body;
  const [result] = await pool.execute(
    "INSERT INTO photos (albumId, title, url, thumbnailUrl) VALUES (?,?,?,?)",
    [albumId, title, url, thumbnailUrl]
  );
  const [[row]] = await pool.execute("SELECT * FROM photos WHERE id = ?", [result.insertId]);
  res.status(201).json(row);
});

// PUT/PATCH /photos/:id
router.put("/:id", handleUpdate);
router.patch("/:id", handleUpdate);

async function handleUpdate(req, res) {
  const [[existing]] = await pool.execute("SELECT * FROM photos WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });

  const title        = req.body.title        ?? existing.title;
  const url          = req.body.url          ?? existing.url;
  const thumbnailUrl = req.body.thumbnailUrl ?? existing.thumbnailUrl;

  await pool.execute(
    "UPDATE photos SET title=?, url=?, thumbnailUrl=? WHERE id=?",
    [title, url, thumbnailUrl, req.params.id]
  );
  const [[row]] = await pool.execute("SELECT * FROM photos WHERE id = ?", [req.params.id]);
  res.json(row);
}

// DELETE /photos/:id
router.delete("/:id", async (req, res) => {
  await pool.execute("DELETE FROM photos WHERE id = ?", [req.params.id]);
  res.json({});
});

export default router;
