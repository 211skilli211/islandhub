import { Router } from 'express';
import { getSiteSections, saveSiteSection, deleteSiteSection } from '../controllers/siteSectionController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getSiteSections);

// Admin routes
router.post('/', authenticateJWT, isAdmin, saveSiteSection);
router.delete('/:id', authenticateJWT, isAdmin, deleteSiteSection);

export default router;
