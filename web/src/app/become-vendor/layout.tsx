import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Become a Vendor | IslandHub',
    description: 'Join our marketplace and start selling your products or services to island locals and tourists.',
};

export default function BecomeVendorLayout({ children }: { children: ReactNode }) {
    return children;
}
