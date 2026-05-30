import { Router } from 'express';
import { getUser, getUserListings, getUserAuctions } from '../controllers/users.controller';

const router = Router();

router.get('/:id', getUser);
router.get('/:id/listings', getUserListings);
router.get('/:id/auctions', getUserAuctions);

export default router;
