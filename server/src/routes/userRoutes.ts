import { Router } from 'express';
import { updateProfile, getProfile, getCurrentUser, changePassword, requestEmailChange, deleteAccount, enable2FA, verify2FA, disable2FA } from '../controllers/userController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateJWT, getCurrentUser);

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Public
router.get('/:id', getProfile);

// @route   PUT /api/users/update
// @desc    Update user profile data
// @access  Private
router.put('/update', authenticateJWT, updateProfile);

// @route   POST /api/users/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateJWT, changePassword);

// @route   POST /api/users/change-email
// @desc    Request email change
// @access  Private
router.post('/change-email', authenticateJWT, requestEmailChange);

// @route   DELETE /api/users/delete-account
// @desc    Delete user account
// @access  Private
router.delete('/delete-account', authenticateJWT, deleteAccount);

// @route   POST /api/users/2fa/enable
// @desc    Enable 2FA
// @access  Private
router.post('/2fa/enable', authenticateJWT, enable2FA);

// @route   POST /api/users/2fa/verify
// @desc    Verify and activate 2FA
// @access  Private
router.post('/2fa/verify', authenticateJWT, verify2FA);

// @route   POST /api/users/2fa/disable
// @desc    Disable 2FA
// @access  Private
router.post('/2fa/disable', authenticateJWT, disable2FA);

export default router;
