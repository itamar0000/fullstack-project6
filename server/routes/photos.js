import { Router } from "express";
import pool from "../db.js";
import { logAction } from "../audit.js";
import { requireAuth } from "../middleware/auth.js";
import { getPagination, setTotalCountHeader } from "../pagination.js";

const router = Router();

async function getOwningAlbum(albumId) {
  const [[album]] = await pool.execute("SELECT * FROM albums WHERE id = ?", [albumId]);
  return album || null;
}

// GET /photos?albumId=X&_page=N
// Returns X-Total-Count header for pagination (matches json-server / axios client behaviour)
router.get("/", async (req, res) => {
  const { albumId } = req.query;

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
  setTotalCountHeader(res, total);

  const { limit, offset } = getPagination(req.query, 6);
  // mysql2 prepared statements require integer type for LIMIT/OFFSET.
  dataSql += ` LIMIT ${limit} OFFSET ${offset}`;
  const [rows] = await pool.execute(dataSql, params);
  res.json(rows);
});

// GET /photos/:id
router.get("/:id", async (req, res) => {
  const [[row]] = await pool.execute("SELECT * FROM photos WHERE id = ?", [req.params.id]);
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(row);
});

// POST /photos  (only into an album owned by the authenticated user)
router.post("/", requireAuth, async (req, res) => {
  const { albumId, title, url, thumbnailUrl } = req.body;

  const album = await getOwningAlbum(albumId);
  if (!album) return res.status(404).json({ message: "Album not found" });
  if (album.userId !== req.userId) {
    return res.status(403).json({ message: "You can only add photos to your own albums" });
  }

  const [result] = await pool.execute(
    "INSERT INTO photos (albumId, title, url, thumbnailUrl) VALUES (?,?,?,?)",
    [albumId, title, url, thumbnailUrl]
  );
  const [[row]] = await pool.execute("SELECT * FROM photos WHERE id = ?", [result.insertId]);
  await logAction(req.userId, "CREATE_PHOTO", "photos", row.id, { albumId });
  res.status(201).json(row);
});

// PUT/PATCH /photos/:id  (only if the photo's album belongs to the authenticated user)
router.put("/:id", requireAuth, handleUpdate);
router.patch("/:id", requireAuth, handleUpdate);

async function handleUpdate(req, res) {
  const [[existing]] = await pool.execute("SELECT * FROM photos WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });

  const album = await getOwningAlbum(existing.albumId);
  if (!album || album.userId !== req.userId) {
    return res.status(403).json({ message: "You can only update photos in your own albums" });
  }

  const title        = req.body.title        ?? existing.title;
  const url          = req.body.url          ?? existing.url;
  const thumbnailUrl = req.body.thumbnailUrl ?? existing.thumbnailUrl;

  await pool.execute(
    "UPDATE photos SET title=?, url=?, thumbnailUrl=? WHERE id=?",
    [title, url, thumbnailUrl, req.params.id]
  );
  const [[row]] = await pool.execute("SELECT * FROM photos WHERE id = ?", [req.params.id]);
  await logAction(req.userId, "UPDATE_PHOTO", "photos", row.id);
  res.json(row);
}

// DELETE /photos/:id  (only if the photo's album belongs to the authenticated user)
router.delete("/:id", requireAuth, async (req, res) => {
  const [[existing]] = await pool.execute("SELECT * FROM photos WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ message: "Not found" });

  const album = await getOwningAlbum(existing.albumId);
  if (!album || album.userId !== req.userId) {
    return res.status(403).json({ message: "You can only delete photos in your own albums" });
  }

  await logAction(req.userId, "DELETE_PHOTO", "photos", Number(req.params.id));
  await pool.execute("DELETE FROM photos WHERE id = ?", [req.params.id]);
  res.json({});
});

export default router;
