import { Router } from 'express';
import {
  getConversations,
  getConversation,
  startConversation,
  sendMessage,
} from '../controllers/messages.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getConversations);
router.get('/:id', getConversation);
router.post('/', startConversation);
router.post('/:id/messages', sendMessage);

export default router;
