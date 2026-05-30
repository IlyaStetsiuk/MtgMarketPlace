import { Server } from 'socket.io';
import { verifyToken } from '../services/auth.service';
import { setIo } from '../services/socket.service';

function parseCookieToken(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? match[1] : null;
}

export function setupSocket(io: Server) {
  setIo(io);

  io.use(async (socket, next) => {
    try {
      const token =
        parseCookieToken(socket.handshake.headers.cookie) ??
        (socket.handshake.auth?.token as string | undefined);

      if (token) {
        const payload = verifyToken(token);
        (socket.data as { userId?: string }).userId = payload.userId;
      }
    } catch {
      // unauthenticated socket — allowed for read-only viewing
    }
    next();
  });

  io.on('connection', (socket) => {
    socket.on('join:auction', (auctionId: string) => {
      if (typeof auctionId === 'string') {
        socket.join(`auction:${auctionId}`);
      }
    });

    socket.on('leave:auction', (auctionId: string) => {
      if (typeof auctionId === 'string') {
        socket.leave(`auction:${auctionId}`);
      }
    });
  });
}
