import express from 'express';
import { sendMessage, getConversation, getMyConversations, getDeliveryMessages } from '../controllers/messageController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateJWT, sendMessage);
router.get('/my', authenticateJWT, getMyConversations);
router.get('/delivery/:deliveryId', authenticateJWT, getDeliveryMessages);
router.get('/with/:otherUserId', authenticateJWT, getConversation);

export default router;
