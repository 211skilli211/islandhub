'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface PaymentContextType {
    stripe: Stripe | null;
    isLoaded: boolean;
}

const PaymentContext = createContext<PaymentContextType>({
    stripe: null,
    isLoaded: false,
});

export function usePayment() {
    return useContext(PaymentContext);
}

export default function PaymentProvider({ children }: { children: React.ReactNode }) {
    const [stripe, setStripe] = useState<Stripe | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Only load payment SDKs on checkout pages or when explicitly needed
        // This check can be adjusted based on requirements
        const loadPaymentSDKs = async () => {
            try {
                if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
                    console.warn("Stripe key is missing");
                    return;
                }

                // Load Stripe
                // casting to any because loadStripe returns Promise<Stripe | null>
                const stripeInstance = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
                setStripe(stripeInstance);
                setIsLoaded(true);

                // Preconnect to Stripe CDN
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = 'https://js.stripe.com';
                document.head.appendChild(link);

            } catch (error) {
                console.error('Failed to load payment SDKs:', error);
            }
        };

        // We can lazily load this. For now, we load it when the provider mounts, 
        // assuming the provider is only mounted on pages that need it (or we can add logic to check pathname).
        loadPaymentSDKs();
    }, []);

    return (
        <PaymentContext.Provider value={{ stripe, isLoaded }}>
            {children}
        </PaymentContext.Provider>
    );
}
