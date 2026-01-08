import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "../lib/validators.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export async function register(req, res) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.errors[0].message });
  }

  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "User created successfully",
      token,
      userId: user.id,
      username: user.username,
    });
  } catch (e) {
    console.error(e);
    if (e.code === "P2002") {
      return res.status(409).json({ error: "Username already taken" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
}

export async function login(req, res) {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ result: result });
  }

  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, userId: user.id, username: user.username });
  } catch (e) {
    res.status(500).json({ error: "Login failed" });
  }
}

export async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, username: true, avatar: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (e) {
    res.status(500).json({ error: "Fetch failed" });
  }
}

export async function updateAvatar(req, res) {
  const { avatarUrl } = req.body;
  const userId = req.userId;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: { id: true, username: true, avatar: true },
    });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: "Failed to update avatar" });
  }
}
