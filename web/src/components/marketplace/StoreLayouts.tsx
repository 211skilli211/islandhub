'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import ReviewSection from '@/components/ReviewSection';
import api, { getImageUrl } from '@/lib/api';
import { BadgeList } from './BadgeSelector';
import React, { useState, useEffect } from 'react';
import KitchenSidebar from './KitchenSidebar';
import FoodSelectionModal from './FoodSelectionModal';
import { useStoreSections } from './hooks/useStoreSections';
import PromotionBanner from '@/components/advertising/PromotionBanner';
import AdSpace from '@/components/advertising/AdSpace';

import { FoodShopLayout } from './layouts/FoodShopLayout';
import { ServiceLayout } from './layouts/ServiceLayout';
import { RentalLayout } from './layouts/RentalLayout';
import { ProductLayout } from './layouts/ProductLayout';

interface StoreProps {
    store: any;
    listings: any[];
    menuData?: any;
    layoutType?: 'food' | 'service' | 'rental' | 'product';
}

// Layout selection - uses explicit layoutType if provided, otherwise falls back to category detection
function detectLayoutType(store: any, layoutType?: string): 'food' | 'service' | 'rental' | 'product' {
    if (layoutType && ['food', 'service', 'rental', 'product'].includes(layoutType)) {
        return layoutType as 'food' | 'service' | 'rental' | 'product';
    }
    const templateMap: Record<string, 'food' | 'service' | 'rental' | 'product'> = {
        'food_vendor': 'food',
        'host_rental': 'rental',
        'service_provider': 'service',
        'retail_produce': 'product',
    };
    if (store.template_id && templateMap[store.template_id]) {
        return templateMap[store.template_id];
    }
    const category = (store.category || '').toLowerCase();
    const subtype = (store.subtype || '').toLowerCase();
    if (category === 'food' || category === 'restaurant' || category === 'cafe' ||
        subtype.includes('food') || subtype.includes('restaurant') || subtype.includes('cafe')) {
        return 'food';
    }
    if (category === 'rental' || category === 'rentals' ||
        subtype.includes('rental') || subtype.includes('boat') || subtype.includes('car')) {
        return 'rental';
    }
    if (category === 'service' || category === 'services' || category === 'professional' || category === 'retail' ||
        subtype.includes('service') || subtype.includes('consultant') || subtype.includes('trades')) {
        return 'service';
    }
    return 'product';
}

// Wrapper component that selects the correct layout based on layoutType prop
export const StoreLayouts = ({ store, listings, layoutType }: StoreProps) => {
    const detectedLayout = detectLayoutType(store, layoutType);
    switch (detectedLayout) {
        case 'food':
            return <FoodShopLayout store={store} listings={listings} />;
        case 'service':
            return <ServiceLayout store={store} listings={listings} />;
        case 'rental':
            return <RentalLayout store={store} listings={listings} />;
        case 'product':
        default:
            return <ProductLayout store={store} listings={listings} />;
    }
};

export default StoreLayouts;
