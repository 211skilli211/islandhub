import { Router } from 'express';
import { getActiveBanners } from '../controllers/promotionController';

const router = Router();

// Public routes
router.get('/active', getActiveBanners);

export default router;
