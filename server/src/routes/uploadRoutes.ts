import { Router } from 'express';
import { upload, uploadAvatar, uploadBanner, uploadListingImages, deleteUpload, getUserMedia, uploadKYC, kycUpload, getAllMedia, uploadAsset, uploadUserProfilePhoto, uploadUserBannerImage, uploadFont, uploadStoreAsset } from '../controllers/uploadController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// All upload routes require authentication
router.use(authenticateJWT);

// @route   GET /api/uploads/admin
// @desc    Get all media (Admin only)
// @access  Private (Admin)
router.get('/admin', authenticateJWT, isAdmin, getAllMedia);

// @route   GET /api/uploads
// @desc    Get all user media
// @access  Private
router.get('/', authenticateJWT, getUserMedia);

// @route   POST /api/uploads/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', upload.single('image'), uploadAvatar);

// @route   POST /api/uploads/banner
// @desc    Upload vendor banner
// @access  Private
router.post('/banner', upload.single('image'), uploadBanner);

// @route   POST /api/uploads/kyc
// @desc    Upload KYC document (PDF/Image)
// @access  Private
router.post('/kyc', kycUpload.single('file'), uploadKYC);

// @route   POST /api/uploads/listing
// @desc    Upload listing images (multiple)
// @access  Private
router.post('/listing', upload.array('images', 10), uploadListingImages);

// @route   POST /api/uploads/stores
// @desc    Upload store assets (logo/banner)
// @access  Private
router.post('/stores', upload.single('file'), uploadStoreAsset);

// @route   POST /api/uploads/asset
// @desc    Upload general asset
// @access  Private (Admin check inside controller or here)
router.post('/asset', upload.single('image'), uploadAsset);

// @route   POST /api/uploads/font
// @desc    Upload custom font file
// @access  Private
router.post('/font', upload.single('font'), uploadFont);

// @route   POST /api/uploads/profile-photo
// @desc    Upload user profile photo
// @access  Private
router.post('/profile-photo', upload.single('image'), uploadUserProfilePhoto);

// @route   POST /api/uploads/banner-image
// @desc    Upload user banner image
// @access  Private
router.post('/banner-image', upload.single('image'), uploadUserBannerImage);

// @route   DELETE /api/uploads/:filename
// @desc    Delete uploaded file
// @access  Private
router.delete('/:filename', deleteUpload);

export default router;
