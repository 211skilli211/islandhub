import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Community | IslandHub',
    description: 'Join our community of island locals, support causes, and connect with neighbors.',
};

export default function CommunityLayout({ children }: { children: ReactNode }) {
    return children;
}
