import { Router } from 'express';
// refresh
import {
    bookmarkPost,
    removeBookmark,
    getBookmarks,
    // refresh
    getBookmarkFolders
} from '../controllers/bookmarkController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// @route   POST /api/bookmarks/:postId
// @desc    Bookmark a post
// @access  Private
router.post('/:postId', authenticateJWT, bookmarkPost);

// @route   DELETE /api/bookmarks/:postId
// @desc    Remove bookmark
// @access  Private
router.delete('/:postId', authenticateJWT, removeBookmark);

// @route   GET /api/bookmarks
// @desc    Get user's bookmarks
// @access  Private
router.get('/', authenticateJWT, getBookmarks);

// @route   GET /api/bookmarks/folders
// @desc    Get bookmark folders
// @access  Private
router.get('/folders', authenticateJWT, getBookmarkFolders);

export default router;

