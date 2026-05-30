import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import { setupSocket } from './socket';
import { startAuctionExpiryJob } from './jobs/auctionExpiry.job';
import { env } from './config/env';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? true : env.FRONTEND_URL,
    credentials: true,
  },
});

setupSocket(io);
startAuctionExpiryJob();

// Safety nets so a single failed outbound request (e.g. an upstream API
// hiccup) can never take the whole server down.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

httpServer.listen(env.PORT, () => {
  console.log(`[server] running on http://localhost:${env.PORT}`);
});
