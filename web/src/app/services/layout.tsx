import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Services | IslandHub',
    description: 'Find professional services, tours, transport, and local experts for all your needs.',
};

export default function ServicesLayout({ children }: { children: ReactNode }) {
    return children;
}
