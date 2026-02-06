import { pool } from '../config/db';

export interface Transaction {
    transaction_id?: number;
    campaign_id?: number;
    order_id?: number;
    user_id?: number;
    amount: number;
    currency: string;
    payment_method: string;
    status: 'pending' | 'completed' | 'failed';
    payment_intent_id?: string; // Deprecated: use external_id
    payment_provider?: 'stripe' | 'paypal' | 'crypto' | 'wipay';
    external_id?: string;
    crypto_currency?: string;
    provider?: string;
    created_at?: Date;
}

export class TransactionModel {
    static async create(transaction: Transaction): Promise<Transaction> {
        const {
            campaign_id,
            order_id,
            user_id,
            amount,
            currency,
            payment_method,
            status,
            payment_provider = 'stripe',
            external_id,
            crypto_currency,
            provider
        } = transaction;

        const result = await pool.query(
            `INSERT INTO transactions (
                campaign_id, order_id, user_id, amount, currency, payment_method, status, 
                payment_provider, external_id, crypto_currency, provider
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [
                campaign_id || null,
                order_id || null,
                user_id,
                amount,
                currency,
                payment_method,
                status,
                payment_provider,
                external_id,
                crypto_currency,
                provider || payment_provider
            ]
        );
        return result.rows[0];
    }

    static async findByPaymentIntentId(payment_intent_id: string): Promise<Transaction | null> {
        return this.findByExternalId(payment_intent_id);
    }

    static async findByExternalId(external_id: string): Promise<Transaction | null> {
        const result = await pool.query('SELECT * FROM transactions WHERE external_id = $1', [external_id]);
        return result.rows[0] || null;
    }

    static async updateStatus(external_id: string, status: string): Promise<Transaction | null> {
        const result = await pool.query(
            `UPDATE transactions SET status = $1 WHERE external_id = $2 RETURNING *`,
            [status, external_id]
        );
        return result.rows[0] || null;
    }

    static async updateCommission(transaction_id: number, commission_amount: number): Promise<void> {
        await pool.query(
            `UPDATE transactions SET commission_amount = $1 WHERE transaction_id = $2`,
            [commission_amount, transaction_id]
        );
    }

    static async findByUserId(user_id: number): Promise<Transaction[]> {
        const result = await pool.query(
            `SELECT t.*, c.title as campaign_title 
             FROM transactions t 
             JOIN campaigns c ON t.campaign_id = c.campaign_id 
             WHERE t.user_id = $1 
             ORDER BY t.created_at DESC`,
            [user_id]
        );
        return result.rows;
    }
}
