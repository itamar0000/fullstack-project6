import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import { signToken } from "../middleware/auth.js";
import { rowToUser } from "../userMapper.js";

const router = Router();

// POST /auth/login  { username, password }
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const [[user]] = await pool.execute("SELECT * FROM users WHERE username = ?", [username]);
  if (!user) return res.status(401).json({ message: "Invalid username or password" });

  const [[record]] = await pool.execute(
    "SELECT password FROM user_passwords WHERE user_id = ?",
    [user.id]
  );
  if (!record) return res.status(401).json({ message: "Invalid username or password" });

  const matches = await bcrypt.compare(password, record.password);
  if (!matches) return res.status(401).json({ message: "Invalid username or password" });

  res.json({ token: signToken(user), user: rowToUser(user) });
});

export default router;
