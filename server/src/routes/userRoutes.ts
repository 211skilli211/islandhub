import { Router } from 'express';
import { updateProfile, getProfile, getCurrentUser, changePassword, requestEmailChange, deleteAccount, enable2FA, verify2FA, disable2FA, requestPasswordReset, resetPassword } from '../controllers/userController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Private routes
router.get('/me', authenticateJWT, getCurrentUser);
router.get('/:id', getProfile);
router.put('/update', authenticateJWT, updateProfile);
router.post('/change-password', authenticateJWT, changePassword);
router.post('/change-email', authenticateJWT, requestEmailChange);
router.delete('/delete-account', authenticateJWT, deleteAccount);
router.post('/2fa/enable', authenticateJWT, enable2FA);
router.post('/2fa/verify', authenticateJWT, verify2FA);
router.post('/2fa/disable', authenticateJWT, disable2FA);

export default router;
