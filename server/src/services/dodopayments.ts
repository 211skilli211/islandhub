import axios from 'axios';
import crypto from 'crypto';

const DODO_API_URL = process.env.DODO_API_URL || 'https://api.dodopayments.com/v1';
const DODO_SECRET_KEY = process.env.DODO_SECRET_KEY;
const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET;

export class DodoPaymentsService {
    private apiClient;

    constructor() {
        this.apiClient = axios.create({
            baseURL: DODO_API_URL,
            headers: {
                'Authorization': `Bearer ${DODO_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Create a payment intent with product type support
     */
    async createPaymentIntent(
        amount: number,
        currency: string = 'XCD',
        metadata: any = {},
        productType: 'one_time' | 'subscription' | 'usage_based' = 'one_time'
    ) {
        try {
            const response = await this.apiClient.post('/payment-intents', {
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                product_type: productType,
                metadata: {
                    ...metadata,
                    product_type: productType,
                    // Ensure category integrity
                    category: metadata.category,
                    vendor_id: metadata.vendor_id,
                    store_id: metadata.store_id,
                    listing_id: metadata.listing_id
                },
                return_url: `${process.env.FRONTEND_URL}/checkout/success`,
                cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`
            });
            return response.data;
        } catch (error: any) {
            console.error('DodoPayments: Create payment intent failed', error.response?.data);
            throw new Error(error.response?.data?.message || 'Payment intent creation failed');
        }
    }

    /**
     * Confirm a payment
     */
    async confirmPayment(paymentIntentId: string) {
        try {
            const response = await this.apiClient.post(`/payment-intents/${paymentIntentId}/confirm`);
            return response.data;
        } catch (error: any) {
            console.error('DodoPayments: Confirm payment failed', error.response?.data);
            throw new Error(error.response?.data?.message || 'Payment confirmation failed');
        }
    }

    /**
     * Retrieve payment details
     */
    async getPayment(paymentIntentId: string) {
        try {
            const response = await this.apiClient.get(`/payment-intents/${paymentIntentId}`);
            return response.data;
        } catch (error: any) {
            console.error('DodoPayments: Get payment failed', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to retrieve payment');
        }
    }

    /**
     * Create a payout to vendor
     */
    async createPayout(vendorId: string, amount: number, currency: string = 'XCD') {
        try {
            const response = await this.apiClient.post('/payouts', {
                destination: vendorId, // Vendor's DodoPay account ID
                amount: Math.round(amount * 100),
                currency,
                metadata: { vendor_id: vendorId }
            });
            return response.data;
        } catch (error: any) {
            console.error('DodoPayments: Create payout failed', error.response?.data);
            throw new Error(error.response?.data?.message || 'Payout creation failed');
        }
    }

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload: string, signature: string): boolean {
        if (!DODO_WEBHOOK_SECRET) {
            console.error('DODO_WEBHOOK_SECRET not configured');
            return false;
        }

        const expectedSignature = crypto
            .createHmac('sha256', DODO_WEBHOOK_SECRET)
            .update(payload)
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }

    /**
     * Process refund
     */
    async createRefund(paymentIntentId: string, amount?: number) {
        try {
            const response = await this.apiClient.post('/refunds', {
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined // Partial or full refund
            });
            return response.data;
        } catch (error: any) {
            console.error('DodoPayments: Create refund failed', error.response?.data);
            throw new Error(error.response?.data?.message || 'Refund creation failed');
        }
    }

    /**
     * Create a subscription
     */
    async createSubscription(customerId: string, priceId: string, metadata: any = {}) {
        try {
            const response = await this.apiClient.post('/subscriptions', {
                customer: customerId,
                price: priceId,
                metadata
            });
            return response.data;
        } catch (error: any) {
            console.error('DodoPayments: Create subscription failed', error.response?.data);
            throw new Error(error.response?.data?.message || 'Subscription creation failed');
        }
    }

    /**
     * Cancel a subscription
     */
    async cancelSubscription(subscriptionId: string) {
        try {
            const response = await this.apiClient.delete(`/subscriptions/${subscriptionId}`);
            return response.data;
        } catch (error: any) {
            console.error('DodoPayments: Cancel subscription failed', error.response?.data);
            throw new Error(error.response?.data?.message || 'Subscription cancellation failed');
        }
    }
}

export default new DodoPaymentsService();
