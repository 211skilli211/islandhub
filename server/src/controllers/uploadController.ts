import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../config/db';

import { LocalStorageProvider, StorageProvider } from '../utils/storageProvider';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const storageProvider: StorageProvider = new LocalStorageProvider(uploadsDir);

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// File filter for images and videos (for hero assets)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
        'image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/x-png', 'image/webp', 'image/gif', 'image/avif',
        'image/heic', 'image/heif',
        'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/avi',
        'font/ttf', 'font/otf', 'font/woff', 'font/woff2', 'application/x-font-ttf', 'application/x-font-otf', 'application/font-woff', 'application/font-woff2'
    ];

    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(ttf|otf|woff|woff2)$/i)) {
        cb(null, true);
    } else {
        console.warn(`[UPLOAD REJECTED] Invalid file type: ${file.mimetype} for file: ${file.originalname}`);
        cb(new Error(`Invalid file type (${file.mimetype}). Support for Images, Videos, and Fonts (TTF, OTF, WOFF2) only.`));
    }
};

// Multer upload instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for high-res hero videos/images
    }
});

// Upload avatar
export const uploadAvatar = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = (req.user as any)?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const imageUrl = await storageProvider.uploadFile(req.file);

        // Update user's avatar_url in database
        await pool.query(
            'UPDATE users SET avatar_url = $1 WHERE user_id = $2',
            [imageUrl, userId]
        );

        // Record in media table
        const mediaResult = await pool.query(
            'INSERT INTO media (user_id, filename, url, file_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, req.file.filename, imageUrl, req.file.mimetype, req.file.size]
        );

        res.json({
            success: true,
            url: imageUrl,
            message: 'Avatar uploaded successfully',
            media: mediaResult.rows[0]
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload avatar' });
    }
};

// Upload vendor banner
export const uploadBanner = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = (req.user as any)?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const imageUrl = await storageProvider.uploadFile(req.file);

        // Update user's cover_photo_url in database
        await pool.query(
            'UPDATE users SET cover_photo_url = $1 WHERE user_id = $2',
            [imageUrl, userId]
        );

        // Record in media table
        const mediaResult = await pool.query(
            'INSERT INTO media (user_id, filename, url, file_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, req.file.filename, imageUrl, req.file.mimetype, req.file.size]
        );

        res.json({
            success: true,
            url: imageUrl,
            message: 'Banner uploaded successfully',
            media: mediaResult.rows[0]
        });
    } catch (error) {
        console.error('Banner upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload banner' });
    }
};

// Upload listing images (multiple)
export const uploadListingImages = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const listingId = req.body.listingId;
        if (!listingId) {
            return res.status(400).json({ message: 'Listing ID required' });
        }

        const userId = (req.user as any)?.id;

        // Verify user owns this listing
        const listingCheck = await pool.query(
            'SELECT user_id FROM listings WHERE id = $1',
            [listingId]
        );

        if (listingCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listingCheck.rows[0].user_id !== userId && (req.user as any)?.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to upload images for this listing' });
        }

        const files = req.files as Express.Multer.File[];
        const imageUrls: string[] = [];
        const mediaRecords: any[] = [];

        for (const file of files) {
            const url = await storageProvider.uploadFile(file);
            imageUrls.push(url);

            const mediaRes = await pool.query(
                'INSERT INTO media (user_id, filename, url, file_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [userId, file.filename, url, file.mimetype, file.size]
            );
            mediaRecords.push(mediaRes.rows[0]);
        }

        // Add images to listing's images array
        await pool.query(
            'UPDATE listings SET images = array_cat(COALESCE(images, ARRAY[]::text[]), $1::text[]) WHERE id = $2',
            [imageUrls, listingId]
        );

        res.json({
            success: true,
            urls: imageUrls,
            message: 'Images uploaded successfully',
            media: mediaRecords
        });
    } catch (error) {
        console.error('Listing images upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload listing images' });
    }
};

