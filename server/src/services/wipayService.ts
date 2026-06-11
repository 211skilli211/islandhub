import crypto from 'crypto';

// WiPay payment service integration
// WiPay is a Caribbean payment gateway (wipaycaribbean.com)

interface WiPayPaymentResponse {
    success: boolean;
    paymentUrl?: string;
    transactionId?: string;
    error?: string;
}

interface WiPayCallback {
    order_id: string;
    status: string;
    amount: number;
    currency: string;
    hash: string;
}

const WIPAY_API_URL = process.env.WIPAY_API_URL || 'https://tt.wipayfinancial.com/plugins/payments/hosts/index.html';
const WIPAY_MERCHANT_KEY = process.env.WIPAY_MERCHANT_KEY || '';
const WIPAY_API_KEY = process.env.WIPAY_API_KEY || '';

export class WiPayService {
    static async createPayment(
        amount: number,
        currency: string,
        orderId: string,
        customerEmail: string,
        callbackUrl: string
    ): Promise<WiPayPaymentResponse> {
        try {
            if (!WIPAY_MERCHANT_KEY || !WIPAY_API_KEY) {
                console.warn('WiPay credentials not configured — returning mock response');
                return {
                    success: true,
                    paymentUrl: `${WIPAY_API_URL}?merchant_key=${WIPAY_MERCHANT_KEY}&order_id=${orderId}&amount=${amount}&currency=${currency}`,
                    transactionId: `mock_${orderId}`,
                };
            }

            const response = await fetch(WIPAY_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${WIPAY_API_KEY}`,
                },
                body: JSON.stringify({
                    merchant_key: WIPAY_MERCHANT_KEY,
                    amount,
                    currency,
                    order_id: orderId,
                    email: customerEmail,
                    callback_url: callbackUrl,
                }),
            });

            if (!response.ok) {
                return { success: false, error: `WiPay API error: ${response.status}` };
            }

            const data = await response.json();
            return {
                success: true,
                paymentUrl: data.payment_url,
                transactionId: data.transaction_id,
            };
        } catch (error) {
            console.error('WiPay createPayment error:', error);
            return { success: false, error: String(error) };
        }
    }

    static verifyCallback(body: WiPayCallback, signature: string): boolean {
        try {
            if (!WIPAY_API_KEY) {
                console.warn('WiPay API key not configured — skipping callback verification');
                return true;
            }

            const expectedHash = crypto
                .createHmac('sha256', WIPAY_API_KEY)
                .update(`${body.order_id}${body.status}${body.amount}${body.currency}`)
                .digest('hex');

            return expectedHash === signature;
        } catch (error) {
            console.error('WiPay verifyCallback error:', error);
            return false;
        }
    }

    static async getTransactionStatus(transactionId: string): Promise<{ status: string; amount?: number } | null> {
        try {
            if (!WIPAY_API_KEY) {
                return { status: 'pending' };
            }

            const response = await fetch(`${WIPAY_API_URL}/transactions/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${WIPAY_API_KEY}`,
                },
            });

            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('WiPay getTransactionStatus error:', error);
            return null;
        }
    }
}
