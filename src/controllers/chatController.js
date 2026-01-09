import prisma from "../lib/prisma.js";

export async function getHistory(req, res) {
  const { conversationId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: parseInt(conversationId),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { sender: true },
    });

    res.json(messages.reverse());
  } catch (e) {
    console.error("Error fetching history:", e);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}

export async function getConversations(req, res) {
  // console.log("getConversations called for User ID:", req.userId);

  const userId = parseInt(req.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid User ID in Token" });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: userId },
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, avatar: true } },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p.userId !== userId
      );

      const otherUser = otherParticipant?.user;
      const lastMsg = conv.messages[0];
      // console.log("otherUser ", otherUser);

      if (!conv.isGroup && !otherUser) {
        return {
          id: conv.id,
          name: "Unknown User",
          isGroup: false,
          lastMessage: "Error: User missing",
          updatedAt: conv.updatedAt,
        };
      }

      // return {
      //   id: conv.id,
      //   name: conv.isGroup
      //     ? conv.name || "Group"
      //     : otherUser?.username || "Unknown",
      //   isGroup: conv.isGroup,
      //   otherUserId: otherUser?.id,
      //   avatar: conv.isGroup ? null : otherUser.avatar,
      //   lastMessage:
      //     conv.messages[0]?.attachment === null
      //       ? conv.messages[0]?.content
      //       : "Image" || "No messages yet",
      //   updatedAt: conv.updatedAt,
      // };

      return {
        id: conv.id,
        name: conv.isGroup
          ? conv.name || "Group"
          : otherUser?.username || "Unknown",
        isGroup: conv.isGroup,
        otherUserId: otherUser?.id,
        avatar: conv.isGroup ? null : otherUser?.avatar,

        lastMessage: lastMsg
          ? lastMsg.attachment
            ? "Media"
            : lastMsg.content || ""
          : "No messages yet",

        updatedAt: conv.updatedAt,
      };
    });

    res.json(formatted);
  } catch (e) {
    console.error("CRITICAL ERROR in getConversations:", e);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
}

export async function startPrivateChat(req, res) {
  const { targetUserId } = req.body;
  const userId = req.userId;

  try {
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: userId } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
      select: { id: true },
    });

    if (existing) {
      return res.json({ id: existing.id, isNew: false });
    }

    const newChat = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [{ userId: userId }, { userId: targetUserId }],
        },
      },
      select: { id: true },
    });

    res.json({ id: newChat.id, isNew: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to start chat" });
  }
}

export async function createGroup(req, res) {
  const { name, participantIds } = req.body;
  const userId = req.userId;

  try {
    const group = await prisma.conversation.create({
      data: {
        name,
        isGroup: true,
        participants: {
          create: [
            { userId: userId },
            ...participantIds.map((id) => ({ userId: id })),
          ],
        },
      },
      select: { id: true },
    });

    res.json({ id: group.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create group" });
  }
}