// Upload general asset (Admin/Staff)
export const uploadAsset = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = (req.user as any)?.id;
        const fileUrl = await storageProvider.uploadFile(req.file);

        // Record in media table
        const mediaResult = await pool.query(
            'INSERT INTO media (user_id, filename, url, file_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, req.file.filename, fileUrl, req.file.mimetype, req.file.size]
        );

        res.json({
            success: true,
            url: fileUrl,
            message: 'Asset uploaded successfully',
            media: mediaResult.rows[0]
        });
    } catch (error) {
        console.error('Asset upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload asset' });
    }
};

// Upload Font File
export const uploadFont = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No font file uploaded' });
        }

        const userId = (req.user as any)?.id;
        const fontUrl = await storageProvider.uploadFile(req.file);

        // Extract font family name from filename as a default
        const familyName = path.parse(req.file.originalname).name.replace(/[-_]/g, ' ');

        // Record in media table
        const mediaResult = await pool.query(
            'INSERT INTO media (user_id, filename, url, file_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, req.file.filename, fontUrl, req.file.mimetype, req.file.size]
        );

        res.json({
            success: true,
            url: fontUrl,
            familyName,
            message: 'Font uploaded successfully',
            media: mediaResult.rows[0]
        });
    } catch (error) {
        console.error('Font upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload font file' });
    }
};

// @desc    Upload user profile photo
// @access  Private
export const uploadUserProfilePhoto = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = (req.user as any)?.id;
        const imageUrl = await storageProvider.uploadFile(req.file);

        // Update user's profile_photo_url in database
        await pool.query(
            'UPDATE users SET profile_photo_url = $1 WHERE user_id = $2',
            [imageUrl, userId]
        );

        // Record in media table
        await pool.query(
            'INSERT INTO media (user_id, filename, url, file_type, file_size) VALUES ($1, $2, $3, $4, $5)',
            [userId, req.file.filename, imageUrl, req.file.mimetype, req.file.size]
        );

        res.json({
            success: true,
            url: imageUrl,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Profile photo upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload profile photo' });
    }
};

// @desc    Upload user banner image
// @access  Private
export const uploadUserBannerImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = (req.user as any)?.id;
        const imageUrl = await storageProvider.uploadFile(req.file);

        // Update user's banner_image_url in database
        await pool.query(
            'UPDATE users SET banner_image_url = $1 WHERE user_id = $2',
            [imageUrl, userId]
        );

        // Record in media table
        await pool.query(
            'INSERT INTO media (user_id, filename, url, file_type, file_size) VALUES ($1, $2, $3, $4, $5)',
            [userId, req.file.filename, imageUrl, req.file.mimetype, req.file.size]
        );

        res.json({
            success: true,
            url: imageUrl,
            message: 'Banner image uploaded successfully'
        });
    } catch (error) {
        console.error('Banner image upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload banner image' });
    }
};

// Delete uploaded file
export const deleteUpload = async (req: Request, res: Response) => {
    try {
        const filename = req.params.filename as string;
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Delete file from filesystem/storage
        await storageProvider.deleteFile(filename);

        // Remove reference from database (check users and listings)
        const imageUrl = `/uploads/${filename}`;

        // Delete from media table
        const deleteMediaRes = await pool.query(
            'DELETE FROM media WHERE url = $1 AND user_id = $2 RETURNING filename, url',
            [imageUrl, userId]
        );

        await pool.query(
            'UPDATE users SET avatar_url = NULL WHERE avatar_url = $1 AND user_id = $2',
            [imageUrl, userId]
        );

        await pool.query(
            'UPDATE listings SET images = array_remove(images, $1) WHERE user_id = $2',
            [imageUrl, userId]
        );

        res.json({
            success: true,
            message: 'File deleted successfully',
            deleted: deleteMediaRes.rows[0] || { filename, url: imageUrl }
        });
    } catch (error) {
        console.error('Delete upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete file' });
    }
};

