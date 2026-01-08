import prisma from "../lib/prisma.js";

export async function sendRequest(req, res) {
  const { targetUsername } = req.body;
  const senderId = req.userId;

  try {
    const receiver = await prisma.user.findUnique({
      where: { username: targetUsername },
    });
    if (!receiver) return res.status(404).json({ error: "User not found" });
    if (receiver.id === senderId)
      return res.status(400).json({ error: "Cannot add yourself" });

    const existing = await prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId: receiver.id,
      },
    });

    if (existing)
      return res.status(400).json({ error: "Request already sent" });

    const request = await prisma.friendRequest.create({
      data: { senderId, receiverId: receiver.id },
    });

    const io = req.app.get("io");

    io.to(`user:${receiver.id}`).emit("new_friend_request", {
      fromUser: req.username,
      requestId: request.id,
    });

    res.json({ message: "Friend request sent", request });
  } catch (e) {
    res.status(500).json({ error: "Failed to send request" });
  }
}

export async function acceptRequest(req, res) {
  const { requestId } = req.body;
  const userId = req.userId;

  try {
    const request = await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
      include: { sender: true },
    });

    const conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [{ userId: userId }, { userId: request.senderId }],
        },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        friends: { connect: { id: request.senderId } },
        friendOf: { connect: { id: request.senderId } },
      },
    });

    res.json({ message: "Accepted", conversationId: conversation.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to accept" });
  }
}

export async function getFriends(req, res) {
  const userId = req.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        friends: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });
    res.json(user ? user.friends : []);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch friends" });
  }
}

export async function getRequests(req, res) {
  const userId = req.userId;
  try {
    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
      },
    });
    res.json(requests);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
}

export async function searchUsers(req, res) {
  const { query } = req.query;
  const userId = req.userId;

  if (!query) return res.json([]);

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: "insensitive",
        },
        id: { not: userId },
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        friends: {
          where: { id: userId },
          select: { id: true },
        },
        receivedRequests: {
          where: { senderId: userId, status: "PENDING" },
          select: { id: true },
        },
        sentRequests: {
          where: { receiverId: userId, status: "PENDING" },
          select: { id: true },
        },
      },
      take: 5,
    });

    const formattedUsers = users.map((u) => {
      let status = "NONE";

      if (u.friends.length > 0) {
        status = "FRIEND";
      } else if (u.receivedRequests.length > 0) {
        status = "SENT";
      } else if (u.sentRequests.length > 0) {
        status = "RECEIVED";
      }

      return {
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        status,
      };
    });

    res.json(formattedUsers);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Search failed" });
  }
}
