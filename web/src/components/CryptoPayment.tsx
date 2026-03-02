'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';

interface CryptoPaymentProps {
    campaignId?: string;
    orderId?: string;
    amount: number;
    currency?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

const CryptoPayment = ({ campaignId, orderId, amount, currency = 'USD', onSuccess, onError }: CryptoPaymentProps) => {
    const [chargeData, setChargeData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createCharge = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/payments/crypto/create', {
                campaign_id: campaignId !== 'cart' ? campaignId : null,
                order_id: orderId,
                amount,
                currency
            });
            setChargeData(data);
            // For crypto, success is immediate creation, but actual payment confirmation happens via webhook
            onSuccess?.();
        } catch (error: any) {
            console.error('Error creating crypto charge:', error);
            const errorMsg = error.response?.data?.message || 'Failed to create crypto charge';
            setError(errorMsg);
            onError?.(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!chargeData) {
        return (
            <div className="text-center">
                <button
                    onClick={createCharge}
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white rounded-2xl font-black text-xl shadow-xl shadow-amber-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Creating Charge...
                        </div>
                    ) : `Pay $${amount} with Crypto`}
                </button>
                {error && (
                    <p className="mt-3 text-rose-600 text-sm font-medium">{error}</p>
                )}
            </div>
        );
    }

    return (
        <div className="text-center space-y-6">
            <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6">
                <h3 className="text-lg font-black text-slate-700 mb-4">Scan QR Code to Pay</h3>
                <div className="flex justify-center mb-4">
                    <QRCodeSVG value={chargeData.qrCodeUrl} size={200} />
                </div>
                <p className="text-slate-500 font-medium text-sm mb-4">
                    Scan with your crypto wallet to complete the payment
                </p>
                <a
                    href={chargeData.hostedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
                >
                    Open in Wallet
                </a>
            </div>
            <div className="text-sm text-slate-500 font-medium space-y-2">
                <p>💡 Payment will be confirmed automatically once received on the blockchain</p>
                <p>📧 You'll receive a receipt email when the transaction is complete</p>
            </div>
        </div>
    );
};

export default CryptoPayment;