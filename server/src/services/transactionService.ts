import { WiPayService } from './wipayService';
import { PaymentService } from './paymentService';
import { pool } from '../config/db';

export class TransactionService {
    static async processPayment(listingId: number, amount: number, provider: string, userId: number) {
        let externalId: string;
        let status: string = 'pending';
        const callbackUrl = process.env.WIPAY_CALLBACK_URL || 'http://localhost:3001/webhooks/wipay';

        try {
            switch (provider) {
                case 'wipay':
                    const wipayResult = await WiPayService.createPayment(amount, 'XCD', `txn_${Date.now()}`, `user_${userId}@example.com`, callbackUrl);
                    externalId = wipayResult.transactionId;
                    break;
                case 'paypal':
                    // Placeholder - assuming we create a PayPal order
                    // For now, use a mock
                    externalId = `paypal_${Date.now()}`;
                    status = 'pending';
                    break;
                case 'stripe':
                    const stripeResult = await PaymentService.createPaymentIntent(amount, 'xcd');
                    externalId = stripeResult.id;
                    break;
                default:
                    throw new Error(`Unsupported payment provider: ${provider}`);
            }

            // Record transaction
            const result = await pool.query(
                `INSERT INTO transactions (listing_id, user_id, amount, currency, payment_provider, external_id, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [listingId, userId, amount, 'XCD', provider, externalId, status]
            );

            // Log audit
            await pool.query(
                `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
                 VALUES ($1, $2, $3, $4, $5)`,
                [userId, 'PAYMENT_INITIATED', 'transactions', result.rows[0].id, JSON.stringify(result.rows[0])]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error processing payment:', error);
            throw error;
        }
    }

    static async calculateCommission(listingId: number, amount: number) {
        const result = await pool.query(
            'SELECT commission_rate FROM listings WHERE id = $1',
            [listingId]
        );

        if (result.rows.length === 0) {
            throw new Error('Listing not found');
        }

        return amount * (result.rows[0].commission_rate / 100);
    }

    static async updateTransactionStatus(transactionId: number, status: string, externalId?: string) {
        const result = await pool.query(
            `UPDATE transactions SET status = $1, external_id = COALESCE($2, external_id), updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 RETURNING *`,
            [status, externalId, transactionId]
        );

        if (result.rows.length > 0) {
            // Log audit
            await pool.query(
                `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [result.rows[0].user_id, 'TRANSACTION_UPDATED', 'transactions', transactionId, null, JSON.stringify(result.rows[0])]
            );
        }

        return result.rows[0];
    }
}