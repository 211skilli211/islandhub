import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
    ? new Resend(process.env.RESEND_API_KEY) 
    : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'IslandHub <onboarding@resend.dev>';
const BASE_URL = process.env.BASE_URL || 'https://islandhub.onrender.com';

export class EmailService {
    private static async sendEmail(to: string, subject: string, html: string, text?: string) {
        if (!resend) {
            console.log(`[Email] Sending to ${to}: ${subject}`);
            console.log(`[Email] HTML: ${html.substring(0, 200)}...`);
            return { success: true, id: 'mock-email-id' };
        }

        try {
            const result = await resend.emails.send({
                from: FROM_EMAIL,
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, ''),
            });
            console.log(`[Email] Sent successfully to ${to}:`, result.data?.id);
            return { success: true, id: result.data?.id };
        } catch (error) {
            console.error(`[Email] Failed to send to ${to}:`, error);
            return { success: false, error };
        }
    }

    static async sendWelcomeEmail(to: string, name: string) {
        const subject = 'Welcome to IslandHub! 🌴';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                    <p style="color: #64748b; margin: 5px 0;">Your Caribbean Marketplace</p>
                </div>
                <div style="background: #f0fdfa; padding: 30px; border-radius: 12px;">
                    <h2 style="color: #134e4a; margin-top: 0;">Welcome, ${name}!</h2>
                    <p style="color: #334155; line-height: 1.6;">
                        We're thrilled to have you on board! IslandHub is your gateway to discovering 
                        the best of the Caribbean - from local artisans to hidden gems.
                    </p>
                    <p style="color: #334155; line-height: 1.6;">
                        Start exploring our marketplace, connect with local vendors, and experience 
                        the Caribbean like never before.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${BASE_URL}/explore" style="display: inline-block; background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Start Exploring →
                        </a>
                    </div>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                    The IslandHub Team | Connecting the Caribbean
                </p>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendVerificationEmail(to: string, token: string) {
        const verifyUrl = `${BASE_URL}/verify-email?token=${token}`;
        const subject = 'Verify Your Email - IslandHub';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                </div>
                <div style="background: #f0fdfa; padding: 30px; border-radius: 12px;">
                    <h2 style="color: #134e4a; margin-top: 0;">Verify Your Email</h2>
                    <p style="color: #334155; line-height: 1.6;">
                        Thanks for signing up! Please verify your email address to get started.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyUrl}" style="display: inline-block; background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Verify Email
                        </a>
                    </div>
                    <p style="color: #64748b; font-size: 14px;">
                        Or copy this link: <br>
                        <span style="color: #0d9488;">${verifyUrl}</span>
                    </p>
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
                        This link expires in 24 hours.
                    </p>
                </div>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendDonationReceipt(to: string, amount: number, campaignTitle: string, transactionId: string) {
        const subject = 'Donation Receipt - IslandHub';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                </div>
                <div style="background: #f0fdfa; padding: 30px; border-radius: 12px;">
                    <h2 style="color: #134e4a; margin-top: 0;">Thank You for Your Support! 🙏</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Campaign:</strong> ${campaignTitle}</p>
                        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
                        <p><strong>Transaction ID:</strong> ${transactionId}</p>
                    </div>
                    <p style="color: #334155;">Your donation makes a difference in the Caribbean community.</p>
                </div>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendSubscriptionConfirmation(to: string, tier: string, price: number) {
        const subject = 'Subscription Confirmed! 🚀';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                </div>
                <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; border-radius: 12px; color: white;">
                    <h2 style="margin-top: 0;">🎉 Subscription Active!</h2>
                    <p style="font-size: 18px;">Welcome to the <strong>${tier}</strong> plan</p>
                    <p style="font-size: 24px; font-weight: bold;">$${price}/month</p>
                </div>
                <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <p style="margin: 0; color: #334155;">Thank you for choosing IslandHub Pro!</p>
                </div>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendSubscriptionCancelled(to: string, tier: string, endDate: string) {
        const subject = 'Subscription Cancelled - IslandHub';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                </div>
                <div style="background: #fef2f2; padding: 30px; border-radius: 12px;">
                    <h2 style="color: #dc2626; margin-top: 0;">Subscription Cancelled</h2>
                    <p style="color: #334155;">Your <strong>${tier}</strong> subscription has been cancelled.</p>
                    <p style="color: #64748b;">You'll retain access until: <strong>${endDate}</strong></p>
                    <p style="color: #334155; margin-top: 20px;">We hope to see you back soon!</p>
                </div>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendPaymentFailed(to: string, tier: string) {
        const subject = '⚠️ Payment Failed - Action Required';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                </div>
                <div style="background: #fef2f2; padding: 30px; border-radius: 12px; border-left: 4px solid #dc2626;">
                    <h2 style="color: #dc2626; margin-top: 0;">Payment Failed</h2>
                    <p style="color: #334155;">We were unable to process your payment for the <strong>${tier}</strong> subscription.</p>
                    <p style="color: #64748b;">Please update your payment method to avoid service interruption.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${BASE_URL}/settings/billing" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Update Payment Method
                        </a>
                    </div>
                </div>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendOrderConfirmation(to: string, orderNumber: string, totalAmount: number, currency: string, itemCount: number) {
        const subject = `Order Confirmed - ${orderNumber}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                    <p style="color: #64748b;">Order Confirmation</p>
                </div>
                <div style="background: #f0fdfa; padding: 30px; border-radius: 12px;">
                    <h2 style="color: #134e4a; margin-top: 0;">Thank you for your order! 🎉</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="font-size: 24px; font-weight: bold; color: #0d9488; margin: 0;">${orderNumber}</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;">
                        <p><strong>Total:</strong> ${totalAmount.toFixed(2)} ${currency}</p>
                        <p><strong>Items:</strong> ${itemCount}</p>
                    </div>
                    <p style="color: #64748b;">Your order is being processed. You'll receive updates as it progresses.</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${BASE_URL}/dashboard/orders" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                            Track Order
                        </a>
                    </div>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                    Thank you for shopping with IslandHub!
                </p>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendOrderCancellationEmail(to: string, orderNumber: string, totalAmount: number, currency: string, reason: string) {
        const subject = `Order Cancelled - ${orderNumber}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                </div>
                <div style="background: #fef2f2; padding: 30px; border-radius: 12px; border-left: 4px solid #dc2626;">
                    <h2 style="color: #dc2626; margin-top: 0;">Order Cancelled</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Order:</strong> ${orderNumber}</p>
                        <p><strong>Amount:</strong> ${totalAmount.toFixed(2)} ${currency}</p>
                        <p><strong>Reason:</strong> ${reason}</p>
                    </div>
                    <p style="color: #64748b;">If charged, refund processed in 5-7 business days.</p>
                </div>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendOrderStatusUpdate(to: string, orderNumber: string, status: string, message?: string) {
        const statusMessages: { [key: string]: string } = {
            'paid': 'Your payment has been confirmed and your order is being prepared.',
            'processing': 'Your order is being processed by the store.',
            'ready_for_pickup': 'Your order is ready for pickup!',
            'out_for_delivery': 'Your order is out for delivery.',
            'delivered': 'Your order has been delivered.',
            'completed': 'Your order has been completed. Thank you!'
        };

        const statusColors: { [key: string]: string } = {
            'paid': '#0d9488',
            'processing': '#f59e0b',
            'ready_for_pickup': '#8b5cf6',
            'out_for_delivery': '#3b82f6',
            'delivered': '#22c55e',
            'completed': '#22c55e'
        };

        const subject = `Order Update - ${orderNumber}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                </div>
                <div style="background: #f0fdfa; padding: 30px; border-radius: 12px;">
                    <h2 style="color: #134e4a; margin-top: 0;">Order Update</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="font-size: 18px;"><strong>${orderNumber}</strong></p>
                        <p style="color: ${statusColors[status] || '#64748b'}; font-size: 16px; text-transform: uppercase;">
                            ${status.replace(/_/g, ' ')}
                        </p>
                    </div>
                    <p style="color: #334155;">${message || statusMessages[status] || 'Your order status has been updated.'}</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${BASE_URL}/dashboard/orders" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                            View Order
                        </a>
                    </div>
                </div>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendChangeRequestEmail(to: string, campaignTitle: string, feedback: string) {
        const subject = 'Changes Requested - IslandHub';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                </div>
                <div style="background: #fef3c7; padding: 30px; border-radius: 12px;">
                    <h2 style="color: #92400e; margin-top: 0;">Changes Requested</h2>
                    <p style="color: #334155;">An admin has requested changes to your campaign:</p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Campaign:</strong> ${campaignTitle}</p>
                        <p><strong>Feedback:</strong></p>
                        <p style="color: #64748b;">${feedback}</p>
                    </div>
                    <p style="color: #334155;">Please update and resubmit for approval.</p>
                </div>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendComplianceApprovedEmail(to: string, name: string, requirementName: string) {
        const subject = '✅ Compliance Approved - IslandHub';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                </div>
                <div style="background: #f0fdfa; padding: 30px; border-radius: 12px; border-left: 4px solid #22c55e;">
                    <h2 style="color: #166534; margin-top: 0;">🎉 Compliance Approved!</h2>
                    <p style="color: #334155;">Hi ${name},</p>
                    <p style="color: #334155;">Great news! Your compliance requirement has been <strong>approved</strong>.</p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Requirement:</strong> ${requirementName}</p>
                        <p style="color: #22c55e;"><strong>Status: Approved</strong></p>
                    </div>
                    <p style="color: #64748b;">Keep up the great work completing your vendor profile!</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${BASE_URL}/dashboard?tab=compliance" style="display: inline-block; background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            View Compliance Status
                        </a>
                    </div>
                </div>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendComplianceRejectedEmail(to: string, name: string, requirementName: string, reason: string) {
        const subject = '⚠️ Compliance Update Required - IslandHub';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                </div>
                <div style="background: #fef2f2; padding: 30px; border-radius: 12px; border-left: 4px solid #dc2626;">
                    <h2 style="color: #dc2626; margin-top: 0;">Action Required</h2>
                    <p style="color: #334155;">Hi ${name},</p>
                    <p style="color: #334155;">Your compliance submission needs revision.</p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Requirement:</strong> ${requirementName}</p>
                        <p><strong>Status:</strong> <span style="color: #dc2626;">Rejected</span></p>
                        <p><strong>Reason:</strong></p>
                        <p style="color: #64748b;">${reason || 'Please contact support for details.'}</p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${BASE_URL}/dashboard?tab=compliance" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Update Compliance
                        </a>
                    </div>
                </div>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendKYCApprovedEmail(to: string, name: string) {
        const subject = '✅ KYC Verified - IslandHub';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                </div>
                <div style="background: #f0fdfa; padding: 30px; border-radius: 12px; border-left: 4px solid #22c55e;">
                    <h2 style="color: #166534; margin-top: 0;">🎉 KYC Verified!</h2>
                    <p style="color: #334155;">Hi ${name},</p>
                    <p style="color: #334155;">Your identity verification has been <strong>approved</strong>. You now have full access to all vendor features.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${BASE_URL}/dashboard" style="display: inline-block; background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Go to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendKYCRejectedEmail(to: string, name: string, reason: string) {
        const subject = '⚠️ KYC Verification Failed - IslandHub';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                </div>
                <div style="background: #fef2f2; padding: 30px; border-radius: 12px; border-left: 4px solid #dc2626;">
                    <h2 style="color: #dc2626; margin-top: 0;">KYC Verification Failed</h2>
                    <p style="color: #334155;">Hi ${name},</p>
                    <p style="color: #334155;">Unfortunately, your identity verification could not be approved.</p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Reason:</strong></p>
                        <p style="color: #64748b;">${reason || 'Please resubmit your documents with clearer images.'}</p>
                    </div>
                    <p style="color: #334155;">Please update your documents and try again.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${BASE_URL}/dashboard?tab=kyc" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Resubmit Documents
                        </a>
                    </div>
                </div>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendPayoutConfirmation(to: string, amount: number, currency: string, payoutReference: string) {
        const subject = '💰 Payout Processed - IslandHub';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                    <p style="color: #64748b;">Vendor Payout Confirmation</p>
                </div>
                <div style="background: #f0fdfa; padding: 30px; border-radius: 12px;">
                    <h2 style="color: #134e4a; margin-top: 0;">💸 Payout Completed!</h2>
                    <p style="color: #334155;">Your payout has been processed successfully.</p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Amount:</strong> ${amount.toFixed(2)} ${currency}</p>
                        <p><strong>Reference:</strong> ${payoutReference}</p>
                        <p><strong>Status:</strong> <span style="color: #22c55e;">Completed</span></p>
                    </div>
                    <p style="color: #64748b;">Funds should arrive in your account within 1-3 business days.</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${BASE_URL}/dashboard/vendor/payouts" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                            View Payout History
                        </a>
                    </div>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                    Thank you for selling on IslandHub!
                </p>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendPasswordResetEmail(to: string, name: string, resetLink: string) {
        const subject = '🔐 Reset Your IslandHub Password';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0d9488; margin: 0;">🌴 IslandHub</h1>
                    <p style="color: #64748b;">Password Reset</p>
                </div>
                <div style="background: #fef3c7; padding: 30px; border-radius: 12px; border-left: 4px solid #f59e0b;">
                    <h2 style="color: #92400e; margin-top: 0;">Reset Your Password</h2>
                    <p style="color: #334155;">Hi ${name},</p>
                    <p style="color: #334155;">We received a request to reset your password. This link expires in <strong>15 minutes</strong>.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #64748b; font-size: 12px;">
                        If you didn't request this, please ignore this email or contact support if you have concerns.
                    </p>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                    © ${new Date().getFullYear()} IslandHub. All rights reserved.
                </p>
            </div>
        `;
        return this.sendEmail(to, subject, html);
    }

    static async sendGenericEmail(to: string, subject: string, html: string) {
        return this.sendEmail(to, subject, html);
    }
}