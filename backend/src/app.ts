import express from 'express';
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

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/auctions', auctionsRoutes);
app.use('/api/bids', bidsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/scryfall', scryfallRoutes);

app.use(errorHandler);

export default app;
