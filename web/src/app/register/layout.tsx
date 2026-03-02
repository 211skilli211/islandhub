import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Create Account | IslandHub',
    description: 'Join IslandHub to start shopping, selling, or supporting community causes.',
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
    return children;
}
