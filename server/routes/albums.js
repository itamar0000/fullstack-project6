import { Router } from "express";
import { logAction } from "../repositories/auditRepository.js";
import { requireAuth } from "../middleware/auth.js";
import { getPagination, setTotalCountHeader } from "../utils/pagination.js";
import * as albumRepo from "../repositories/albumRepository.js";

const router = Router();

// GET /albums or /albums?userId=X&_page=N
router.get("/", async (req, res) => {
  const { userId } = req.query;

  setTotalCountHeader(res, await albumRepo.countByUser(userId));

  const { limit, offset } = getPagination(req.query);
  res.json(await albumRepo.findPage({ userId, limit, offset }));
});

// GET /albums/:id
router.get("/:id", async (req, res) => {
  const row = await albumRepo.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(row);
});

// POST /albums  (always created for the authenticated user)
router.post("/", requireAuth, async (req, res) => {
  const { title } = req.body;
  const row = await albumRepo.create({ userId: req.userId, title });
  await logAction(req.userId, "CREATE_ALBUM", "albums", row.id);
  res.status(201).json(row);
});

// PUT/PATCH /albums/:id  (only the owning user may update)
router.put("/:id", requireAuth, handleUpdate);
router.patch("/:id", requireAuth, handleUpdate);

async function handleUpdate(req, res) {
  const existing = await albumRepo.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only update your own albums" });
  }

  const row = await albumRepo.update(req.params.id, {
    title: req.body.title ?? existing.title,
  });
  await logAction(req.userId, "UPDATE_ALBUM", "albums", row.id);
  res.json(row);
}

// DELETE /albums/:id  (only the owning user may delete)
router.delete("/:id", requireAuth, async (req, res) => {
  const existing = await albumRepo.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only delete your own albums" });
  }
  await logAction(req.userId, "DELETE_ALBUM", "albums", Number(req.params.id));
  await albumRepo.remove(req.params.id);
  res.json({});
});

export default router;
