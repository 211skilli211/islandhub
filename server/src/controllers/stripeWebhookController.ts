import { Request, Response } from 'express';
import Stripe from 'stripe';
import { TransactionModel } from '../models/Transaction';
import { CampaignModel } from '../models/Campaign';
import { UserModel } from '../models/User';
import { EmailService } from '../services/emailService';
import { getNumberSetting } from './adminSettingsController';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-12-15.clover',
});

export const handleStripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not set');
        return res.status(500).send('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentSuccess(paymentIntent);
                break;

            case 'payment_intent.payment_failed':
                const failedIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentFailure(failedIntent);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Webhook processing failed');
    }
};

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const externalId = paymentIntent.id;

    // Find transaction by external_id
    const transaction = await TransactionModel.findByExternalId(externalId);

    if (!transaction) {
        console.error(`Transaction not found for payment intent: ${externalId}`);
        return;
    }

    // Update transaction status
    await TransactionModel.updateStatus(externalId, 'completed');

    // Calculate commission based on global setting
    const commissionRate = await getNumberSetting('commission_rate', 5.0);
    const commissionAmount = (transaction.amount * commissionRate) / 100;

    // Update transaction with commission
    if (transaction.transaction_id) {
        await TransactionModel.updateCommission(transaction.transaction_id, commissionAmount);
    }

    // 1. Handle Campaign update if present
    if (transaction.campaign_id) {
        const campaign = await CampaignModel.findById(transaction.campaign_id);
        if (campaign) {
            const newAmount = (campaign.current_amount || 0) + transaction.amount;
            await CampaignModel.updateCurrentAmount(campaign.campaign_id!, newAmount);

            // Send donation receipt
            if (transaction.user_id) {
                const user = await UserModel.findById(transaction.user_id);
                if (user) {
                    EmailService.sendDonationReceipt(user.email, transaction.amount, campaign.title, String(transaction.transaction_id));
                }
            }
        }
    }

    // 2. Handle Order update if present
    // 2. Handle Order update if present
    if (transaction.order_id) {
        const { OrderModel } = require('../models/Order');
        const { RevenueService } = require('../services/revenueService');

        await OrderModel.updateStatus(transaction.order_id, 'paid');

        // Fetch order to get vendor details
        const order = await OrderModel.findById(transaction.order_id);
        if (order && order.store_id) {
            // Get vendor ID from store (this requires a join or separate query usually, but let's assume Order has necessary info or we fetch store)
            // For now, let's query the store to get the vendor_id if not on order directly
            const { pool } = require('../config/db');
            const storeRes = await pool.query('SELECT vendor_id FROM stores WHERE store_id = $1', [order.store_id]);

            if (storeRes.rows.length > 0) {
                const vendorId = storeRes.rows[0].vendor_id;
                const netRevenue = transaction.amount - commissionAmount;

                // Credit Vendor Wallet
                await RevenueService.creditWallet(
                    vendorId,
                    netRevenue,
                    'sale',
                    'order',
                    order.order_id,
                    `Revenue from Order #${order.order_id}`,
                    order.store_id
                );
                console.log(`Credited vendor ${vendorId} for Order #${order.order_id}`);
            }
        }
    }

    console.log(`✅ Payment succeeded: ${externalId} - ${transaction.amount} (Commission: ${commissionAmount})`);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const externalId = paymentIntent.id;

    // Update transaction status
    await TransactionModel.updateStatus(externalId, 'failed');

    console.log(`❌ Payment failed: ${externalId}`);
}
