import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { TransactionModel } from '../models/Transaction';
import { CampaignModel } from '../models/Campaign';
import { UserModel } from '../models/User';
import { EmailService } from '../services/emailService';

// Crypto gateway configuration
// Updated to use Coinbase Commerce for crypto payments

const GATEWAY_API_URL = process.env.COINBASE_API_URL || 'https://api.commerce.coinbase.com';
const GATEWAY_API_KEY = process.env.COINBASE_API_KEY;
const GATEWAY_WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET;

export const createCryptoCharge = async (req: Request, res: Response) => {
    try {
        const { campaign_id, order_id, amount, currency = 'USD' } = req.body;
        const user_id = (req as any).user?.id || null;

        if (!GATEWAY_API_URL || !GATEWAY_API_KEY) {
            return res.status(500).json({ message: 'Coinbase gateway not configured' });
        }

        // Generate unique order ID (Reference for Coinbase)
        const gatewayOrderId = `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Coinbase Commerce API call - create a charge
        const response = await axios.post(
            `${GATEWAY_API_URL}/charges`,
            {
                name: 'Island Fund Payment',
                description: `Payment for ${campaign_id ? 'campaign' : 'order'}`,
                pricing_type: 'fixed_price',
                local_price: {
                    amount: amount.toString(),
                    currency: currency
                },
                metadata: {
                    gatewayOrderId,
                    campaign_id: campaign_id || null,
                    order_id: order_id || null,
                    user_id: user_id || null
                },
                redirect_url: `${process.env.BASE_URL || 'http://localhost:5000'}/crypto-payment/${gatewayOrderId}`,
                cancel_url: `${process.env.BASE_URL || 'http://localhost:5000'}/crypto-payment/cancel`
            },
            {
                headers: {
                    'X-CC-Api-Key': GATEWAY_API_KEY,
                    'Content-Type': 'application/json',
                    'X-CC-Version': '2018-03-22'
                }
            }
        );
        const chargeData = response.data;

        // Create pending transaction
        const transaction = await TransactionModel.create({
            campaign_id: campaign_id ? parseInt(campaign_id) : undefined,
            order_id: order_id ? parseInt(order_id) : undefined,
            user_id,
            amount,
            currency,
            payment_method: 'crypto',
            status: 'pending',
            payment_provider: 'crypto',
            external_id: chargeData.id || chargeData.invoiceId || gatewayOrderId
        });

        res.status(201).json({
            chargeId: chargeData.id || chargeData.transaction_id,
            hostedUrl: chargeData.redirect_url || chargeData.checkout_link,
            qrCodeUrl: chargeData.qr_code_url || chargeData.qr_url,
            transactionId: transaction.transaction_id
        });
    } catch (error: any) {
        console.error('Error creating crypto charge:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to create crypto charge' });
    }
};

export const handleCryptoWebhook = async (req: Request, res: Response) => {
    try {
        // Coinbase Commerce webhook signature header
        const signature = req.headers['x-cc-webhook-signature'] as string;

        if (!GATEWAY_WEBHOOK_SECRET) {
            return res.status(500).send('Webhook secret not configured');
        }

        // Verify webhook signature
        const payload = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', GATEWAY_WEBHOOK_SECRET)
            .update(payload)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('Invalid webhook signature');
            return res.status(400).send('Invalid signature');
        }

        // Coinbase event structure
        const event = req.body;
        const { type, data } = event;

        // Handle Coinbase events
        if (type === 'charge:confirmed') {
            const chargeId = data?.id;
            const metadata = data?.metadata;
            await handleCryptoPaymentSuccess(chargeId, metadata?.currency || 'USD');
        } else if (type === 'charge:failed' || type === 'charge:expired') {
            const chargeId = data?.id;
            await handleCryptoPaymentFailure(chargeId);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Error processing crypto webhook:', error);
        res.status(500).send('Webhook processing failed');
    }
};

async function handleCryptoPaymentSuccess(chargeId: string, cryptoCurrency: string) {
    // Find transaction
    const transaction = await TransactionModel.findByExternalId(chargeId);

    if (!transaction) {
        console.error(`Transaction not found for charge: ${chargeId}`);
        return;
    }

    // Update transaction status
    await TransactionModel.updateStatus(chargeId, 'completed');

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
    if (transaction.order_id) {
        const { OrderModel } = require('../models/Order');
        await OrderModel.updateStatus(transaction.order_id, 'paid');
        // TODO: Send order confirmation email
    }

    console.log(`✅ Kyrrex payment confirmed: ${chargeId} (${cryptoCurrency}) - ${transaction.amount}`);
}

async function handleCryptoPaymentFailure(chargeId: string) {
    await TransactionModel.updateStatus(chargeId, 'failed');
    console.log(`❌ Crypto payment failed: ${chargeId}`);
}
