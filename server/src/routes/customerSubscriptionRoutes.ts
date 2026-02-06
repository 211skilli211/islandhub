import { Router } from 'express';
import { getMyCustomerSubscription } from '../controllers/customerSubscriptionController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.get('/my', authenticateJWT, getMyCustomerSubscription);

export default router;
