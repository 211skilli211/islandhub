import { Router } from 'express';
import { createSubscription, getMySubscription } from '../controllers/subscriptionController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateJWT, createSubscription);
router.get('/my', authenticateJWT, getMySubscription);

export default router;
