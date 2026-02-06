import nodemailer from 'nodemailer';

// Create a transporter. For dev, we use Ethereal or just a console stub if no creds.
// In a real app, use SendGrid, AWS SES, or Gmail Oauth.
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    auth: {
        user: process.env.EMAIL_USER || 'test_user',
        pass: process.env.EMAIL_PASS || 'test_pass',
    },
});

export class EmailService {
    static async sendWelcomeEmail(to: string, name: string) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email Stub] Sending Welcome Email to ${to}`);
            return;
        }

        try {
            await transporter.sendMail({
                from: '"IslandFund" <no-reply@islandfund.com>',
                to,
                subject: 'Welcome to IslandFund! 🌴',
                text: `Hello ${name},\n\nWelcome to IslandFund! We're excited to have you on board to support Caribbean dreams.\n\nBest,\nThe IslandFund Team`,
                html: `<b>Hello ${name},</b><br><br>Welcome to IslandFund! We're excited to have you on board to support Caribbean dreams.<br><br>Best,<br>The IslandFund Team`,
            });
        } catch (error) {
            console.error('Error sending welcome email:', error);
        }
    }

    static async sendDonationReceipt(to: string, amount: number, campaignTitle: string, transactionId: string) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email Stub] Sending Receipt to ${to} for $${amount} (Tx: ${transactionId})`);
            return;
        }

        try {
            await transporter.sendMail({
                from: '"IslandFund" <payments@islandfund.com>',
                to,
                subject: 'Donation Receipt - IslandFund',
                text: `Thank you for your donation of $${amount} to "${campaignTitle}".\nTransaction ID: ${transactionId}\n\nThank you for your support!`,
                html: `<b>Thank you for your donation!</b><br><br>You donated <b>$${amount}</b> to "<i>${campaignTitle}</i>".<br>Transaction ID: ${transactionId}<br><br>Thank you for your support!`,
            });
        } catch (error) {
            console.error('Error sending receipt:', error);
        }
    }

    static async sendVerificationEmail(to: string, token: string) {
        // In production this would be a real link
        const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email Stub] Sending Verification to ${to}: ${verificationLink}`);
            return;
        }

        try {
            await transporter.sendMail({
                from: '"IslandFund" <auth@islandfund.com>',
                to,
                subject: 'Verify Your Email - IslandFund',
                text: `Welcome! Please verify your email by clicking: ${verificationLink}`,
                html: `<b>Welcome!</b><br><br>Please verify your email by clicking: <a href="${verificationLink}">Verify Email</a>`,
            });
        } catch (error) {
            console.error('Error sending verification email:', error);
        }
    }

    static async sendChangeRequestEmail(to: string, campaignTitle: string, feedback: string) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email Stub] Sending Change Request to ${to} for "${campaignTitle}"`);
            return;
        }

        try {
            await transporter.sendMail({
                from: '"IslandFund" <admin@islandfund.com>',
                to,
                subject: 'Changes Requested for Your Campaign - IslandFund',
                text: `Hello,\n\nAn admin has requested changes to your campaign "${campaignTitle}".\n\nFeedback: ${feedback}\n\nPlease update your campaign and resubmit for approval.\n\nBest,\nThe IslandFund Team`,
                html: `<b>Hello,</b><br><br>An admin has requested changes to your campaign "<i>${campaignTitle}</i>".<br><br><b>Feedback:</b> ${feedback}<br><br>Please update your campaign and resubmit for approval.<br><br>Best,<br>The IslandFund Team`,
            });
        } catch (error) {
            console.error('Error sending change request email:', error);
        }
    }

    static async sendSubscriptionConfirmation(to: string, tier: string, price: number) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email Stub] Subscription Confirmation to ${to}: ${tier} ($${price})`);
            return;
        }

        try {
            await transporter.sendMail({
                from: '"IslandFund" <subscriptions@islandfund.com>',
                to,
                subject: 'Subscription Confirmed! 🚀',
                text: `Welcome to the ${tier} tier! Your subscription is now active for $${price}/month.`,
                html: `<b>Subscription Confirmed!</b><br><br>Welcome to the <b>${tier}</b> tier! Your subscription is now active for <b>$${price}/month</b>.`,
            });
        } catch (error) {
            console.error('Error sending subscription confirmation:', error);
        }
    }

    static async sendSubscriptionCancelled(to: string, tier: string, endDate: string) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email Stub] Subscription Cancellation to ${to}: Access until ${endDate}`);
            return;
        }

        try {
            await transporter.sendMail({
                from: '"IslandFund" <subscriptions@islandfund.com>',
                to,
                subject: 'Subscription Cancelled',
                text: `Your ${tier} subscription has been cancelled. You will retain access until ${endDate}.`,
                html: `<b>Subscription Cancelled</b><br><br>Your ${tier} subscription has been cancelled. You will retain access until <b>${endDate}</b>.`,
            });
        } catch (error) {
            console.error('Error sending subscription cancellation:', error);
        }
    }

    static async sendPaymentFailed(to: string, tier: string) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email Stub] Payment Failed Alert to ${to}`);
            return;
        }

        try {
            await transporter.sendMail({
                from: '"IslandFund" <billing@islandfund.com>',
                to,
                subject: 'Urgent: Payment Failed for Your Subscription',
                text: `We were unable to process your payment for the ${tier} tier. Please update your payment method to avoid service interruption.`,
                html: `<b>Payment Failed</b><br><br>We were unable to process your payment for the <b>${tier}</b> tier. Please update your payment method to avoid service interruption.`,
            });
        } catch (error) {
            console.error('Error sending payment failed email:', error);
        }
    }

    static async sendOrderConfirmation(to: string, orderNumber: string, totalAmount: number, currency: string, itemCount: number) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email Stub] Order Confirmation to ${to}: Order ${orderNumber} - ${totalAmount} ${currency}`);
            return;
        }

        try {
            await transporter.sendMail({
                from: '"IslandFund" <orders@islandfund.com>',
                to,
                subject: `Order Confirmation - ${orderNumber}`,
                text: `Thank you for your order!

