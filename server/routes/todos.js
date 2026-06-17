import { Router } from "express";
import { logAction } from "../repositories/auditRepository.js";
import { requireAuth } from "../middleware/auth.js";
import { getPagination, setTotalCountHeader } from "../utils/pagination.js";
import * as todoRepo from "../repositories/todoRepository.js";

const router = Router();

// Stored as TINYINT(1); expose it to clients as a real boolean.
const toView = (row) => ({ ...row, completed: !!row.completed });

// GET /todos or /todos?userId=X&_page=N
router.get("/", async (req, res) => {
  const { userId } = req.query;

  setTotalCountHeader(res, await todoRepo.countByUser(userId));

  const { limit, offset } = getPagination(req.query);
  const rows = await todoRepo.findPage({ userId, limit, offset });
  res.json(rows.map(toView));
});

// GET /todos/:id
router.get("/:id", async (req, res) => {
  const row = await todoRepo.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(toView(row));
});

// POST /todos  (always created for the authenticated user)
router.post("/", requireAuth, async (req, res) => {
  const { title, completed = false } = req.body;
  const row = await todoRepo.create({ userId: req.userId, title, completed });
  await logAction(req.userId, "CREATE_TODO", "todos", row.id);
  res.status(201).json(toView(row));
});

// PUT/PATCH /todos/:id  (only the owning user may update)
router.put("/:id", requireAuth, handleUpdate);
router.patch("/:id", requireAuth, handleUpdate);

async function handleUpdate(req, res) {
  const existing = await todoRepo.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only update your own todos" });
  }

  const row = await todoRepo.update(req.params.id, {
    title: req.body.title ?? existing.title,
    completed: req.body.completed !== undefined ? req.body.completed : !!existing.completed,
  });
  await logAction(req.userId, "UPDATE_TODO", "todos", row.id);
  res.json(toView(row));
}

// DELETE /todos/:id  (only the owning user may delete)
router.delete("/:id", requireAuth, async (req, res) => {
  const existing = await todoRepo.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (existing.userId !== req.userId) {
    return res.status(403).json({ message: "You can only delete your own todos" });
  }
  await logAction(req.userId, "DELETE_TODO", "todos", Number(req.params.id));
  await todoRepo.remove(req.params.id);
  res.json({});
});

export default router;
