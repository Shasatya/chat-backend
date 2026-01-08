import express from "express";
import * as authController from "../controllers/authController.js";
import * as chatController from "../controllers/chatController.js";

import { verifyToken } from "../lib/jwt.js";

const router = express.Router();

// Auth routes
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", verifyToken, authController.getMe);
router.put("/auth/avatar", verifyToken, authController.updateAvatar);

// Chat routes
router.get("/chat/conversations", verifyToken, chatController.getConversations);
router.post("/chat/private", verifyToken, chatController.startPrivateChat);
router.post("/chat/group", verifyToken, chatController.createGroup);
router.get("/chat/:conversationId", verifyToken, chatController.getHistory);
