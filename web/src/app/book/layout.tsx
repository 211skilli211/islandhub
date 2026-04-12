import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Experiences & Services | IslandHub',
    description: 'Book local tours, instructors, and professionals. Real islanders, real experiences.',
};

export default function BookLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
