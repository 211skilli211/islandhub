import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Rentals | IslandHub',
    description: 'Find the perfect rental for your island adventure - villas, apartments, cars, boats, and equipment.',
};

export default function RentalsLayout({ children }: { children: ReactNode }) {
    return children;
}
