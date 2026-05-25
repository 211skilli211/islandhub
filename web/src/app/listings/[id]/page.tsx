import { Metadata } from 'next';
import ListingClient, { Listing } from '@/components/ListingClient';
import ShareButtonsClient from '@/components/ShareButtons';
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

// Dynamic SEO / OpenGraph Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const listing = await getListing(id);

    if (!listing) return { title: 'Listing Not Found | IslandHub' };

    const ogImage = listing.image_url || 'https://islandhub.app/og-default.jpg';
    const isProduct = listing.type === 'product';
    const isService = listing.type === 'service';
    const isRental = listing.type === 'rental';

    // Build product-specific OG tags for Facebook/WhatsApp rich previews
    const productOgTags: Record<string, string> = {};
    if (isProduct || isService || isRental) {
        if (listing.price) {
            productOgTags['product:price:amount'] = String(listing.price);
            productOgTags['product:price:currency'] = listing.currency || 'XCD';
        }
        if (listing.metadata?.inventory_count !== undefined) {
            productOgTags['product:availability'] = listing.metadata.inventory_count > 0 ? 'in stock' : 'out of stock';
        } else {
            productOgTags['product:availability'] = 'in stock';
        }
        productOgTags['product:condition'] = 'new';
        if (listing.vendor_name || listing.owner_name) {
            productOgTags['product:brand'] = listing.vendor_name || listing.owner_name || '';
        }
        if (listing.slug) {
            productOgTags['product:retailer_item_id'] = listing.slug;
        }
    }

    return {
        title: `${listing.title} | IslandHub Marketplace`,
        description: listing.description?.slice(0, 200),
        openGraph: {
            title: listing.title,
            description: listing.description?.slice(0, 200),
            images: [ogImage],
            type: 'website',
            siteName: 'IslandHub Marketplace',
            url: `https://islandhub.app/listings/${listing.slug || id}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: listing.title,
            description: listing.description?.slice(0, 200),
            images: [ogImage],
        },
        other: {
            'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID || '',
            ...productOgTags,
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

    return (
        <div className="min-h-screen bg-slate-50">
            <ListingClient listing={listing} />
            <ShareButtonsClient listing={listing} />
        </div>
    );
}
