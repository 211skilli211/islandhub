import { Router, Request, Response } from 'express';
import { sql } from '../db';
import crypto from 'crypto';

const router = Router();

// Supported cryptocurrencies
const SUPPORTED_COINS = {
    BTC: { name: 'Bitcoin', decimals: 8, minAmount: 0.0001 },
    ETH: { name: 'Ethereum', decimals: 18, minAmount: 0.001 },
    USDT: { name: 'Tether USD', decimals: 6, minAmount: 10 },
    USDC: { name: 'USD Coin', decimals: 6, minAmount: 10 },
    LTC: { name: 'Litecoin', decimals: 8, minAmount: 0.01 },
    XMR: { name: 'Monero', decimals: 12, minAmount: 0.01 },
};

// Exchange rates (XCD to crypto) - in production, fetch from API
const EXCHANGE_RATES: Record<string, number> = {
    BTC: 0.0000038,   // 1 XCD = 0.0000038 BTC (approx at $68k/BTC)
    ETH: 0.00011,     // 1 XCD = 0.00011 ETH (approx at $2.5k/ETH)
    USDT: 0.37,       // 1 XCD = 0.37 USDT (XCD pegged to USD at 2.7:1)
    USDC: 0.37,       // 1 XCD = 0.37 USDC
    LTC: 0.0045,      // 1 XCD = 0.0045 LTC
    XMR: 0.0028,      // 1 XCD = 0.0028 XMR
};

/**
 * GET /api/payments/crypto/supported-coins
 * Get list of supported cryptocurrencies
 */
router.get('/supported-coins', (req: Request, res: Response) => {
    res.json({
        coins: Object.entries(SUPPORTED_COINS).map(([symbol, info]) => ({
            symbol,
            ...info,
            exchangeRate: EXCHANGE_RATES[symbol] || 0,
        })),
    });
});

/**
 * POST /api/payments/crypto/convert
 * Convert XCD amount to crypto amount
 */
