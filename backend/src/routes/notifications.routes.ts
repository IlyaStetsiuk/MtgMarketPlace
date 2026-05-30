import { Router } from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);

export default router;
