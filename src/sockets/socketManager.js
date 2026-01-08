import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { pubClient } from "../config/redis.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export default (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;

    console.log(`Authenticated User Connected: ${userId}`);

    socket.join(`user:${userId}`);

    await pubClient.sAdd("online_users", userId.toString());

    io.emit("user_status_change", { userId: userId, status: "online" });

    socket.on("get_online_users", async () => {
      const onlineIds = await pubClient.sMembers("online_users");
      socket.emit("online_users_list", onlineIds);
    });

    socket.on("join_room", (conversationId) => {
      const roomName = conversationId.toString();
      socket.join(roomName);
      console.log(`User ${userId} joined room: ${roomName}`);
    });

    socket.on("mark_seen", async ({ conversationId }) => {
      try {
        await prisma.conversationParticipant.update({
          where: {
            userId_conversationId: {
              userId: userId,
              conversationId: parseInt(conversationId),
            },
          },
          data: { lastReadAt: new Date() },
        });

        io.to(conversationId).emit("messages_seen", {
          userId: userId,
          conversationId,
          readAt: new Date(),
        });
      } catch (e) {
        console.error("Error marking seen:", e);
      }
    });

    socket.on("send_message", async (data) => {
      const { conversationId, content, attachment } = data;

      const convIdInt = parseInt(conversationId);
      const roomName = conversationId.toString();

      try {
        const newMessage = await prisma.message.create({
          data: {
            content: content || "",
            attachment: attachment || null,
            conversationId: convIdInt,
            senderId: userId,
          },
          include: {
            sender: {
              select: { username: true, id: true, avatar: true },
            },
          },
        });

        io.to(roomName).emit("receive_message", newMessage);
      } catch (e) {
        console.error("Failed to send message:", e);
      }
    });

    socket.on("typing_start", (conversationId) =>
      socket
        .to(conversationId.toString())
        .emit("user_typing", { userId: userId, isTyping: true })
    );

    socket.on("typing_stop", (conversationId) =>
      socket
        .to(conversationId.toString())
        .emit("user_typing", { userId: userId, isTyping: false })
    );

    socket.on("disconnect", async () => {
      await pubClient.sRem("online_users", userId.toString());

      io.emit("user_status_change", {
        userId: userId,
        status: "offline",
      });

      console.log(`User ${userId} disconnected`);
    });
  });
};