Order Number: ${orderNumber}
Total: ${totalAmount.toFixed(2)} ${currency}
Items: ${itemCount}

Your order is being processed and you will receive updates as it progresses.

You can track your order at: https://islandfund.com/dashboard/orders

Thank you for shopping with IslandFund!`,
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0d9488;">Thank you for your order!</h2>
                    <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Order Number:</strong> ${orderNumber}</p>
                        <p><strong>Total:</strong> ${totalAmount.toFixed(2)} ${currency}</p>
                        <p><strong>Items:</strong> ${itemCount}</p>
                    </div>
                    <p>Your order is being processed and you will receive updates as it progresses.</p>
                    <p><a href="https://islandfund.com/dashboard/orders" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Track Your Order</a></p>
                    <p>Thank you for shopping with IslandFund!</p>
                </div>`,
            });
        } catch (error) {
            console.error('Error sending order confirmation email:', error);
        }
    }

    static async sendOrderCancellationEmail(to: string, orderNumber: string, totalAmount: number, currency: string, reason: string) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email Stub] Order Cancellation to ${to}: Order ${orderNumber}`);
            return;
        }

        try {
            await transporter.sendMail({
                from: '"IslandFund" <orders@islandfund.com>',
                to,
                subject: `Order Cancelled - ${orderNumber}`,
                text: `Your order has been cancelled.

Order Number: ${orderNumber}
Total: ${totalAmount.toFixed(2)} ${currency}
Reason: ${reason}

If you have already been charged, a refund will be processed within 5-7 business days.

If you have any questions, please contact our support team.

Thank you for your understanding.`,
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Your order has been cancelled</h2>
                    <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                        <p><strong>Order Number:</strong> ${orderNumber}</p>
                        <p><strong>Total:</strong> ${totalAmount.toFixed(2)} ${currency}</p>
                        <p><strong>Reason:</strong> ${reason}</p>
                    </div>
                    <p>If you have already been charged, a refund will be processed within <strong>5-7 business days</strong>.</p>
                    <p>If you have any questions, please contact our support team.</p>
                    <p>Thank you for your understanding.</p>
                </div>`,
            });
        } catch (error) {
            console.error('Error sending order cancellation email:', error);
        }
    }

    static async sendOrderStatusUpdate(to: string, orderNumber: string, status: string, message?: string) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Email Stub] Order Status Update to ${to}: Order ${orderNumber} - ${status}`);
            return;
        }

        const statusMessages: { [key: string]: string } = {
            'paid': 'Your payment has been confirmed and your order is being prepared.',
            'processing': 'Your order is being processed by the store.',
            'ready_for_pickup': 'Your order is ready for pickup!',
            'out_for_delivery': 'Your order is out for delivery.',
            'delivered': 'Your order has been delivered.',
            'completed': 'Your order has been completed. Thank you!'
        };

        try {
            await transporter.sendMail({
                from: '"IslandFund" <orders@islandfund.com>',
                to,
                subject: `Order Update - ${orderNumber}`,
                text: `Order Status Update

Order Number: ${orderNumber}
Status: ${status.replace(/_/g, ' ').toUpperCase()}

${message || statusMessages[status] || 'Your order status has been updated.'}

You can track your order at: https://islandfund.com/dashboard/orders`,
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0d9488;">Order Status Update</h2>
                    <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Order Number:</strong> ${orderNumber}</p>
                        <p><strong>Status:</strong> ${status.replace(/_/g, ' ').toUpperCase()}</p>
                    </div>
                    <p>${message || statusMessages[status] || 'Your order status has been updated.'}</p>
                    <p><a href="https://islandfund.com/dashboard/orders" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Track Your Order</a></p>
                </div>`,
            });
        } catch (error) {
            console.error('Error sending order status update email:', error);
        }
    }
}
