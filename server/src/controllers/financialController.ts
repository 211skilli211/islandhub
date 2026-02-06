import { Request, Response } from 'express';
import { pool } from '../config/db';

// ==================== WALLET & BALANCE ====================

export const getWallet = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { store_id } = req.query;

        let query = `
            SELECT * FROM partner_wallets 
            WHERE user_id = $1
        `;
        const params: any[] = [userId];

        if (store_id) {
            query += ' AND store_id = $2';
            params.push(store_id);
        }

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            // Create wallet if doesn't exist (initialization)
            const partnerType = (req as any).user.role === 'driver' ? 'driver' : 'vendor';
            const createResult = await pool.query(
                `INSERT INTO partner_wallets (user_id, store_id, partner_type) 
                 VALUES ($1, $2, $3) RETURNING *`,
                [userId, store_id || null, partnerType]
            );
            return res.json(createResult.rows[0]);
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get wallet error:', error);
        res.status(500).json({ message: 'Failed to fetch wallet' });
    }
};

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { wallet_id, limit = 20, offset = 0 } = req.query;

        const result = await pool.query(
            `SELECT t.* FROM wallet_transactions t
             JOIN partner_wallets w ON t.wallet_id = w.wallet_id
             WHERE w.user_id = $1 ${wallet_id ? 'AND t.wallet_id = $4' : ''}
             ORDER BY t.created_at DESC
             LIMIT $2 OFFSET $3`,
            wallet_id ? [userId, limit, offset, wallet_id] : [userId, limit, offset]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Failed to fetch transactions' });
    }
};

// ==================== PAYOUTS ====================

export const requestPayout = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const userId = req.user?.id;
        const { wallet_id, amount, payout_method, payout_details } = req.body;

        // 1. Verify wallet and balance
        const walletRes = await client.query(
            'SELECT * FROM partner_wallets WHERE wallet_id = $1 AND user_id = $2 FOR UPDATE',
            [wallet_id, userId]
        );

        if (walletRes.rows.length === 0) {
            throw new Error('Wallet not found');
        }

        const wallet = walletRes.rows[0];
        if (Number(wallet.withdrawable_balance) < Number(amount)) {
            throw new Error('Insufficient withdrawable balance');
        }

        // 2. Create payout request
        const requestRes = await client.query(
            `INSERT INTO payout_requests (user_id, wallet_id, amount, payout_method, payout_details, status)
             VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
            [userId, wallet_id, amount, payout_method, JSON.stringify(payout_details)]
        );

        // 3. Move funds to pending_payouts
        await client.query(
            `UPDATE partner_wallets 
             SET withdrawable_balance = withdrawable_balance - $1,
                 pending_payouts = pending_payouts + $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE wallet_id = $2`,
            [amount, wallet_id]
        );

        // 4. Create "payout_hold" transaction
        await client.query(
            `INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, reference_type, reference_id, balance_before, balance_after, notes)
             VALUES ($1, $2, 'payout', 'payout_request', $3, $4, $5, $6)`,
            [
                wallet_id,
                -amount,
                requestRes.rows[0].request_id,
                wallet.balance,
                wallet.balance - amount,
                `Payout request initiated via ${payout_method}`
            ]
        );

        await client.query('COMMIT');
        res.status(201).json(requestRes.rows[0]);
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Request payout error:', error);
        res.status(400).json({ message: error.message || 'Failed to request payout' });
    } finally {
        client.release();
    }
};

export const getMyPayoutRequests = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await pool.query(
            'SELECT * FROM payout_requests WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get my payout requests error:', error);
        res.status(500).json({ message: 'Failed to fetch payouts' });
    }
};

// ==================== ADMIN ACTIONS ====================

export const getAllPayoutRequests = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT pr.*, u.name as user_name, u.email as user_email, w.partner_type
            FROM payout_requests pr
            JOIN users u ON pr.user_id = u.user_id
            JOIN partner_wallets w ON pr.wallet_id = w.wallet_id
        `;
        const params = [];
        if (status) {
            query += ' WHERE pr.status = $1';
            params.push(status);
        }
        query += ' ORDER BY pr.created_at ASC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get all payout requests error:', error);
        res.status(500).json({ message: 'Failed to fetch payout requests' });
    }
};

export const processPayout = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const adminId = req.user?.id;
        const { request_id } = req.params;
        const { status, notes, rejection_reason } = req.body;

        const requestRes = await client.query(
            'SELECT * FROM payout_requests WHERE request_id = $1 FOR UPDATE',
            [request_id]
        );

        if (requestRes.rows.length === 0) throw new Error('Request not found');
        const pr = requestRes.rows[0];

        if (pr.status !== 'pending' && pr.status !== 'processing') {
            throw new Error(`Cannot process payout in ${pr.status} state`);
        }

        if (status === 'completed') {
            // Deduct from total balance and pending_payouts
            await client.query(
                `UPDATE partner_wallets 
                 SET balance = balance - $1,
                     pending_payouts = pending_payouts - $1,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE wallet_id = $2`,
                [pr.amount, pr.wallet_id]
            );
        } else if (status === 'rejected') {
            // Return to withdrawable balance
            await client.query(
                `UPDATE partner_wallets 
                 SET withdrawable_balance = withdrawable_balance + $1,
                     pending_payouts = pending_payouts - $1,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE wallet_id = $2`,
                [pr.amount, pr.wallet_id]
            );
            // Also negative original transaction or notes? 
            // Better to add a "reversal" transaction
            await client.query(
                `INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, reference_type, reference_id, notes)
                 VALUES ($1, $2, 'adjustment', 'payout_request', $3, $4)`,
                [pr.wallet_id, pr.amount, pr.request_id, `Payout rejected: ${rejection_reason || 'N/A'}`]
            );
        }

        const updateRes = await client.query(
            `UPDATE payout_requests 
             SET status = $1, notes = $2, rejection_reason = $3, 
                 processed_at = CURRENT_TIMESTAMP, processed_by = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE request_id = $5 RETURNING *`,
            [status, notes, rejection_reason, adminId, request_id]
        );

        await client.query('COMMIT');
        res.json(updateRes.rows[0]);
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Process payout error:', error);
        res.status(400).json({ message: error.message || 'Failed to process payout' });
    } finally {
        client.release();
    }
};
