import express from 'express';
import { createPaymentIntent, handleWebhook, getOrder, processRefund } from '../controllers/paymentController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();

// Create payment intent (protected)
router.post('/create-intent', authenticateJWT, createPaymentIntent);

// Get order details (protected)
router.get('/orders/:orderId', authenticateJWT, getOrder);

// Webhook endpoint (no auth - verified by signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Admin: Process refund
router.post('/refund', authenticateJWT, processRefund);

export default router;
