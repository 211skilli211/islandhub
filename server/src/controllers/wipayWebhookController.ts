import { Request, Response } from 'express';
import { WiPayService } from '../services/wipayService';
import { TransactionModel } from '../models/Transaction';
import { CampaignModel } from '../models/Campaign';
import { UserModel } from '../models/User';
import { EmailService } from '../services/emailService';
import { getNumberSetting } from './adminSettingsController';

export const handleWiPayWebhook = async (req: Request, res: Response) => {
    try {
        const { transaction_id, status, amount, currency } = req.body;
        const signature = req.headers['x-wipay-signature'] as string;

        // Verify webhook signature
        if (!WiPayService.verifyCallback(req.body, signature)) {
            console.error('Invalid WiPay webhook signature');
            return res.status(400).send('Invalid signature');
        }

        console.log(`WiPay webhook: ${transaction_id} - ${status}`);

        // Find and update transaction
        const transaction = await TransactionModel.findByExternalId(transaction_id);

        if (!transaction) {
            console.error(`Transaction not found for WiPay ID: ${transaction_id}`);
            return res.status(404).send('Transaction not found');
        }

        // Update status
        const newStatus = status === 'success' ? 'completed' : 'failed';
        await TransactionModel.updateStatus(transaction_id, newStatus);

        if (newStatus === 'completed') {
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
                const { pool } = require('../config/db');

                await OrderModel.updateStatus(transaction.order_id, 'paid');

                // Fetch order to get vendor details
                const order = await OrderModel.findById(transaction.order_id);
                if (order && order.store_id) {
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
                            `Revenue from Order #${order.order_id} (WiPay)`,
                            order.store_id
                        );
                        console.log(`Credited vendor ${vendorId} for Order #${order.order_id} (WiPay)`);
                    }
                }
            }

            console.log(`✅ WiPay payment completed: ${transaction_id} - ${transaction.amount} (Commission: ${commissionAmount})`);
        } else {
            console.log(`❌ WiPay payment failed: ${transaction_id}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Error processing WiPay webhook:', error);
        res.status(500).send('Webhook processing failed');
    }
};