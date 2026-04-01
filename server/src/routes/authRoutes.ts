import { Router } from 'express';
import passport from 'passport';
import { register, login, updateUserRole, verifyEmail, generateToken, generateRefreshToken, verifyRefreshToken } from '../controllers/authController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { validate } from '../middleware/validation';
import { authSchemas } from '../validation/schemas';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(authSchemas.register), register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validate(authSchemas.login), login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }
        
        const decoded = verifyRefreshToken(refreshToken);
        
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
        
        // Generate new access token
        const accessToken = generateToken(decoded.id);
        const newRefreshToken = generateRefreshToken(decoded.id);
        
        res.json({
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ message: 'Server error during token refresh' });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client should discard tokens)
// @access  Private
router.post('/logout', authenticateJWT, (req, res) => {
    // In a full implementation, you'd blacklist the refresh token in Redis
    // For now, client-side logout is sufficient
    res.json({ message: 'Logged out successfully' });
});

// @route   POST /api/auth/verify-email
// @desc    Verify user email
// @access  Public
router.post('/verify-email', validate(authSchemas.verifyEmail), verifyEmail);

// @route   POST /api/auth/role
// @desc    Update user role
// @access  Private
router.post('/role', authenticateJWT, validate(authSchemas.updateRole), updateUserRole);

// @route   GET /api/auth/google
// @desc    Redirect to Google OAuth
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication
        const user = req.user as any;
        const token = generateToken(user.user_id, user.role);

        // Redirect to frontend with token
        // Use the FRONTEND_URL environment variable if available, otherwise default to local frontend
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
);

export default router;
