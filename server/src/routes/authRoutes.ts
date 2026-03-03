import { Router } from 'express';
import passport from 'passport';
import { register, login, updateUserRole, verifyEmail, generateToken } from '../controllers/authController';
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
