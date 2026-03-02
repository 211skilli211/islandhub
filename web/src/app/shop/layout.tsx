import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shop Local Treasures | IslandHub',
    description: 'Discover authentic island products from local artisans. From handcrafted jewelry to fresh spices, every purchase supports a small business.',
};

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
