import { Router } from 'express';
import { createCryptoCharge } from '../controllers/cryptoController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// @route   POST /api/payments/crypto/create
// @desc    Create crypto charge for donation
// @access  Public (optional auth)
router.post('/create', optionalAuth, createCryptoCharge);

export default router;
