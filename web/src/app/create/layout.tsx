import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Create Listing | IslandHub',
    description: 'List your products, services, or experiences on our marketplace.',
};

export default function CreateLayout({ children }: { children: ReactNode }) {
    return children;
}
