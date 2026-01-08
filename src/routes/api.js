import express from "express";
import * as authController from "../controllers/authController.js";
import * as chatController from "../controllers/chatController.js";
import * as friendController from "../controllers/friendController.js";
import * as uploadController from "../controllers/uploadController.js";
import { verifyToken } from "../lib/jwt.js";
import { upload } from "../lib/cloudinary.js";

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

// Friend routes
router.get("/friends/requests", verifyToken, friendController.getRequests);
router.get("/friends", verifyToken, friendController.getFriends);
router.post("/friends/request", verifyToken, friendController.sendRequest);
router.post("/friends/accept", verifyToken, friendController.acceptRequest);

// User routes
router.get("/users/search", verifyToken, friendController.searchUsers);

// Upload route
router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  uploadController.uploadFile
);

export default router;
