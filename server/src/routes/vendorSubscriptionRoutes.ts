import { Router } from 'express';
import { getMyVendorSubscription, syncVendorSubscription, cancelVendorSubscription } from '../controllers/vendorSubscriptionController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, getMyVendorSubscription);
router.post('/sync', authenticateJWT, syncVendorSubscription);
router.post('/cancel', authenticateJWT, cancelVendorSubscription);

export default router;
