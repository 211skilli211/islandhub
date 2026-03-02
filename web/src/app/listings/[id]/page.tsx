import { Metadata } from 'next';
import ListingClient, { Listing } from '@/components/ListingClient';
import Link from 'next/link';
import api from '@/lib/api';
import { redirect } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getListing(id: string): Promise<Listing | null> {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const response = await fetch(`${apiUrl}/api/listings/${id}`, {
            next: { revalidate: 60 } // Cache for 60 seconds
        });
        if (!response.ok) return null;
        return response.json();
    } catch (e) {
        console.error("Fetch listing error:", e);
        return null;
    }
}

// Dynamic SEO / OpenGraph Metadata (Now valid as this is a Server Component)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const listing = await getListing(id);

    if (!listing) return { title: 'Listing Not Found | IslandHub' };

    return {
        title: `${listing.title} | IslandHub Marketplace`,
        description: listing.description,
        openGraph: {
            title: listing.title,
            description: listing.description,
            images: [listing.image_url || 'https://islandhub.com/og-default.jpg'],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: listing.title,
            description: listing.description,
            images: [listing.image_url || 'https://islandhub.com/og-default.jpg'],
        }
    };
}

export default async function ListingDetailPage({ params }: PageProps) {
    const { id } = await params;
    const listing = await getListing(id);

    if (!listing) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <span className="text-6xl mb-4">🏝️</span>
            <h1 className="text-2xl font-black text-slate-900">Listing Not Found</h1>
            <Link href="/listings" className="mt-4 text-teal-600 font-bold hover:underline">Back to Marketplace</Link>
        </div>
    );

    // SEO Redirect: If accessed via numeric ID but has a slug, redirect to conspicuous URL
    if (/^\d+$/.test(id) && listing.slug) {
        redirect(`/listings/${listing.slug}`);
    }

    return <ListingClient listing={listing} />;
}
