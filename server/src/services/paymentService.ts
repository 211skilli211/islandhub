import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
    apiVersion: '2025-01-27.acacia' as any,
});

export class PaymentService {
    static async createPaymentIntent(amount: number, currency: string = 'usd') {
        try {
            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe expects amount in cents
                currency: currency,
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return {
                clientSecret: paymentIntent.client_secret,
                id: paymentIntent.id,
            };
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }

    // Placeholder for Webhook handling
    static async constructEvent(payload: any, sig: string) {
        return stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    }
}
