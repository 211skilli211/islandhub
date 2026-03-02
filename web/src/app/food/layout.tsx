import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Food & Dining | IslandHub',
    description: 'Discover authentic island flavors, restaurants, and homemade treats from local kitchens.',
};

export default function FoodLayout({ children }: { children: ReactNode }) {
    return children;
}
