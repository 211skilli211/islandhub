'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface WiPayButtonProps {
    campaignId?: string;
    orderId?: string;
    amount: number;
    currency?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

const WiPayButton = ({ campaignId, orderId, amount, currency = 'XCD', onSuccess, onError }: WiPayButtonProps) => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/donations/create-intent', {
                campaign_id: campaignId !== 'cart' ? campaignId : null,
                order_id: orderId,
                amount,
                currency
            });

            // Redirect to WiPay hosted payment page
            window.location.href = data.redirectUrl;
        } catch (error: any) {
            console.error('Error creating WiPay payment:', error);
            const errorMsg = error.response?.data?.message || 'Failed to create payment';
            onError?.(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white rounded-2xl font-black text-xl shadow-xl shadow-emerald-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating Payment...
                </div>
            ) : `Pay $${amount} with Card`}
        </button>
    );
};

export default WiPayButton;