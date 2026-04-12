import { Router, Request, Response } from 'express';
import { handleStripeWebhook } from '../controllers/stripeWebhookController';
import { handleCryptoWebhook } from '../controllers/cryptoController';
import { handleWiPayWebhook } from '../controllers/wipayWebhookController';

const router = Router();

// @route   POST /api/webhooks/stripe
// @desc    Handle Stripe webhook events
// @access  Public (verified by signature)
router.post('/stripe', async (req: Request, res: Response) => {
    await handleStripeWebhook(req, res);
});

// @route   POST /api/webhooks/crypto
// @desc    Handle crypto gateway webhook events
// @access  Public (verified by signature)
router.post('/crypto', async (req: Request, res: Response) => {
    await handleCryptoWebhook(req, res);
});

// @route   POST /api/webhooks/wipay
// @desc    Handle WiPay webhook events
// @access  Public (verified by signature)
router.post('/wipay', async (req: Request, res: Response) => {
    await handleWiPayWebhook(req, res);
});

export default router;
