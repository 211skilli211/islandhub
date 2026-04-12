/**
 * Bulk Operations Routes
 * Vendor bulk listing management
 */

import { Router } from 'express';
import { bulkUpdateStatus, bulkUpdatePrices, bulkDelete, bulkAddToCategory, getBulkStats } from '../controllers/bulkController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.post('/status', bulkUpdateStatus);
router.post('/prices', bulkUpdatePrices);
router.delete('/listings', bulkDelete);
router.post('/category', bulkAddToCategory);
router.get('/stats', getBulkStats);

export default router;