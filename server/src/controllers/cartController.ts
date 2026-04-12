import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * Get or create cart for user/session
 */
export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const sessionId = req.headers['x-session-id'] as string;

        if (!userId && !sessionId) {
            return res.status(400).json({ message: 'User ID or Session ID required' });
        }

        let cart;

        // Try to find existing cart
        if (userId) {
            const result = await pool.query(
                'SELECT * FROM carts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
                [userId]
            );
            cart = result.rows[0];
        } else if (sessionId) {
            const result = await pool.query(
                'SELECT * FROM carts WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1',
                [sessionId]
            );
            cart = result.rows[0];
        }

        // Create new cart if none exists
        if (!cart) {
            const insertResult = await pool.query(
                'INSERT INTO carts (user_id, session_id) VALUES ($1, $2) RETURNING *',
                [userId || null, sessionId || null]
            );
            cart = insertResult.rows[0];
        }

        // Get cart items with listing details
        const itemsResult = await pool.query(`
            SELECT 
                ci.*,
                l.title,
                l.type,
                l.price as listing_price,
                l.images[1] as image_url,
                s.name as store_name,
                s.slug as store_slug,
                mi.side_ids,
                mi.donation_suggested
            FROM cart_items ci
            JOIN listings l ON ci.listing_id = l.id
            LEFT JOIN stores s ON l.store_id = s.store_id
            LEFT JOIN menu_items mi ON ci.item_id = mi.item_id
            WHERE ci.cart_id = $1
            ORDER BY ci.created_at DESC
        `, [cart.cart_id]);

        res.json({
            cart,
            items: itemsResult.rows
        });
    } catch (error: any) {
        // Gracefully handle missing tables (Neon fresh database)
        if (error.code === '42P01' || error.code === '42703') {
            console.warn('Carts table not initialized, returning empty cart');
            return res.json({ cart: null, items: [] });
        }
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Failed to retrieve cart' });
    }
};

/**
 * Add item to cart
 */
