import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { emitToConversation } from '../services/socket.service';
import { createNotification } from '../services/notification.service';

const sellerSelect = { id: true, username: true, averageRating: true };

export async function getConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const convs = await prisma.conversation.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      include: {
        user1: { select: sellerSelect },
        user2: { select: sellerSelect },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { id: true, username: true } } },
        },
      },
      orderBy: { lastMsgAt: 'desc' },
    });

    // Attach unread count per conversation
    const withUnread = await Promise.all(
      convs.map(async (c) => {
        const unread = await prisma.message.count({
          where: { conversationId: c.id, senderId: { not: userId }, readAt: null },
        });
        return { ...c, unreadCount: unread };
      }),
    );

    res.json({ data: withUnread });
  } catch (err) {
    next(err);
  }
}

export async function getConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const conv = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        user1: { select: sellerSelect },
        user2: { select: sellerSelect },
        messages: {
          include: { sender: { select: { id: true, username: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conv) throw new AppError('Conversation not found', 404);
    if (conv.user1Id !== userId && conv.user2Id !== userId) throw new AppError('Forbidden', 403);

    // Mark incoming messages as read
    await prisma.message.updateMany({
      where: { conversationId: conv.id, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });

    res.json({ data: conv });
  } catch (err) {
    next(err);
  }
}

const startSchema = z.object({
  otherUserId: z.string(),
  auctionId: z.string().optional(),
  listingId: z.string().optional(),
  message: z.string().min(1).max(2000).optional(),
});

export async function startConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const { otherUserId, auctionId, listingId, message } = startSchema.parse(req.body);
    const userId = req.user!.id;

    if (userId === otherUserId) throw new AppError('Cannot message yourself', 400);

    const other = await prisma.user.findUnique({ where: { id: otherUserId } });
    if (!other) throw new AppError('User not found', 404);

    // Find an existing conversation for this exact context
    let conv = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: userId },
        ],
        auctionId: auctionId ?? null,
        listingId: listingId ?? null,
      },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: { user1Id: userId, user2Id: otherUserId, auctionId, listingId },
      });
    }

    if (message) {
      await deliverMessage(conv.id, userId, other.id, other.username, message);
    }

    res.status(201).json({ data: conv });
  } catch (err) {
    next(err);
  }
}

const msgSchema = z.object({ content: z.string().min(1).max(2000) });

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { content } = msgSchema.parse(req.body);
    const userId = req.user!.id;
    const convId = req.params.id;

    const conv = await prisma.conversation.findUnique({ where: { id: convId } });
    if (!conv) throw new AppError('Conversation not found', 404);
    if (conv.user1Id !== userId && conv.user2Id !== userId) throw new AppError('Forbidden', 403);

    const recipientId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
    const recipient = await prisma.user.findUnique({ where: { id: recipientId } });

    const msg = await deliverMessage(convId, userId, recipientId, recipient?.username ?? '', content);
    res.status(201).json({ data: msg });
  } catch (err) {
    next(err);
  }
}

async function deliverMessage(
  convId: string,
  senderId: string,
  recipientId: string,
  recipientUsername: string,
  content: string,
) {
  const msg = await prisma.message.create({
    data: { conversationId: convId, senderId, content },
    include: { sender: { select: { id: true, username: true } } },
  });

  await prisma.conversation.update({
    where: { id: convId },
    data: { lastMsgAt: new Date() },
  });

  emitToConversation(convId, msg);

  await createNotification(
    recipientId,
    'new_message',
    `New message from @${msg.sender.username}`,
    content.length > 60 ? content.slice(0, 60) + '…' : content,
    `/messages/${convId}`,
  );

  // Suppress unused var warning
  void recipientUsername;

  return msg;
}
