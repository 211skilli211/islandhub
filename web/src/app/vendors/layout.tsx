import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Our Partners | IslandHub',
    description: 'Connect with local businesses and service providers across the islands.',
};

export default function VendorsLayout({ children }: { children: ReactNode }) {
    return children;
}
