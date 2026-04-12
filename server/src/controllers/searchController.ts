import { Request, Response } from 'express';
import { pool } from '../config/db';

export const sitewideSearch = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const isAdmin = (req as any).user?.role === 'admin' && req.path.includes('/admin/');
        const queryStr = String(q);

        // Search Listings
        let listingQuery = `
            SELECT id, title, description, category, type, price, is_promoted, verified, 'listing' as result_type,
                   ts_rank(search_vector, plainto_tsquery('english', $1)) as rank
            FROM listings
            WHERE search_vector @@ plainto_tsquery('english', $1)
        `;

        // If not admin, only show verified
        if (!isAdmin) {
            listingQuery += ' AND verified = TRUE';
        }

        listingQuery += ' ORDER BY rank DESC, is_promoted DESC LIMIT 20';

        // Search Vendors
        let vendorQuery = `
            SELECT id, business_name, bio, location, logo_url, is_featured, 'vendor' as result_type,
                   ts_rank(search_vector, plainto_tsquery('english', $1)) as rank
            FROM vendors
            WHERE search_vector @@ plainto_tsquery('english', $1)
        `;

        vendorQuery += ' ORDER BY rank DESC, is_featured DESC LIMIT 20';

        const [listings, vendors] = await Promise.all([
            pool.query(listingQuery, [queryStr]),
            pool.query(vendorQuery, [queryStr])
        ]);

        const results = [
            ...listings.rows,
            ...vendors.rows
        ].sort((a, b) => b.rank - a.rank);

        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server error during search' });
    }
};

export const adminGlobalSearch = async (req: Request, res: Response) => {
    // Admins get everything, including unverified ones
    return sitewideSearch(req, res);
};
