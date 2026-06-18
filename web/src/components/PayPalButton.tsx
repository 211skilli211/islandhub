'use client';

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import api from '@/lib/api';

interface PayPalButtonProps {
    campaignId?: string;
    orderId?: string;
    amount: number;
    currency?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

const PayPalButton = ({ campaignId, orderId, amount, currency = 'USD', onSuccess, onError }: PayPalButtonProps) => {
    const createOrder = async () => {
        try {
            const { data } = await api.post('/payments/paypal/create', {
                campaign_id: campaignId !== 'cart' ? campaignId : null,
                order_id: orderId,
                amount,
                currency
            });
            return data.orderId;
        } catch (error: any) {
            console.error('Error creating PayPal order:', error);
            onError?.(error.response?.data?.message || 'Failed to create order');
            throw error;
        }
    };

    const onApprove = async (data: any) => {
        try {
            await api.post('/payments/paypal/capture', {
                order_id: data.orderID
            });
            onSuccess?.();
        } catch (error: any) {
            console.error('Error capturing PayPal payment:', error);
            onError?.(error.response?.data?.message || 'Failed to capture payment');
        }
    };

    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
    const isMock = !paypalClientId || paypalClientId === 'your_paypal_client_id';

    if (isMock) {
        return (
            <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs font-medium">
                    <span className="font-bold">⚠️ PayPal Mock Mode:</span> Using placeholder client ID.
                </div>
                <button
                    onClick={() => onSuccess?.()}
                    className="w-full py-4 bg-[#0070ba] hover:bg-[#003087] text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                    <span className="text-xl">🅿️</span> Mock PayPal Checkout
                </button>
            </div>
        );
    }

    return (
        <PayPalScriptProvider options={{ clientId: paypalClientId, currency }}>
            <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                style={{
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'paypal'
                }}
            />
        </PayPalScriptProvider>
    );
};

export default PayPalButton;