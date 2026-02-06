import axios from 'axios';
import crypto from 'crypto';

const WIPAY_API_URL = process.env.WIPAY_API_URL || 'https://api.wipay.co/v1/payment';
const WIPAY_API_KEY = process.env.WIPAY_API_KEY;
const WIPAY_API_SECRET = process.env.WIPAY_API_SECRET;
const WIPAY_CALLBACK_SECRET = process.env.WIPAY_CALLBACK_SECRET;

export class WiPayService {
    static async createPayment(amount: number, currency: string, orderId: string, customerEmail: string, callbackUrl: string) {
        if (!WIPAY_API_KEY || !WIPAY_API_SECRET) {
            throw new Error('WiPay API credentials not configured');
        }

        // Mock mode for development
        if (WIPAY_API_KEY === 'your_wipay_api_key' || process.env.NODE_ENV === 'development') {
            console.log('🚀 WiPay is in MOCK MODE. Generating test redirect...');
            return {
                transactionId: `mock_${Date.now()}`,
                redirectUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/api/webhooks/wipay?status=success&order_id=${orderId}&transaction_id=mock_${Date.now()}`,
                status: 'success'
            };
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const payload = {
            amount,
            currency,
            customer_email: customerEmail,
            order_id: orderId,
            callback_url: callbackUrl
        };

        const payloadStr = JSON.stringify(payload);
        const signature = crypto
            .createHmac('sha256', WIPAY_API_SECRET)
            .update(payloadStr + timestamp)
            .digest('hex');

        try {
            const response = await axios.post(WIPAY_API_URL, payload, {
                headers: {
                    'X-API-Key': WIPAY_API_KEY,
                    'X-Signature': signature,
                    'X-Timestamp': timestamp.toString(),
                    'Content-Type': 'application/json'
                }
            });

            return {
                transactionId: response.data.transaction_id,
                redirectUrl: response.data.redirect_url,
                status: response.data.status
            };
        } catch (error: any) {
            console.error('WiPay create payment error:', error.response?.data || error.message);
            throw error;
        }
    }

    static verifyCallback(payload: any, signature: string): boolean {
        if (!WIPAY_CALLBACK_SECRET) {
            console.error('WiPay callback secret not configured');
            return false;
        }

        const payloadStr = JSON.stringify(payload);
        const expectedSignature = crypto
            .createHmac('sha256', WIPAY_CALLBACK_SECRET)
            .update(payloadStr)
            .digest('hex');

        return signature === expectedSignature;
    }
}