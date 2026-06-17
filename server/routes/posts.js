import { Router } from "express";
import { logAction } from "../repositories/auditRepository.js";
import { requireAuth } from "../middleware/auth.js";
import { getPagination, setTotalCountHeader } from "../utils/pagination.js";
import * as postRepo from "../repositories/postRepository.js";

const router = Router();

// GET /posts or /posts?userId=X&_page=N
router.get("/", async (req, res) => {
  const { userId } = req.query;

  setTotalCountHeader(res, await postRepo.countByUser(userId));

  const { limit, offset } = getPagination(req.query, 5);
  res.json(await postRepo.findPage({ userId, limit, offset }));
});

// GET /posts/:id
router.get("/:id", async (req, res) => {
  const row = await postRepo.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(row);
});

// POST /posts  (always created for the authenticated user)
router.post("/", requireAuth, async (req, res) => {
  const { title, body } = req.body;
  const row = await postRepo.create({ userId: req.userId, title, body });
  await logAction(req.userId, "CREATE_POST", "posts", row.id);
  res.status(201).json(row);
});

// PUT/PATCH /posts/:id  (only the owning user may update)
router.put("/:id", requireAuth, handleUpdate);
router.patch("/:id", requireAuth, handleUpdate);

async function handleUpdate(req, res) {
  const existing = await postRepo.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only update your own posts" });
  }

  const row = await postRepo.update(req.params.id, {
    title: req.body.title ?? existing.title,
    body: req.body.body ?? existing.body,
  });
  await logAction(req.userId, "UPDATE_POST", "posts", row.id);
  res.json(row);
}

// DELETE /posts/:id  (only the owning user may delete)
router.delete("/:id", requireAuth, async (req, res) => {
  const existing = await postRepo.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only delete your own posts" });
  }
  await logAction(req.userId, "DELETE_POST", "posts", Number(req.params.id));
  await postRepo.remove(req.params.id);
  res.json({});
});

export default router;