// File filter for KYC (Images + PDF)
const kycFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.'));
    }
};

export const kycUpload = multer({
    storage,
    fileFilter: kycFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Upload KYC Document
export const uploadKYC = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = (req.user as any)?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const fileUrl = await storageProvider.uploadFile(req.file);

        // Record in media table
        const mediaResult = await pool.query(
            'INSERT INTO media (user_id, filename, url, file_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, req.file.filename, fileUrl, req.file.mimetype, req.file.size]
        );

        res.json({
            success: true,
            url: fileUrl,
            message: 'Document uploaded successfully',
            media: mediaResult.rows[0]
        });
    } catch (error) {
        console.error('KYC upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload document' });
    }
};

// Upload Store Asset (Logo/Banner)
export const uploadStoreAsset = async (req: Request, res: Response) => {
    try {
        console.log('[Upload Store] === INCOMING REQUEST ===');
        console.log('[Upload Store] Headers:', req.headers);
        console.log('[Upload Store] Content-Type:', req.headers['content-type']);
        console.log('[Upload Store] Body:', req.body);
        console.log('[Upload Store] File from multer:', req.file);
        console.log('[Upload Store] User from JWT:', req.user);

        if (!req.file) {
            console.warn('[Upload Store] No file detected in request!');
            console.warn('[Upload Store] Multer error:', (req as any).multerError);
            return res.status(400).json({ message: 'No file uploaded', details: 'Field name should be "file"' });
        }

        const userId = (req.user as any)?.id;
        console.log('[Upload Store] User:', userId, 'File:', req.file.originalname, 'Type:', req.file.mimetype);
        if (!userId) {
            console.warn('[Upload Store] Unauthorized - no user ID in token');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const fileUrl = await storageProvider.uploadFile(req.file);

        // Record in media table
        const mediaResult = await pool.query(
            'INSERT INTO media (user_id, filename, url, file_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, req.file.filename, fileUrl, req.file.mimetype, req.file.size]
        );

        console.log('[Upload Store] Success! URL:', fileUrl);
        res.json({
            success: true,
            url: fileUrl,
            message: 'Store asset uploaded successfully',
            media: mediaResult.rows[0]
        });
    } catch (error) {
        console.error('Store asset upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload store asset' });
    }
};

// Get all user media (Library)
export const getUserMedia = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const result = await pool.query(
            'SELECT * FROM media WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [userId, limit, offset]
        );

        const countRes = await pool.query(
            'SELECT COUNT(*) FROM media WHERE user_id = $1',
            [userId]
        );

        res.json({
            success: true,
            media: result.rows,
            total: parseInt(countRes.rows[0].count),
            page: Number(page)
        });
    } catch (error) {
        console.error('Get user media error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch media library' });
    }
};
// Get all media (Admin only)
export const getAllMedia = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { page = 1, limit = 20, search, date } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const offset = (pageNum - 1) * limitNum;

        let query = 'SELECT m.*, m.id as id, u.name as user_name FROM media m LEFT JOIN users u ON m.user_id = u.user_id WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) FROM media WHERE 1=1';
        const params: any[] = [];

        if (search) {
            query += ` AND (m.filename ILIKE $${params.length + 1} OR m.url ILIKE $${params.length + 1})`;
            countQuery += ` AND (filename ILIKE $${params.length + 1} OR url ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        if (date) {
            let interval = '';
            if (date === 'today') interval = '1 day';
            else if (date === 'week') interval = '7 days';
            else if (date === 'month') interval = '30 days';

            if (interval) {
                query += ` AND m.created_at >= NOW() - INTERVAL '${interval}'`;
                countQuery += ` AND created_at >= NOW() - INTERVAL '${interval}'`;
            }
        }

        query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limitNum, offset);

        const [result, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, params.slice(0, params.length - 2))
        ]);

        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limitNum);

        res.json({
            assets: result.rows,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages
        });
    } catch (error) {
        console.error('Get all media error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
