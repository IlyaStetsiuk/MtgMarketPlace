import { Router } from 'express';
import { getReviews, createReview } from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/user/:userId', getReviews);
router.post('/', authenticate, createReview);

export default router;
