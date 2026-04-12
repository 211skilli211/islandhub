import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Island Rentals | IslandHub',
    description: 'Find equipment, vehicles, and spaces for rent. From beach gear to vacation homes, get what you need for your island adventure.',
};

export default function RentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
