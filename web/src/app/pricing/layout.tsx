import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Pricing | IslandHub',
    description: 'Choose the perfect plan for your business - from free basic listings to premium vendor packages.',
};

export default function PricingLayout({ children }: { children: ReactNode }) {
    return children;
}
