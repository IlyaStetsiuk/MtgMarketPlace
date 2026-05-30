import { Router } from 'express';
import { getAuctions, getAuction, createAuction, cancelAuction, getMyAuctions } from '../controllers/auctions.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getAuctions);
router.get('/mine', authenticate, getMyAuctions);
router.get('/:id', getAuction);
router.post('/', authenticate, createAuction);
router.delete('/:id', authenticate, cancelAuction);

export default router;
