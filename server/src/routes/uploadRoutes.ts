import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {
    upload, uploadAvatar, uploadBanner, uploadListingImages, deleteUpload,
    getUserMedia, uploadKYC, kycUpload, getAllMedia, uploadAsset,
    uploadUserProfilePhoto, uploadUserBannerImage, uploadFont,
    uploadStoreAsset, uploadDocument, docUpload
} from '../controllers/uploadController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// All upload routes require authentication
router.use(authenticateJWT);

// Multer error handler middleware
function handleMulterError(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ success: false, message: 'File too large. Maximum size is 100MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(413).json({ success: false, message: 'Too many files. Maximum is 10.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ success: false, message: `Unexpected field: ${err.field}` });
        }
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    if (err) {
        return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
    }
    next();
}

// @route   GET /api/uploads/admin
router.get('/admin', authenticateJWT, isAdmin, getAllMedia);

// @route   GET /api/uploads
router.get('/', authenticateJWT, getUserMedia);

// @route   POST /api/uploads/avatar
router.post('/avatar', upload.single('image'), handleMulterError, uploadAvatar);

// @route   POST /api/uploads/banner
router.post('/banner', upload.single('image'), handleMulterError, uploadBanner);

// @route   POST /api/uploads/kyc
router.post('/kyc', kycUpload.single('file'), handleMulterError, uploadKYC);

// @route   POST /api/uploads/listing
router.post('/listing', upload.array('images', 10), handleMulterError, uploadListingImages);

// @route   POST /api/uploads/stores
router.post('/stores', upload.single('file'), handleMulterError, uploadStoreAsset);

// @route   POST /api/uploads/asset
router.post('/asset', upload.single('image'), handleMulterError, uploadAsset);

// @route   POST /api/uploads/font
router.post('/font', upload.single('font'), handleMulterError, uploadFont);

// @route   POST /api/uploads/document
router.post('/document', docUpload.single('file'), handleMulterError, uploadDocument);

// @route   POST /api/uploads/profile-photo
router.post('/profile-photo', upload.single('image'), handleMulterError, uploadUserProfilePhoto);

// @route   POST /api/uploads/banner-image
router.post('/banner-image', upload.single('image'), handleMulterError, uploadUserBannerImage);

// @route   DELETE /api/uploads/:filename
router.delete('/:filename', deleteUpload);

export default router;
