import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Login | IslandHub',
    description: 'Sign in to your IslandHub account to manage your listings, orders, and preferences.',
};

export default function LoginLayout({ children }: { children: ReactNode }) {
    return children;
}
