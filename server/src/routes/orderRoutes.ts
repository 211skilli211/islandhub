import { Router } from 'express';
import { 
    createOrder, 
    getOrder, 
    getMyOrders, 
    getStoreOrders, 
    updateOrderStatus,
    cancelOrder,
    getOrderStatusHistory,
    retryPayment 
} from '../controllers/orderController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { applyCustomerVipBenefits } from '../middleware/subscriptionMiddleware';

const router = Router();

// @route   POST /api/orders
// @desc    Create a new order (pending)
// @access  Private (or Optional Auth)
router.post('/', authenticateJWT, applyCustomerVipBenefits, createOrder);

// @route   GET /api/orders/me
// @desc    Get current user's orders
// @access  Private
router.get('/me', authenticateJWT, getMyOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', authenticateJWT, getOrder);

// @route   GET /api/orders/store/:storeId
// @desc    Get active orders for a store (KDS)
// @access  Private (Vendor)
router.get('/store/:storeId', authenticateJWT, getStoreOrders);

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private (Vendor/Admin)
router.patch('/:id/status', authenticateJWT, updateOrderStatus);

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private (Order Owner or Admin)
router.patch('/:id/cancel', authenticateJWT, cancelOrder);

// @route   GET /api/orders/:id/history
// @desc    Get order status history
// @access  Private (Order Owner or Admin)
router.get('/:id/history', authenticateJWT, getOrderStatusHistory);

// @route   POST /api/orders/:id/retry
// @desc    Retry payment for a pending order
// @access  Private (Order Owner)
router.post('/:id/retry', authenticateJWT, retryPayment);

export default router;
