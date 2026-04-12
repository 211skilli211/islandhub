import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Rental Hub | IslandHub',
    description: 'Find the perfect rental for your island adventure - stays, vehicles, boats, and equipment.',
};

export default function RentalHubLayout({ children }: { children: ReactNode }) {
    return children;
}
