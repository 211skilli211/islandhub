import { Router } from 'express';
// refresh
// refresh
import {
    getGroups,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    getGroupMembers,
    getGroupPosts,
    createGroupPost,
    requestToJoin
} from '../controllers/groupController';
import { authenticateJWT, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/groups
// @desc    Get all groups
// @access  Public
router.get('/', getGroups);

// @route   GET /api/groups/:id
// @desc    Get group details
// @access  Public
router.get('/:id', getGroup);

// @route   POST /api/groups
// @desc    Create a group
// @access  Private
router.post('/', authenticateJWT, createGroup);

// @route   PATCH /api/groups/:id
// @desc    Update group
// @access  Private (owner/admin)
router.patch('/:id', authenticateJWT, updateGroup);

// @route   DELETE /api/groups/:id
// @desc    Delete group
// @access  Private (owner)
router.delete('/:id', authenticateJWT, deleteGroup);

// @route   POST /api/groups/:id/join
// @desc    Join group
// @access  Private
router.post('/:id/join', authenticateJWT, joinGroup);

// @route   POST /api/groups/:id/leave
// @desc    Leave group
// @access  Private
router.post('/:id/leave', authenticateJWT, leaveGroup);

// @route   GET /api/groups/:id/members
// @desc    Get group members
// @access  Public
router.get('/:id/members', getGroupMembers);

// @route   GET /api/groups/:id/posts
// @desc    Get group posts
// @access  Public
router.get('/:id/posts', getGroupPosts);

// @route   POST /api/groups/:id/posts
// @desc    Create group post
// @access  Private (members only)
router.post('/:id/posts', authenticateJWT, createGroupPost);

// @route   POST /api/groups/:id/request-join
// @desc    Request to join private group
// @access  Private
router.post('/:id/request-join', authenticateJWT, requestToJoin);

export default router;

