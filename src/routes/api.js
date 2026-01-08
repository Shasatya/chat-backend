import express from "express";
import * as authController from "../controllers/authController.js";
import { verifyToken } from "../lib/jwt.js";

const router = express.Router();

// Auth routes
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", verifyToken, authController.getMe);
router.put("/auth/avatar", verifyToken, authController.updateAvatar);
