import { Router } from 'express';
import { createBid, getAuctionBids, getMyBids } from '../controllers/bids.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createBid);
router.get('/mine', authenticate, getMyBids);
router.get('/auction/:auctionId', getAuctionBids);

export default router;
