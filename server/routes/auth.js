import { Router } from "express";
import bcrypt from "bcryptjs";
import { signToken } from "../middleware/auth.js";
import { rowToUser } from "../utils/userMapper.js";
import * as userRepo from "../repositories/userRepository.js";

const router = Router();

// POST /auth/login  { username, password }
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = await userRepo.findByUsername(username);
  if (!user) return res.status(401).json({ message: "Invalid username or password" });
  if (user.is_blocked) return res.status(403).json({ message: "This account is blocked" });

  const hash = await userRepo.getPasswordHash(user.id);
  if (!hash) return res.status(401).json({ message: "Invalid username or password" });

  const matches = await bcrypt.compare(password, hash);
  if (!matches) return res.status(401).json({ message: "Invalid username or password" });

  res.json({ token: signToken(user), user: rowToUser(user) });
});

export default router;
