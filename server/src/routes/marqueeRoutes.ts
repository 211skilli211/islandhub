
import { Router } from 'express';
import { createMarquee, getActiveMarquees, toggleMarquee, clearAllMarquees, updateMarqueeSettings } from '../controllers/marqueeController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';
import { pool } from '../config/db';

const router = Router();

// @route   GET /api/marquee
// @desc    Get active marquee messages
// @access  Public
router.get('/', getActiveMarquees);

// @route   POST /api/marquee
// @desc    Create a marquee message
// @access  Private
router.post('/', authenticateJWT, createMarquee);

// @route   POST /api/marquee/settings
// @desc    Update marquee settings
// @access  Private (Admin)
router.post('/settings', authenticateJWT, isAdmin, updateMarqueeSettings);

// @route   DELETE /api/marquee
// @desc    Clear all active marquees
// @access  Private
router.delete('/', authenticateJWT, isAdmin, clearAllMarquees);

// @route   PATCH /api/marquee/:id
// @desc    Update marquee message
// @access  Private
router.patch('/:id', authenticateJWT, toggleMarquee);

// @route   DELETE /api/marquee/:id
// @desc    Delete a marquee message
// @access  Private
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM text_marquee WHERE marquee_id = $1', [id]);
        res.json({ message: 'Marquee deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

export default router;
