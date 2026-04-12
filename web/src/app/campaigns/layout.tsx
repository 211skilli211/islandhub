import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Campaigns | IslandHub',
    description: 'Support community-led projects and causes making a real difference across the islands.',
};

export default function CampaignsLayout({ children }: { children: ReactNode }) {
    return children;
}
