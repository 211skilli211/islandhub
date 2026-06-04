'use client';

import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import toast from '@/lib/toast';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

interface PaymentIntent {
    client_secret: string;
    payment_intent_id: string;
    order_id: number;
    order_number: string;
}

export default function CheckoutPage() {
    const { cart, totalAmount, itemCount, setDeliverySettings, refreshCart } = useCart();
    const router = useRouter();
    const { user } = useAuthStore();
    const [processing, setProcessing] = useState(false);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState(cart?.delivery_address || '');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'dodopayments' | 'paypal' | 'crypto'>('dodopayments');
    const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

    useEffect(() => {
        // Redirect to login if user is not authenticated and cart is not empty
        if (!user && cart && itemCount > 0) {
            // Allow guest checkout but show warning
            toast.success('You can checkout as a guest or login for faster checkout', {
                icon: '👋',
                duration: 5000
            });
        }
    }, [user, cart, itemCount]);

    const getImageUrl = (path?: string) => {
        if (!path) return '/placeholder-product.jpg';
        if (path.startsWith('http')) return path;
        return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
    };

    const handleCheckout = async () => {
        if (!agreedToTerms) {
            toast.error('Please agree to the terms and conditions');
            return;
        }

        if (cart?.delivery_type === 'delivery' && !deliveryAddress.trim()) {
            toast.error('Please enter a delivery address');
            return;
        }

        if (!user && !guestEmail.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        try {
            setLoadingPayment(true);

            // Update delivery settings before creating order
            if (cart?.delivery_type === 'delivery') {
                await setDeliverySettings('delivery', deliveryAddress);
            }

            const commonPayload = {
                delivery_address: cart?.delivery_type === 'delivery' ? deliveryAddress : undefined,
                guest_email: !user ? guestEmail : undefined,
                guest_phone: !user ? guestPhone : undefined,
            };

            if (paymentMethod === 'dodopayments') {
                // DodoPayments card payment
                const { data } = await api.post('/payments/create-intent', commonPayload);

                if (data.payment_url) {
                    window.location.href = data.payment_url;
                    return;
                }
                if (data.return_url) {
                    window.location.href = data.return_url;
                    return;
                }
                if (data.client_secret) {
                    setPaymentIntent(data);
                    setProcessing(true);
                } else {
                    throw new Error('Invalid payment response');
                }
            } else if (paymentMethod === 'paypal') {
                // PayPal payment
                const { data } = await api.post('/payments/paypal/create', {
                    ...commonPayload,
                    order_id: cart?.cart_id,
                    amount: finalTotal,
                    currency: 'XCD',
                });

                if (data.orderId) {
                    // Redirect to PayPal approval
                    const paypalRes = await api.get(`/payments/paypal/approve/${data.orderId}`);
                    if (paypalRes.data?.approval_url) {
                        window.location.href = paypalRes.data.approval_url;
                        return;
                    }
                }
                // Fallback: redirect to PayPal checkout page
                window.location.href = `/checkout/paypal?order=${data.orderId}`;
            } else if (paymentMethod === 'crypto') {
                // Crypto payment
                const { data } = await api.post('/payments/crypto/create', {
                    ...commonPayload,
                    order_id: cart?.cart_id,
                    coin: 'USDT', // Default to USDT, user can change
                    amount_xcd: finalTotal,
                });

                if (data.payment_id) {
                    // Show crypto payment modal/page
                    router.push(`/checkout/crypto?payment=${data.payment_id}`);
                } else {
                    throw new Error('Failed to create crypto payment');
                }
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate checkout. Please try again.');
        } finally {
            setLoadingPayment(false);
        }
    };

    const handlePaymentSuccess = async () => {
        try {
            // Clear cart after successful payment
            await api.delete('/cart/clear');
            await refreshCart();

            // Redirect to success page
            if (paymentIntent?.order_id) {
                router.push(`/orders/${paymentIntent.order_id}/confirmation`);
            } else {
                router.push('/dashboard/orders');
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            // Still redirect even if cart clear fails
            router.push('/dashboard/orders');
        }
    };

    if (!cart || itemCount === 0) {
        return (
            <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-ink-primary mb-4">Your cart is empty</h1>
                    <p className="text-ink-secondary mb-8">Add some items to get started!</p>
                    <button
                        onClick={() => router.push('/listings')}
                        className="px-8 py-4 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-all"
                    >
                        Browse Marketplace
                    </button>
                </div>
            </div>
        );
    }

    const deliveryFee = cart?.delivery_type === 'delivery' ? 10.00 : 0;
    const serviceFee = (totalAmount + deliveryFee) * 0.05;
    const tax = (totalAmount + deliveryFee) * 0.10;
    const finalTotal = totalAmount + deliveryFee + serviceFee + tax;

    return (
        <div className="min-h-screen bg-surface-secondary py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-ink-primary mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-surface-elevated rounded-2xl shadow-sm border border-border-primary p-6">
                            <h2 className="text-2xl font-bold text-ink-primary mb-6">Order Summary</h2>

                            <div className="space-y-4">
                                {cart.items.map((item) => (
                                    <div key={item.item_id} className="flex gap-4 p-4 bg-surface-secondary rounded-xl">
                                        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-surface-elevated">
                                            <Image
                                                src={getImageUrl(item.image_url)}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-ink-primary">{item.title}</h3>
                                            <p className="text-sm text-ink-secondary">{item.store_name}</p>

                                            {item.rental_start_date && (
                                                <p className="text-xs text-accent-400 mt-1">
                                                    {(() => { const s = new Date(item.rental_start_date); const e = new Date(item.rental_end_date!); const days = Math.round((e.getTime() - s.getTime()) / 86400000); const fmt = { weekday: 'short', month: 'short', day: 'numeric' } as const; return `${s.toLocaleDateString('en-US', fmt)} to ${e.toLocaleDateString('en-US', fmt)} (${days} ${days === 1 ? 'Night' : 'Nights'})`; })()}
                                                </p>
                                            )}
                                            {item.service_package && (
                                                <p className="text-xs text-accent-400 mt-1">Package: {item.service_package}</p>
                                            )}
                                            {item.selected_variant && (
                                                <p className="text-xs text-ink-tertiary mt-1">
                                                    Variant: {Object.entries(item.selected_variant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                </p>
                                            )}
                                            {item.selected_addons && item.selected_addons.length > 0 && (
                                                <p className="text-xs text-ink-tertiary mt-1">
                                                    Add-ons: {item.selected_addons.map((a: any) => a.name).join(', ')}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm text-ink-secondary">Qty: {item.quantity}</span>
                                                <span className="font-bold text-ink-primary">${(item.price_snapshot * item.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Method */}
                        <div className="bg-surface-elevated rounded-2xl shadow-sm border border-border-primary p-6">
                            <h2 className="text-2xl font-bold text-ink-primary mb-6">Delivery Method</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setDeliverySettings('pickup')}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${cart.delivery_type === 'pickup' ? 'border-accent-500 bg-accent-500/10' : 'border-border-primary hover:border-border-primary'}`}
                                >
                                    <div className="font-bold text-ink-primary">Store Pickup</div>
                                    <div className="text-sm text-ink-tertiary">Pick up at the store</div>
                                    <div className="text-sm font-bold text-accent-400 mt-1">FREE</div>
                                </button>
                                <button
                                    onClick={() => setDeliverySettings('delivery')}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${cart.delivery_type === 'delivery' ? 'border-accent-500 bg-accent-500/10' : 'border-border-primary hover:border-border-primary'}`}
                                >
                                    <div className="font-bold text-ink-primary">Home Delivery</div>
                                    <div className="text-sm text-ink-tertiary">Delivered to your door</div>
                                    <div className="text-sm font-bold text-accent-400 mt-1">$10.00</div>
                                </button>
                            </div>

                            {cart.delivery_type === 'delivery' && (
                                <div className="mt-6 space-y-4">
                                    <label className="block text-sm font-bold text-ink-secondary uppercase tracking-wider">
                                        Delivery Address <span className="text-[#ef4444]">*</span>
                                    </label>
                                    <textarea
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        onBlur={() => setDeliverySettings('delivery', deliveryAddress)}
                                        placeholder="Enter your full delivery address including street, city, and postal code..."
                                        className="w-full px-4 py-3 bg-surface-secondary border-border-primary rounded-xl focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                                        rows={3}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* Contact Information - For Guest Checkout */}
                        {!user && (
                            <div className="bg-surface-elevated rounded-2xl shadow-sm border border-border-primary p-6">
                                <h2 className="text-2xl font-bold text-ink-primary mb-6">Contact Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-ink-secondary uppercase tracking-wider mb-2">
                                            Email Address <span className="text-[#ef4444]">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-3 bg-surface-secondary border-border-primary rounded-xl focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-ink-secondary uppercase tracking-wider mb-2">
                                            Phone Number (optional)
                                        </label>
                                        <input
                                            type="tel"
                                            value={guestPhone}
                                            onChange={(e) => setGuestPhone(e.target.value)}
                                            placeholder="+1 (869) 555-0123"
                                            className="w-full px-4 py-3 bg-surface-secondary border-border-primary rounded-xl focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Terms & Conditions */}
                        <div className="bg-surface-elevated rounded-2xl shadow-sm border border-border-primary p-6">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-accent-400 rounded border-border-primary focus:ring-accent-400"
                                />
                                <span className="text-sm text-ink-secondary">
                                    I agree to the <a href="/terms" className="text-accent-400 hover:underline">Terms of Service</a> and{' '}
                                    <a href="/privacy" className="text-accent-400 hover:underline">Privacy Policy</a>. I understand that
                                    my order will be processed once payment is confirmed.
                                </span>
                            </label>
                        </div>
                    </div>

                        {/* Payment Method */}
                        <div className="bg-surface-elevated rounded-2xl shadow-sm border border-border-primary p-6">
                            <h2 className="text-2xl font-bold text-ink-primary mb-6">Payment Method</h2>
                            <div className="space-y-3">
                                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'dodopayments' ? 'border-accent-500 bg-accent-500/10' : 'border-border-primary hover:border-border-primary'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="dodopayments"
                                        checked={paymentMethod === 'dodopayments'}
                                        onChange={() => setPaymentMethod('dodopayments')}
                                        className="w-5 h-5 text-accent-400"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">💳</span>
                                            <span className="font-bold text-ink-primary">Credit / Debit Card</span>
                                        </div>
                                        <p className="text-xs text-ink-tertiary mt-1">Visa, Mastercard, American Express</p>
                                    </div>
                                    <span className="text-xs font-bold text-ink-tertiary">via DodoPayments</span>
                                </label>

                                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-accent-500 bg-accent-500/10' : 'border-border-primary hover:border-border-primary'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="paypal"
                                        checked={paymentMethod === 'paypal'}
                                        onChange={() => setPaymentMethod('paypal')}
                                        className="w-5 h-5 text-accent-400"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🅿️</span>
                                            <span className="font-bold text-ink-primary">PayPal</span>
                                        </div>
                                        <p className="text-xs text-ink-tertiary mt-1">Pay with your PayPal account or card</p>
                                    </div>
                                    <span className="text-xs font-bold text-ink-tertiary">via PayPal</span>
                                </label>

                                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'crypto' ? 'border-accent-500 bg-accent-500/10' : 'border-border-primary hover:border-border-primary'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="crypto"
                                        checked={paymentMethod === 'crypto'}
                                        onChange={() => setPaymentMethod('crypto')}
                                        className="w-5 h-5 text-accent-400"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">₿</span>
                                            <span className="font-bold text-ink-primary">Cryptocurrency</span>
                                        </div>
                                        <p className="text-xs text-ink-tertiary mt-1">USDT, BTC, ETH</p>
                                    </div>
                                    <span className="text-xs font-bold text-ink-tertiary">via Crypto</span>
                                </label>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                    <div className="lg:col-span-1">
                        <div className="bg-surface-elevated rounded-2xl shadow-sm border border-border-primary p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-ink-primary mb-6">Price Details</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-ink-secondary">
                                    <span>Subtotal ({itemCount} items)</span>
                                    <span>${totalAmount.toFixed(2)}</span>
                                </div>
                                {cart.delivery_type === 'delivery' && (
                                    <div className="flex justify-between text-ink-secondary">
                                        <span>Delivery Fee</span>
                                        <span>${deliveryFee.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-ink-secondary">
                                    <span>Service Fee (5%)</span>
                                    <span>${serviceFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-ink-secondary">
                                    <span>Tax (10%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-border-primary pt-3">
                                    <div className="flex justify-between text-xl font-bold text-ink-primary">
                                        <span>Total</span>
                                        <span>${finalTotal.toFixed(2)} XCD</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={loadingPayment || processing || !agreedToTerms}
                                className="w-full py-4 bg-gradient-to-r from-accent-500 to-accent-400 text-white font-bold rounded-xl hover:from-accent-600 hover:to-accent-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingPayment ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    'Proceed to Payment'
                                )}
                            </button>

                            <p className="text-xs text-ink-tertiary text-center mt-4">
                                Secure payment powered by DodoPayments
                            </p>

                            {!user && (
                                <div className="mt-4 pt-4 border-t border-border-primary">
                                    <p className="text-sm text-ink-secondary text-center">
                                        Already have an account?{' '}
                                        <button
                                            onClick={() => router.push(`/login?redirect=${encodeURIComponent('/checkout')}`)}
                                            className="text-accent-400 font-bold hover:underline"
                                        >
                                            Login for faster checkout
                                        </button>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
