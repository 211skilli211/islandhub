import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Tours & Experiences | IslandHub',
    description: 'Discover curated adventures and experiences across St. Kitts & Nevis - from volcano treks to scenic railway journeys.',
};

export default function ToursLayout({ children }: { children: ReactNode }) {
    return children;
}
