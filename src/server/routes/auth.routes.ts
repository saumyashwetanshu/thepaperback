import express from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbPromise from "../../utils/db";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  affiliation: z.string().optional(),
  role: z.string().optional()
});

const signinSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required.")
});

router.post("/signup", async (req, res) => {
  try {
    const parsed = signupSchema.parse(req.body);
    const { name, email, password, affiliation, role } = parsed;

    const cleanEmail = email.trim().toLowerCase();
    const db = await dbPromise;
    const existing = await db.get('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "U";
    
    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: role || "Reader & Analyst",
      affiliation: affiliation || "Independent",
      avatar: initials,
      createdAt: new Date().toISOString()
    };

    await db.run(
      'INSERT INTO users (id, name, email, passwordHash, role, affiliation, avatar, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [newUser.id, newUser.name, newUser.email, newUser.passwordHash, newUser.role, newUser.affiliation, newUser.avatar, newUser.createdAt]
    );

    // Generate JWT
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    const { passwordHash: _, ...safeUser } = newUser;
    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: (err as any).errors[0]?.message || "Validation error" });
    }
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const parsed = signinSchema.parse(req.body);
    const { email, password } = parsed;

    const cleanEmail = email.trim().toLowerCase();
    
    const db = await dbPromise;
    const user = await db.get('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Compare passwords
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: (err as any).errors[0]?.message || "Validation error" });
    }
    console.error("Signin error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization || (req.headers["x-session-token"] as string);
  const token = authHeader ? authHeader.replace(/^Bearers+/i, "") : null;

  if (!token) return res.status(401).json({ error: "Not authenticated." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const db = await dbPromise;
    
    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    if (!user) return res.status(401).json({ error: "User not found." });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
});

router.post("/signout", async (req, res) => {
  // With stateless JWT, we simply acknowledge the signout
  // The client is responsible for clearing the token from localStorage
  res.json({ success: true });
});

export default router;
