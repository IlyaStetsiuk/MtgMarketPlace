import { Router } from 'express';
import { getListings, getListing, createListing, deleteListing, getMyListings } from '../controllers/listings.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getListings);
router.get('/mine', authenticate, getMyListings);
router.get('/:id', getListing);
router.post('/', authenticate, createListing);
router.delete('/:id', authenticate, deleteListing);

export default router;
