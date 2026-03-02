import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Support Community Projects | IslandHub Fund',
    description: 'Make a difference in island communities. Fund education, environment, health, and cultural projects that matter.',
    openGraph: {
        title: 'Support Community Projects | IslandHub Fund',
        description: 'Empowering island communities through collective support.',
        images: ['/og-fund.jpg'],
    },
};

export default function FundLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
