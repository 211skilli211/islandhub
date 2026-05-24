import { Request, Response } from 'express';
import multer from 'multer';
import { pool } from '../config/db';
import { DatabaseStorageProvider, StorageProvider } from '../utils/storageProvider';

// Database-backed storage - persists across deploys on Neon PostgreSQL
const storageProvider: StorageProvider = new DatabaseStorageProvider();

// Multer memory storage (files in buffer for DB upload)
const storage = multer.memoryStorage();

// File filter for images, videos, fonts, and PDFs
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
        'image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/x-png', 'image/gif', 'image/avif',
        'image/heic', 'image/heif',
        'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/avi',
        'font/ttf', 'font/otf', 'font/woff', 'font/woff2',
        'application/x-font-ttf', 'application/x-font-otf', 'application/font-woff', 'application/font-woff2',
        'application/pdf'
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(ttf|otf|woff|woff2|pdf)$/i)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type (${file.mimetype}). Supports Images, Videos, Fonts, and PDF.`));
    }
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });

// PDF-only filter
const pdfFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf' || file.originalname.match(/\.pdf$/i)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files allowed.'));
    }
};
export const docUpload = multer({ storage, fileFilter: pdfFilter, limits: { fileSize: 25 * 1024 * 1024 } });

// KYC filter (images + PDF)
const kycFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP, and PDF allowed.'));
};
export const kycUpload = multer({ storage, fileFilter: kycFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const getUserId = (req: Request) => (req.user as any)?.id;

// Upload avatar
export const uploadAvatar = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const url = await storageProvider.uploadFile(req.file, userId);
        await pool.query('UPDATE users SET avatar_url = $1 WHERE user_id = $2', [url, userId]);
        res.json({ success: true, url, message: 'Avatar uploaded' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
};

// Upload banner
export const uploadBanner = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const url = await storageProvider.uploadFile(req.file, userId);
        await pool.query('UPDATE users SET cover_photo_url = $1 WHERE user_id = $2', [url, userId]);
        res.json({ success: true, url, message: 'Banner uploaded' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
};

// Upload listing images
export const uploadListingImages = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0)
            return res.status(400).json({ message: 'No files uploaded' });
        const listingId = req.body.listingId;
        if (!listingId) return res.status(400).json({ message: 'Listing ID required' });
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const listingCheck = await pool.query('SELECT user_id FROM listings WHERE id = $1', [listingId]);
        if (listingCheck.rows.length === 0) return res.status(404).json({ message: 'Listing not found' });
        if (listingCheck.rows[0].user_id !== userId && (req.user as any)?.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        const files = req.files as Express.Multer.File[];
        const imageUrls: string[] = [];
        for (const file of files) {
            const url = await storageProvider.uploadFile(file, userId);
            imageUrls.push(url);
        }
        await pool.query('UPDATE listings SET images = array_cat(COALESCE(images, ARRAY[]::text[]), $1::text[]) WHERE id = $2', [imageUrls, listingId]);
        res.json({ success: true, urls: imageUrls, message: 'Images uploaded' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
};

// Upload general asset (admin)
export const uploadAsset = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const userId = getUserId(req);
        const url = await storageProvider.uploadFile(req.file, userId);
        res.json({ success: true, url, message: 'Asset uploaded' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
};

// Upload font
export const uploadFont = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No font file uploaded' });
        const userId = getUserId(req);
        const url = await storageProvider.uploadFile(req.file, userId);
        res.json({ success: true, url, message: 'Font uploaded' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
};

// Upload profile photo
export const uploadUserProfilePhoto = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const url = await storageProvider.uploadFile(req.file, userId);
        await pool.query('UPDATE users SET profile_photo_url = $1 WHERE user_id = $2', [url, userId]);
        res.json({ success: true, url, message: 'Profile photo uploaded' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
};

// Upload user banner image
export const uploadUserBannerImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const url = await storageProvider.uploadFile(req.file, userId);
        await pool.query('UPDATE users SET banner_image_url = $1 WHERE user_id = $2', [url, userId]);
        res.json({ success: true, url, message: 'Banner uploaded' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
};

// Upload KYC document
export const uploadKYC = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const url = await storageProvider.uploadFile(req.file, userId);
        res.json({ success: true, url, message: 'Document uploaded' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
};

// Upload PDF document (admin)
export const uploadDocument = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const url = await storageProvider.uploadFile(req.file, userId);
        res.json({ success: true, url, message: 'Document uploaded' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
};

// Upload store asset (logo/banner)
export const uploadStoreAsset = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const url = await storageProvider.uploadFile(req.file, userId);
        res.json({ success: true, url, message: 'Store asset uploaded' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
};

// Delete upload
export const deleteUpload = async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        await storageProvider.deleteFile(filename);
        await pool.query('DELETE FROM media WHERE filename = $1 AND user_id = $2', [filename, userId]);
        res.json({ success: true, message: 'File deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Delete failed' });
    }
};

// Get user media library
export const getUserMedia = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const { page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const result = await pool.query('SELECT * FROM media WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [userId, limit, offset]);
        const countRes = await pool.query('SELECT COUNT(*) FROM media WHERE user_id = $1', [userId]);
        res.json({ success: true, media: result.rows, total: parseInt(countRes.rows[0].count), page: Number(page) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed' });
    }
};

// Get all media (admin)
export const getAllMedia = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
        const { page = 1, limit = 20, search, date } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = 'SELECT m.*, u.name as user_name FROM media m LEFT JOIN users u ON m.user_id = u.user_id WHERE 1=1';
        let countQ = 'SELECT COUNT(*) FROM media WHERE 1=1';
        const params: any[] = [];
        if (search) {
            query += ` AND (m.filename ILIKE $${params.length + 1} OR m.url ILIKE $${params.length + 1})`;
            countQ += ` AND (filename ILIKE $${params.length + 1} OR url ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }
        if (date) {
            const interval = date === 'today' ? '1 day' : date === 'week' ? '7 days' : date === 'month' ? '30 days' : '';
            if (interval) { query += ` AND m.created_at >= NOW() - INTERVAL '${interval}'`; countQ += ` AND created_at >= NOW() - INTERVAL '${interval}'`; }
        }
        query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(Number(limit), offset);
        const [result, countResult] = await Promise.all([pool.query(query, params), pool.query(countQ, params.slice(0, -2))]);
        res.json({ assets: result.rows, total: parseInt(countResult.rows[0].count), page: Number(page), limit: Number(limit), totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit)) });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed' });
    }
};
