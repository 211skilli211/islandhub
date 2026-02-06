import { Router } from 'express';
import { createPayPalOrder, capturePayPalOrder } from '../controllers/paypalController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// @route   POST /api/payments/paypal/create
// @desc    Create PayPal order for donation
// @access  Public (optional auth)
router.post('/create', optionalAuth, createPayPalOrder);

// @route   POST /api/payments/paypal/capture
// @desc    Capture PayPal order after user approval
// @access  Public
router.post('/capture', capturePayPalOrder);

export default router;
