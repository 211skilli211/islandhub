import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Marketplace | IslandHub',
    description: 'Browse our marketplace of products, services, tours, and experiences from local vendors.',
};

export default function ListingsLayout({ children }: { children: ReactNode }) {
    return children;
}
