import { Router } from 'express';
import { getAllStores, updateStore, deleteStore, getStoreBySlug, getMyStores, updateMyStore, createStore, getStoreTemplates, updateMyStoreTemplate } from '../controllers/storeController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

import { getStoreListings } from '../controllers/listingController';

const router = Router();

router.get('/', getAllStores);
router.get('/my', authenticateJWT, getMyStores);
router.get('/my/templates', authenticateJWT, getStoreTemplates);
router.put('/my/templates/:templateId', authenticateJWT, updateMyStoreTemplate);
router.get('/:id/listings', getStoreListings); // New endpoint for fetching store listings
router.get('/slug/:slug', getStoreBySlug);
router.put('/my', authenticateJWT, updateMyStore);
router.post('/', authenticateJWT, isAdmin, createStore);
router.put('/:id', authenticateJWT, isAdmin, updateStore);

router.delete('/:id', authenticateJWT, isAdmin, deleteStore);

export default router;
