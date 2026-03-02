import React from 'react';

type ListingType = 'product' | 'campaign' | 'rental' | 'service';

const badges: Record<ListingType, { label: string; color: string }> = {
    product: { label: 'Product', color: 'bg-blue-100 text-blue-800' },
    campaign: { label: 'Campaign', color: 'bg-green-100 text-green-800' },
    rental: { label: 'Rental', color: 'bg-purple-100 text-purple-800' },
    service: { label: 'Service', color: 'bg-orange-100 text-orange-800' },
};

export default function TypeBadge({ type }: { type?: string }) {
    const key = (type || 'product').toLowerCase() as ListingType;
    const badge = badges[key] || { label: type || 'Listing', color: 'bg-gray-100 text-gray-800' };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
            {badge.label}
        </span>
    );
}
