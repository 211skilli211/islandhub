import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    mergeCart,
    updateCartSettings
} from '../controllers/cartController';
import { authenticateJWT, optionalAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Get cart (works for both authenticated and guest users)
router.get('/', optionalAuth, getCart);

// Add item to cart
router.post('/add', optionalAuth, addToCart);

// Update cart item quantity
router.patch('/items/:itemId', updateCartItem);

// Remove item from cart
router.delete('/items/:itemId', removeFromCart);

// Clear cart
router.delete('/clear', optionalAuth, clearCart);

// Merge guest cart with user cart (on login)
router.post('/merge', authenticateJWT, mergeCart);

// Update global cart settings (delivery/pickup)
router.patch('/settings', optionalAuth, updateCartSettings);

export default router;
