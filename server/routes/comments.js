import { Router } from "express";
import { logAction } from "../repositories/auditRepository.js";
import { requireAuth } from "../middleware/auth.js";
import { getPagination, setTotalCountHeader } from "../utils/pagination.js";
import * as commentRepo from "../repositories/commentRepository.js";

const router = Router();

// GET /comments or /comments?postId=X&_page=N
router.get("/", async (req, res) => {
  const { postId } = req.query;

  setTotalCountHeader(res, await commentRepo.countByPost(postId));

  const { limit, offset } = getPagination(req.query, 2);
  res.json(await commentRepo.findPage({ postId, limit, offset }));
});

// GET /comments/:id
router.get("/:id", async (req, res) => {
  const row = await commentRepo.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(row);
});

// POST /comments  (always attributed to the authenticated user)
router.post("/", requireAuth, async (req, res) => {
  const { postId, name, email, body } = req.body;
  const row = await commentRepo.create({ postId, userId: req.userId, name, email, body });
  await logAction(req.userId, "CREATE_COMMENT", "comments", row.id, { postId });
  res.status(201).json(row);
});

// PUT/PATCH /comments/:id  (only the owning user may update)
router.put("/:id", requireAuth, handleUpdate);
router.patch("/:id", requireAuth, handleUpdate);

async function handleUpdate(req, res) {
  const existing = await commentRepo.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only update your own comments" });
  }

  const row = await commentRepo.update(req.params.id, {
    name: req.body.name ?? existing.name,
    email: req.body.email ?? existing.email,
    body: req.body.body ?? existing.body,
  });
  await logAction(req.userId, "UPDATE_COMMENT", "comments", row.id);
  res.json(row);
}

// DELETE /comments/:id  (only the owning user may delete)
router.delete("/:id", requireAuth, async (req, res) => {
  const existing = await commentRepo.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only delete your own comments" });
  }
  await logAction(req.userId, "DELETE_COMMENT", "comments", Number(req.params.id));
  await commentRepo.remove(req.params.id);
  res.json({});
});

export default router;
