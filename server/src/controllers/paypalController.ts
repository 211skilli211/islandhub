import { Request, Response } from 'express';
// @ts-ignore
import paypal from '@paypal/checkout-server-sdk';
import { TransactionModel } from '../models/Transaction';
import { CampaignModel } from '../models/Campaign';
import { UserModel } from '../models/User';
import { EmailService } from '../services/emailService';

// PayPal environment setup
function environment() {
    const clientId = process.env.PAYPAL_CLIENT_ID as string;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET as string;
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    if (mode === 'live') {
        return new paypal.core.LiveEnvironment(clientId, clientSecret);
    }
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

const client = () => new paypal.core.PayPalHttpClient(environment());

export const createPayPalOrder = async (req: Request, res: Response) => {
    try {
        const { campaign_id, order_id, amount, currency = 'USD' } = req.body;
        const user_id = (req as any).user?.id || null;

        // Create PayPal order
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: amount.toFixed(2)
                },
                description: order_id ? `Order #${order_id}` : `Donation to Campaign #${campaign_id}`
            }]
        });

        const order = await client().execute(request);
        const orderId = order.result.id;

        // Create pending transaction
        const transaction = await TransactionModel.create({
            campaign_id: campaign_id ? parseInt(campaign_id) : undefined,
            order_id: order_id ? parseInt(order_id) : undefined,
            user_id,
            amount,
            currency,
            payment_method: 'paypal',
            status: 'pending',
            payment_provider: 'paypal',
            external_id: orderId
        });

        res.status(201).json({
            orderId,
            transactionId: transaction.transaction_id
        });
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).json({ message: 'Failed to create PayPal order' });
    }
};

export const capturePayPalOrder = async (req: Request, res: Response) => {
    try {
        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({ message: 'order_id is required' });
        }

        // Capture the order
        const request = new paypal.orders.OrdersCaptureRequest(order_id);
        request.requestBody({});

        const capture = await client().execute(request);

        if (capture.result.status === 'COMPLETED') {
            // Find transaction
            const transaction = await TransactionModel.findByExternalId(order_id);

            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            // Update transaction status
            await TransactionModel.updateStatus(order_id, 'completed');

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
                
                // Send order confirmation email
                try {
                    const { EmailService } = require('../services/emailService');
                    const order = await OrderModel.findById(transaction.order_id);
                    if (order && order.user_email) {
                        await EmailService.sendOrderConfirmation(
                            order.user_email,
                            order.order_number || `ORD-${transaction.order_id}`,
                            parseFloat(order.total_amount),
                            order.currency || 'USD',
                            order.item_count || 1
                        );
                    }
                } catch (emailErr) {
                    console.error('Failed to send order confirmation email:', emailErr);
                }
            }

            res.json({
                status: 'success',
                transactionId: transaction.transaction_id
            });
        } else {
            res.status(400).json({ message: 'Payment not completed' });
        }
    } catch (error) {
        console.error('Error capturing PayPal order:', error);
        res.status(500).json({ message: 'Failed to capture PayPal payment' });
    }
};
