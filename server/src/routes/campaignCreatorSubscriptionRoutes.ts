import { Router } from 'express';
import { getMyCampaignCreatorSubscription, submitNonprofitVerification } from '../controllers/campaignCreatorSubscriptionController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, getMyCampaignCreatorSubscription);
router.post('/verify-nonprofit', authenticateJWT, submitNonprofitVerification);

export default router;
