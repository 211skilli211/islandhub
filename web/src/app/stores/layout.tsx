import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Marketplace Directory | IslandHub',
    description: 'Discover trusted local businesses, artisans, and service providers in our marketplace.',
};

export default function StoresLayout({ children }: { children: ReactNode }) {
    return children;
}
