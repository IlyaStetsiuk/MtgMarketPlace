import { prisma } from '../utils/prisma';
import { emitToUser } from './socket.service';

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  link?: string,
) {
  try {
    const notification = await prisma.notification.create({
      data: { userId, type, title, body, link },
    });
    emitToUser(userId, 'notification:new', notification);
    return notification;
  } catch (err) {
    console.error('[Notification] failed to create', err);
  }
}
