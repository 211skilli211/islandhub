import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { TransactionModel } from '../models/Transaction';
import { CampaignModel } from '../models/Campaign';
import { UserModel } from '../models/User';
import { EmailService } from '../services/emailService';

// Crypto gateway configuration
// Updated to use Kyrrex for St. Kitts compliance

const GATEWAY_API_URL = process.env.KYRREX_API_URL;
const GATEWAY_API_KEY = process.env.KYRREX_API_KEY;
const GATEWAY_WEBHOOK_SECRET = process.env.KYRREX_WEBHOOK_SECRET;

export const createCryptoCharge = async (req: Request, res: Response) => {
    try {
        const { campaign_id, order_id, amount, currency = 'USD' } = req.body;
        const user_id = (req as any).user?.id || null;

        if (!GATEWAY_API_URL || !GATEWAY_API_KEY) {
            return res.status(500).json({ message: 'Kyrrex gateway not configured' });
        }

        // Generate unique order ID (Reference for Kyrrex)
        const gatewayOrderId = `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Kyrrex API call
        const response = await axios.post(
            `${GATEWAY_API_URL}/deposits`,
            {
                amount,
                currency,
                redirect_url: `${process.env.BASE_URL || 'http://localhost:5000'}/crypto-payment/${gatewayOrderId}`, // For QR display
                callback_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/webhooks/crypto`
            },
            {
                headers: {
                    'Authorization': `Bearer ${GATEWAY_API_KEY}`,
                    'Content-Type': 'application/json'
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
        const signature = req.headers['x-crypto-signature'] as string;

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

        const { transaction_id, status, currency } = req.body;

        // Handle Kyrrex events
        if (status === 'confirmed' || status === 'completed') {
            await handleCryptoPaymentSuccess(transaction_id, currency);
        } else if (status === 'failed' || status === 'expired') {
            await handleCryptoPaymentFailure(transaction_id);
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
