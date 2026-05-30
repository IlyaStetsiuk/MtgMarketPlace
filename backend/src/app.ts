import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import listingsRoutes from './routes/listings.routes';
import auctionsRoutes from './routes/auctions.routes';
import bidsRoutes from './routes/bids.routes';
import reviewsRoutes from './routes/reviews.routes';
import scryfallRoutes from './routes/scryfall.routes';

const isProd = process.env.NODE_ENV === 'production';

const app = express();

// In production the frontend is served from the same origin, so reflect the
// request origin; in dev allow the Vite dev server.
app.use(cors({ origin: isProd ? true : env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/auctions', auctionsRoutes);
app.use('/api/bids', bidsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/scryfall', scryfallRoutes);

// Serve the built React app and fall back to index.html for client routes.
if (isProd) {
  const clientDir = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(clientDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

app.use(errorHandler);

export default app;
