import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    const unreadCount = notifications.filter((n) => !n.readAt).length;
    res.json({ data: notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.notification.update({
      where: { id: req.params.id, userId: req.user!.id },
      data: { readAt: new Date() },
    });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, readAt: null },
      data: { readAt: new Date() },
    });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    next(err);
  }
}