export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const sessionId = req.headers['x-session-id'] as string;
        const {
            listingId,
            itemId, // New: support for menu items
            quantity = 1,
            rentalStartDate,
            rentalEndDate,
            servicePackage,
            appointmentSlot,
            selectedVariant,
            selectedAddons, // New
            selectedSides // New
        } = req.body;

        if (!listingId && !itemId) {
            return res.status(400).json({ message: 'Listing ID or Item ID required' });
        }

        // Get or create cart
        let cart;
        if (userId) {
            let result = await pool.query(
                'SELECT * FROM carts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
                [userId]
            );
            if (result.rows.length === 0) {
                result = await pool.query(
                    'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
                    [userId]
                );
            }
            cart = result.rows[0];
        } else if (sessionId) {
            let result = await pool.query(
                'SELECT * FROM carts WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1',
                [sessionId]
            );
            if (result.rows.length === 0) {
                result = await pool.query(
                    'INSERT INTO carts (session_id) VALUES ($1) RETURNING *',
                    [sessionId]
                );
            }
            cart = result.rows[0];
        } else {
            return res.status(400).json({ message: 'User ID or Session ID required' });
        }

        // Get listing details
        const listingResult = await pool.query(
            'SELECT * FROM listings WHERE id = $1',
            [listingId]
        );

        if (listingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const listing = listingResult.rows[0];
        let priceSnapshot = listing.price;

        // If it's a menu item, fetch details and calculate dynamic price
        if (itemId) {
            const itemResult = await pool.query('SELECT * FROM menu_items WHERE item_id = $1', [itemId]);
            if (itemResult.rows.length > 0) {
                const menuItem = itemResult.rows[0];
                priceSnapshot = Number(menuItem.price);

                // Add Addon prices
                if (selectedAddons && Array.isArray(selectedAddons)) {
                    selectedAddons.forEach((addon: any) => {
                        if (addon.price) priceSnapshot += Number(addon.price);
                    });
                }

                // Add Variant price if present (regex to find "+ $X.XX")
                if (selectedVariant && typeof selectedVariant === 'object') {
                    Object.values(selectedVariant).forEach((val: any) => {
                        const priceMatch = String(val).match(/\+\s*\$(\d+(\.\d+)?)/);
                        if (priceMatch) priceSnapshot += parseFloat(priceMatch[1]);
                    });
                }
            }
        }

        // Calculate rental duration if applicable
        let rentalDurationDays = null;
        if (rentalStartDate && rentalEndDate) {
            const start = new Date(rentalStartDate);
            const end = new Date(rentalEndDate);
            rentalDurationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Check if item already exists in cart (unique match includes variant/addons for food)
        const existingItem = await pool.query(
            `SELECT * FROM cart_items 
             WHERE cart_id = $1 AND listing_id = $2 
             AND (item_id = $3 OR (item_id IS NULL AND $3 IS NULL))
             AND (selected_variant = $4 OR (selected_variant IS NULL AND $4 IS NULL))
             AND (selected_addons = $5 OR (selected_addons IS NULL AND $5 IS NULL))`,
            [cart.cart_id, listingId, itemId || null,
            selectedVariant ? JSON.stringify(selectedVariant) : null,
            selectedAddons ? JSON.stringify(selectedAddons) : null]
        );

        let cartItem;
        if (existingItem.rows.length > 0) {
            // Update existing item
            cartItem = await pool.query(
                `UPDATE cart_items 
                 SET quantity = quantity + $1,
                     rental_start_date = COALESCE($2, rental_start_date),
                     rental_end_date = COALESCE($3, rental_end_date),
                     rental_duration_days = COALESCE($4, rental_duration_days),
                     service_package = COALESCE($5, service_package),
                     appointment_slot = COALESCE($6, appointment_slot),
                     selected_variant = COALESCE($7, selected_variant),
                     selected_addons = COALESCE($8, selected_addons),
                     selected_sides = COALESCE($9, selected_sides)
                 WHERE item_id = $10
                 RETURNING *`,
                [quantity, rentalStartDate, rentalEndDate, rentalDurationDays,
                    servicePackage, appointmentSlot,
                    selectedVariant ? JSON.stringify(selectedVariant) : null,
                    selectedAddons ? JSON.stringify(selectedAddons) : null,
                    selectedSides ? JSON.stringify(selectedSides) : null,
                    existingItem.rows[0].item_id] // Correct item_id in cart_items table
            );
        } else {
            // Add new item
            cartItem = await pool.query(
                `INSERT INTO cart_items (
                    cart_id, listing_id, item_id, quantity, price_snapshot,
                    rental_start_date, rental_end_date, rental_duration_days,
                    service_package, appointment_slot, selected_variant,
                    selected_addons, selected_sides
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *`,
                [cart.cart_id, listingId, itemId || null, quantity, priceSnapshot,
                    rentalStartDate, rentalEndDate, rentalDurationDays,
                    servicePackage, appointmentSlot,
                selectedVariant ? JSON.stringify(selectedVariant) : null,
                selectedAddons ? JSON.stringify(selectedAddons) : null,
                selectedSides ? JSON.stringify(selectedSides) : null]
            );
        }

        res.json({
            message: 'Item added to cart',
            cartItem: cartItem.rows[0]
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Failed to add item to cart' });
    }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const result = await pool.query(
            'UPDATE cart_items SET quantity = $1 WHERE item_id = $2 RETURNING *',
            [quantity, itemId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.json({
            message: 'Cart item updated',
            cartItem: result.rows[0]
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({ message: 'Failed to update cart item' });
    }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;

        const result = await pool.query(
            'DELETE FROM cart_items WHERE item_id = $1 RETURNING *',
            [itemId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Failed to remove item from cart' });
    }
};

/**
 * Clear entire cart
 */
export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const sessionId = req.headers['x-session-id'] as string;

        if (!userId && !sessionId) {
            return res.status(400).json({ message: 'User ID or Session ID required' });
        }

        let cart;
        if (userId) {
            const result = await pool.query(
                'SELECT * FROM carts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
                [userId]
            );
            cart = result.rows[0];
        } else {
            const result = await pool.query(
                'SELECT * FROM carts WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1',
                [sessionId]
            );
            cart = result.rows[0];
        }

        if (cart) {
            await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.cart_id]);
        }

        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Failed to clear cart' });
    }
};

/**
 * Update cart global settings (delivery type/address)
 */
export const updateCartSettings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const sessionId = req.headers['x-session-id'] as string;
        const { deliveryType, deliveryAddress } = req.body;

        if (!userId && !sessionId) {
            return res.status(400).json({ message: 'User ID or Session ID required' });
        }

        let query, params;
        if (userId) {
            query = 'UPDATE carts SET delivery_type = COALESCE($1, delivery_type), delivery_address = COALESCE($2, delivery_address) WHERE user_id = $3 RETURNING *';
            params = [deliveryType, deliveryAddress, userId];
        } else {
            query = 'UPDATE carts SET delivery_type = COALESCE($1, delivery_type), delivery_address = COALESCE($2, delivery_address) WHERE session_id = $3 RETURNING *';
            params = [deliveryType, deliveryAddress, sessionId];
        }

        const result = await pool.query(query, params);
        res.json({ message: 'Cart settings updated', cart: result.rows[0] });
    } catch (error) {
        console.error('Update cart settings error:', error);
        res.status(500).json({ message: 'Failed to update cart settings' });
    }
};

/**
 * Merge guest cart with user cart on login
 */
export const mergeCart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID required' });
        }

        // Get session cart
        const sessionCartResult = await pool.query(
            'SELECT * FROM carts WHERE session_id = $1',
            [sessionId]
        );

        if (sessionCartResult.rows.length === 0) {
            return res.json({ message: 'No session cart to merge' });
        }

        const sessionCart = sessionCartResult.rows[0];

        // Get or create user cart
        let userCartResult = await pool.query(
            'SELECT * FROM carts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        let userCart;
        if (userCartResult.rows.length === 0) {
            userCartResult = await pool.query(
                'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
                [userId]
            );
        }
        userCart = userCartResult.rows[0];

        // Move items from session cart to user cart
        await pool.query(
            'UPDATE cart_items SET cart_id = $1 WHERE cart_id = $2',
            [userCart.cart_id, sessionCart.cart_id]
        );

        // Delete session cart
        await pool.query('DELETE FROM carts WHERE cart_id = $1', [sessionCart.cart_id]);

        res.json({ message: 'Carts merged successfully' });
    } catch (error) {
        console.error('Merge cart error:', error);
        res.status(500).json({ message: 'Failed to merge carts' });
    }
};
