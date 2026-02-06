import { Request, Response } from 'express';
import { WiPayService } from '../services/wipayService';
import { EmailService } from '../services/emailService';
import { TransactionModel } from '../models/Transaction';
import { UserModel } from '../models/User';

export const createDonationIntent = async (req: Request, res: Response) => {
    try {
        const { campaign_id, order_id, amount, currency } = req.body;
        const user_id = (req as any).user?.id || null;

        // Get user email for WiPay
        let customerEmail = 'anonymous@example.com';
        if (user_id) {
            const user = await UserModel.findById(user_id);
            if (user) {
                customerEmail = user.email;
            }
        }

        // Generate unique order ID (Reference for WiPay)
        const wipayOrderId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const callbackUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/webhooks/wipay`;

        // 1. Create WiPay Payment
        const payment = await WiPayService.createPayment(amount, currency || 'XCD', wipayOrderId, customerEmail, callbackUrl);

        // Parse IDs safely
        const parsedCampaignId = campaign_id && !isNaN(parseInt(campaign_id)) ? parseInt(campaign_id) : undefined;
        const parsedOrderId = order_id && !isNaN(parseInt(order_id)) ? parseInt(order_id) : undefined;

        // 2. Record Transaction in DB (Status: Pending)
        const transaction = await TransactionModel.create({
            campaign_id: parsedCampaignId,
            order_id: parsedOrderId,
            user_id,
            amount,
            currency: currency || 'XCD',
            payment_method: 'wipay_card',
            status: 'pending',
            payment_provider: 'wipay',
            external_id: payment.transactionId
        });

        res.status(201).json({
            redirectUrl: payment.redirectUrl,
            transactionId: transaction.transaction_id
        });
    } catch (error) {
        console.error('Error creating donation intent:', error);
        res.status(500).json({ message: 'Server error processing donation' });
    }
};

export const confirmDonation = async (req: Request, res: Response) => {
    try {
        const { payment_intent_id, status } = req.body;

        if (!payment_intent_id || !status) {
            return res.status(400).json({ message: 'Missing payment_intent_id or status' });
        }

        // Update transaction status
        const updatedTransaction = await TransactionModel.updateStatus(payment_intent_id, status === 'succeeded' ? 'completed' : status);

        if (updatedTransaction && status === 'succeeded') {
            // Get Campaign Title for receipt
            // For now, we might not have a direct way to get title without importing CampaignModel.
            // Let's assume we can import it or just send a generic receipt if lazy.
            // But let's do it right: import campaign model.
            const { CampaignModel } = require('../models/Campaign');
            const campaign = await CampaignModel.findById(updatedTransaction.campaign_id);

            // Send Receipt
            // We need user email. If user_id is present, fetch user. If not (anonymous), we can't send email unless we captured it during checkout.
            // For MVP, if there is a logged in user, we send it.
            if (updatedTransaction.user_id) {
                const { UserModel } = require('../models/User');
                const user = await UserModel.findById(updatedTransaction.user_id);
                if (user) {
                    EmailService.sendDonationReceipt(user.email, updatedTransaction.amount, campaign?.title || 'User Campaign', String(updatedTransaction.transaction_id));
                }
            }
        }

        res.json({ status: 'updated' });
    } catch (error) {
        console.error('Error confirming donation:', error);
        res.status(500).json({ message: 'Server error confirming donation' });
    }
};
export const getUserDonations = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;
        if (!user_id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const donations = await TransactionModel.findByUserId(user_id);
        res.json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching user donations' });
    }
};
