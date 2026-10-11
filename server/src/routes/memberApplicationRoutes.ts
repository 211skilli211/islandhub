/**
 * Marketplace (SKN Bridge Trade) member applications.
 *
 * Mounted at `/api/admin/member-applications`, behind `authenticateJWT, isAdmin`
 * via `adminRoutes.ts` — the same guard as every other admin surface, so there is
 * no second permission model to keep in step.
 *
 * These applications are submitted on the public marketplace site and stored in
 * the shared database's `islandhub` schema. This is the only read path for them.
 */
import { Router } from 'express';
import {
    getMemberApplications,
    getMemberApplication,
    updateMemberApplicationStatus,
} from '../controllers/memberApplicationController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// The application queue: undecided first, oldest first.
router.get('/', authenticateJWT, isAdmin, getMemberApplications);

// One application in full.
router.get('/:id', authenticateJWT, isAdmin, getMemberApplication);

// Move it through received → contacted → verified → approved/rejected.
router.patch('/:id/status', authenticateJWT, isAdmin, updateMemberApplicationStatus);

export default router;
