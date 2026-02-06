import { Router } from 'express';
import {
    getMenu, createSection, updateSection, deleteSection,
    createMenuItem, updateMenuItem, deleteMenuItem
} from '../controllers/menuController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// Public
router.get('/', getMenu);

// Protected (Admin or Vendor)
router.post('/sections', authenticateJWT, createSection);
router.patch('/sections/:id', authenticateJWT, updateSection);
router.delete('/sections/:id', authenticateJWT, deleteSection);

router.post('/items', authenticateJWT, createMenuItem);
router.patch('/items/:id', authenticateJWT, updateMenuItem);
router.delete('/items/:id', authenticateJWT, deleteMenuItem);

export default router;
