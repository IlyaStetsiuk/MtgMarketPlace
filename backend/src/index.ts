import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import { setupSocket } from './socket';
import { startAuctionExpiryJob } from './jobs/auctionExpiry.job';
import { env } from './config/env';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: env.FRONTEND_URL, credentials: true },
});

setupSocket(io);
startAuctionExpiryJob();

httpServer.listen(env.PORT, () => {
  console.log(`[server] running on http://localhost:${env.PORT}`);
});