router.post('/convert', (req: Request, res: Response) => {
    try {
        const { amount_xcd, coin } = req.body;

        if (!amount_xcd || !coin) {
            return res.status(400).json({ error: 'amount_xcd and coin are required' });
        }

        const rate = EXCHANGE_RATES[coin.toUpperCase()];
        if (!rate) {
            return res.status(400).json({ error: 'Unsupported coin' });
        }

        const coinInfo = SUPPORTED_COINS[coin.toUpperCase() as keyof typeof SUPPORTED_COINS];
        const cryptoAmount = parseFloat(amount_xcd) * rate;

        if (cryptoAmount < coinInfo.minAmount) {
            return res.status(400).json({
                error: `Minimum amount is ${coinInfo.minAmount} ${coin}`,
                min_xcd: coinInfo.minAmount / rate,
            });
        }

        res.json({
            amount_xcd: parseFloat(amount_xcd),
            coin: coin.toUpperCase(),
            crypto_amount: cryptoAmount.toFixed(coinInfo.decimals),
            exchange_rate: rate,
            expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 min expiry
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/payments/crypto/create
 * Create a crypto payment charge
 */
router.post('/create', async (req: Request, res: Response) => {
    const client = await sql.connect();
    try {
        const { order_id, coin, amount_xcd } = req.body;
        const user_id = (req as any).user?.id || null;

        if (!order_id || !coin || !amount_xcd) {
            return res.status(400).json({ error: 'order_id, coin, and amount_xcd are required' });
        }

        const coinUpper = coin.toUpperCase();
        if (!SUPPORTED_COINS[coinUpper as keyof typeof SUPPORTED_COINS]) {
            return res.status(400).json({ error: 'Unsupported coin' });
        }

        await client.query('BEGIN');

        // Get order details
        const orderResult = await client.query(
            'SELECT * FROM orders WHERE order_id = $1',
            [order_id]
        );

        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult.rows[0];

        // Calculate crypto amount
        const rate = EXCHANGE_RATES[coinUpper] || 0;
        const cryptoAmount = parseFloat(amount_xcd) * rate;
        const coinInfo = SUPPORTED_COINS[coinUpper as keyof typeof SUPPORTED_COINS];

        // Generate a unique payment address/ID
        const paymentId = `crypto_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        // In production, this would call a payment processor API (CoinGate, NOWPayments, etc.)
        // For now, we create a payment record and return the details
        const paymentAddress = generatePaymentAddress(coinUpper);

        // Create crypto payment record
        await client.query(`
            INSERT INTO crypto_payments (
                payment_id, order_id, user_id, coin, 
                amount_xcd, crypto_amount, exchange_rate,
                payment_address, status, expires_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
            paymentId,
            order_id,
            user_id,
            coinUpper,
            amount_xcd,
            cryptoAmount.toFixed(coinInfo.decimals),
            rate,
            paymentAddress,
            'pending',
            new Date(Date.now() + 30 * 60 * 1000), // 30 min expiry
        ]);

        // Update order with crypto payment info
        await client.query(
            'UPDATE orders SET payment_method = $1, payment_status = $2 WHERE order_id = $3',
            ['crypto', 'awaiting_payment', order_id]
        );

        await client.query('COMMIT');

        res.json({
            payment_id: paymentId,
            coin: coinUpper,
            coin_name: coinInfo.name,
            amount_xcd: parseFloat(amount_xcd),
            crypto_amount: cryptoAmount.toFixed(coinInfo.decimals),
            exchange_rate: rate,
            payment_address: paymentAddress,
            qr_data: generateQRData(coinUpper, paymentAddress, cryptoAmount),
            status: 'pending',
            expires_at: new Date(Date.now() + 30 * 60 * 1000),
            network: getNetworkName(coinUpper),
            confirmations_required: getConfirmationsRequired(coinUpper),
        });
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Crypto payment creation error:', error);
        res.status(500).json({ error: 'Failed to create crypto payment' });
    } finally {
        client.release();
    }
});

/**
 * POST /api/payments/crypto/verify
 * Verify a crypto payment (called by webhook or polling)
 */
router.post('/verify', async (req: Request, res: Response) => {
    const client = await sql.connect();
    try {
        const { payment_id, tx_hash } = req.body;

        if (!payment_id) {
            return res.status(400).json({ error: 'payment_id is required' });
        }

        await client.query('BEGIN');

        // Get payment record
        const paymentResult = await client.query(
            'SELECT * FROM crypto_payments WHERE payment_id = $1',
            [payment_id]
        );

        if (paymentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Payment not found' });
        }

        const payment = paymentResult.rows[0];

        if (payment.status === 'completed') {
            await client.query('ROLLBACK');
            return res.json({ status: 'already_completed', payment });
        }

        if (new Date(payment.expires_at) < new Date()) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Payment expired' });
        }

        // In production, verify the transaction on the blockchain
        // For now, mark as completed
        await client.query(
            `UPDATE crypto_payments 
             SET status = $1, tx_hash = $2, confirmed_at = NOW(), updated_at = NOW()
             WHERE payment_id = $3`,
            ['completed', tx_hash || 'manual_verify', payment_id]
        );

        // Update order status
        await client.query(
            'UPDATE orders SET payment_status = $1, status = $2, updated_at = NOW() WHERE order_id = $3',
            ['paid', 'processing', payment.order_id]
        );

        // Create transaction record
        await client.query(`
            INSERT INTO transactions (order_id, type, amount, currency, gateway, gateway_transaction_id, status, metadata)
            VALUES ($1, 'payment', $2, $3, 'crypto', $4, 'completed', $5)
        `, [
            payment.order_id,
            payment.amount_xcd,
            'XCD',
            payment_id,
            JSON.stringify({ coin: payment.coin, crypto_amount: payment.crypto_amount, tx_hash }),
        ]);

        await client.query('COMMIT');

        res.json({
            status: 'completed',
            payment_id,
            order_id: payment.order_id,
            message: 'Payment verified successfully',
        });
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Crypto verification error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    } finally {
        client.release();
    }
});

/**
 * GET /api/payments/crypto/status/:paymentId
 * Check crypto payment status
 */
router.get('/status/:paymentId', async (req: Request, res: Response) => {
    try {
        const { paymentId } = req.params;

        const result = await sql`
            SELECT cp.*, o.order_number, o.total_amount as order_total
            FROM crypto_payments cp
            JOIN orders o ON cp.order_id = o.order_id
            WHERE cp.payment_id = ${paymentId}
        `;

        if (result.length === 0) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const payment = result[0];
        const expired = new Date(payment.expires_at) < new Date();

        res.json({
            payment_id: payment.payment_id,
            coin: payment.coin,
            crypto_amount: payment.crypto_amount,
            payment_address: payment.payment_address,
            status: expired && payment.status === 'pending' ? 'expired' : payment.status,
            tx_hash: payment.tx_hash,
            created_at: payment.created_at,
            expires_at: payment.expires_at,
            confirmed_at: payment.confirmed_at,
            order_number: payment.order_number,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/payments/crypto/webhook
 * Webhook for crypto payment processor (CoinGate, NOWPayments, etc.)
 */
router.post('/webhook', async (req: Request, res: Response) => {
    try {
        const { payment_id, status, tx_hash } = req.body;

        // Verify webhook signature in production
        // const signature = req.headers['x-webhook-signature'];

        if (status === 'completed' || status === 'paid') {
            // Auto-verify the payment
            const verifyReq = { body: { payment_id, tx_hash } } as Request;
            const verifyRes = {
                json: (data: any) => console.log('Webhook auto-verify:', data),
                status: () => ({ json: (data: any) => console.log('Webhook auto-verify error:', data) }),
            } as unknown as Response;

            await (async () => {
                const client = await sql.connect();
                try {
                    await client.query('BEGIN');
                    await client.query(
                        `UPDATE crypto_payments SET status = 'completed', tx_hash = $1, confirmed_at = NOW() WHERE payment_id = $2`,
                        [tx_hash, payment_id]
                    );
                    const paymentResult = await client.query('SELECT order_id FROM crypto_payments WHERE payment_id = $1', [payment_id]);
                    if (paymentResult.rows.length > 0) {
                        await client.query(
                            'UPDATE orders SET payment_status = $1, status = $2 WHERE order_id = $3',
                            ['paid', 'processing', paymentResult.rows[0].order_id]
                        );
                    }
                    await client.query('COMMIT');
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    client.release();
                }
            })();
        }

        res.json({ received: true });
    } catch (error: any) {
        console.error('Crypto webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Helper functions
function generatePaymentAddress(coin: string): string {
    // In production, this would call the payment processor API to generate a real address
    const prefix = coin === 'BTC' ? 'bc1' : coin === 'ETH' ? '0x' : coin === 'LTC' ? 'ltc1' : coin === 'XMR' ? '4' : 'addr';
    return `${prefix}_${crypto.randomBytes(20).toString('hex').slice(0, 38)}`;
}

function generateQRData(coin: string, address: string, amount: number): string {
    // Generate QR code data URI for the payment
    if (coin === 'BTC') {
        return `bitcoin:${address}?amount=${amount}`;
    } else if (coin === 'ETH' || coin === 'USDT' || coin === 'USDC') {
        return `ethereum:${address}?amount=${amount}`;
    } else if (coin === 'LTC') {
        return `litecoin:${address}?amount=${amount}`;
    }
    return `${coin.toLowerCase()}:${address}?amount=${amount}`;
}

function getNetworkName(coin: string): string {
    const networks: Record<string, string> = {
        BTC: 'Bitcoin',
        ETH: 'Ethereum',
        USDT: 'Ethereum (ERC-20)',
        USDC: 'Ethereum (ERC-20)',
        LTC: 'Litecoin',
        XMR: 'Monero',
    };
    return networks[coin] || coin;
}

function getConfirmationsRequired(coin: string): number {
    const confirmations: Record<string, number> = {
        BTC: 3,
        ETH: 12,
        USDT: 12,
        USDC: 12,
        LTC: 6,
        XMR: 10,
    };
    return confirmations[coin] || 3;
}

export default router;
