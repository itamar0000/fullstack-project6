import { Router } from "express";
import { logAction } from "../repositories/auditRepository.js";
import { requireAuth } from "../middleware/auth.js";
import { getPagination, setTotalCountHeader } from "../utils/pagination.js";
import * as photoRepo from "../repositories/photoRepository.js";

const router = Router();

// True if the album exists and belongs to the authenticated user.
async function ownsAlbum(albumId, userId) {
  const album = await photoRepo.findAlbum(albumId);
  return album && album.userId === userId;
}

// GET /photos?albumId=X&_page=N
// Returns X-Total-Count header for pagination (matches json-server / axios client behaviour)
router.get("/", async (req, res) => {
  const { albumId } = req.query;

  setTotalCountHeader(res, await photoRepo.countByAlbum(albumId));

  const { limit, offset } = getPagination(req.query, 6);
  res.json(await photoRepo.findPage({ albumId, limit, offset }));
});

// GET /photos/:id
router.get("/:id", async (req, res) => {
  const row = await photoRepo.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(row);
});

// POST /photos  (only into an album owned by the authenticated user)
router.post("/", requireAuth, async (req, res) => {
  const { albumId, title, url, thumbnailUrl } = req.body;

  const album = await photoRepo.findAlbum(albumId);
  if (!album) return res.status(404).json({ message: "Album not found" });
  if (album.userId !== req.userId) {
    return res.status(403).json({ message: "You can only add photos to your own albums" });
  }

  const row = await photoRepo.create({ albumId, title, url, thumbnailUrl });
  await logAction(req.userId, "CREATE_PHOTO", "photos", row.id, { albumId });
  res.status(201).json(row);
});

// PUT/PATCH /photos/:id  (only if the photo's album belongs to the authenticated user)
router.put("/:id", requireAuth, handleUpdate);
router.patch("/:id", requireAuth, handleUpdate);

async function handleUpdate(req, res) {
  const existing = await photoRepo.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });

  if (!(await ownsAlbum(existing.albumId, req.userId))) {
    return res.status(403).json({ message: "You can only update photos in your own albums" });
  }

  const row = await photoRepo.update(req.params.id, {
    title: req.body.title ?? existing.title,
    url: req.body.url ?? existing.url,
    thumbnailUrl: req.body.thumbnailUrl ?? existing.thumbnailUrl,
  });
  await logAction(req.userId, "UPDATE_PHOTO", "photos", row.id);
  res.json(row);
}

// DELETE /photos/:id  (only if the photo's album belongs to the authenticated user)
router.delete("/:id", requireAuth, async (req, res) => {
  const existing = await photoRepo.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });

  if (!(await ownsAlbum(existing.albumId, req.userId))) {
    return res.status(403).json({ message: "You can only delete photos in your own albums" });
  }

  await logAction(req.userId, "DELETE_PHOTO", "photos", Number(req.params.id));
  await photoRepo.remove(req.params.id);
  res.json({});
});

export default router;
