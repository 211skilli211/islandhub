import { Router } from 'express';
import { register, login, updateUserRole, verifyEmail } from '../controllers/authController';
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

// Google Auth routes temporarily disabled until type conflicts resolved
// Will be re-enabled once passport types are properly configured

export default router;
