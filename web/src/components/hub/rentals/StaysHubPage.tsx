'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getRentalSubHubs, getHubConfig } from '@/lib/hubConfigs';
import { ImageGallery, RatingBadge, PriceTag, AvailabilityBadge, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import BookingWidget from '@/components/hub/BookingWidget';
import FeaturedMarquee from '@/components/hub/FeaturedMarquee';
import api, { getImageUrl } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RentalProperty {
  id: number;
  store_id?: number;
  name: string;
  business_name?: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  branding_color?: string;
  category: string;
  subtype: string;
  slug: string;
  rating?: number;
  is_trending?: boolean;
  // Rental-specific fields (from rental_properties table, fallback to defaults)
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  max_guests?: number;
  amenities?: string[];
  price_per_night?: number;
  location_lat?: number;
  location_lng?: number;
  images?: string[];
}

// ─── Rental Card (Airbnb-style) ──────────────────────────────────────────────

function RentalCard({ property: p, index }: { property: RentalProperty; index: number }) {
  const images = (p.images?.length ? p.images : p.banner_url ? [getImageUrl(p.banner_url)] : []).filter(Boolean) as string[];
  const name = p.name || p.business_name || 'Property';
  const price = p.price_per_night || 85;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/hub/rentals/stays/${p.slug}`} className="block group">
        <div className="space-y-1.5">
          {/* Image — square on mobile, video on desktop */}
          <div className="relative">
            <ImageGallery
              images={images}
              alt={name}
              aspectRatio="square"
              carousel={false}
              className="rounded-xl"
            />
            {/* Wishlist heart */}
            <button
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-ink-secondary hover:text-red-500 transition-colors"
              onClick={(e) => { e.preventDefault(); }}
            >
              ♡
            </button>
            {/* Trending badge */}
            {p.is_trending && (
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-bold">
                🔥 Trending
              </div>
            )}
          </div>

          {/* Info — compact */}
          <div className="space-y-0.5">
            <div className="flex items-start justify-between gap-1">
              <h3 className="text-xs font-semibold text-ink-primary group-hover:text-accent-500 transition-colors line-clamp-2 leading-tight">
                {name}
              </h3>
              {p.rating ? (
                <RatingBadge rating={p.rating} size="sm" showCount={false} />
              ) : null}
            </div>
            <p className="text-[10px] text-ink-tertiary">
              {p.bedrooms ? `${p.bedrooms} bed` : 'Property'}
              {p.bathrooms ? ` · ${p.bathrooms} bath` : ''}
              {p.max_guests ? ` · ${p.max_guests} guests` : ''}
            </p>
            <PriceTag price={price} suffix="/night" size="sm" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Rental Detail Page (Airbnb-style) ───────────────────────────────────────

function RentalDetail({ property: p }: { property: RentalProperty }) {
  const images = (p.images?.length ? p.images : p.banner_url ? [getImageUrl(p.banner_url)] : []).filter(Boolean) as string[];
  const name = p.name || p.business_name || 'Property';
  const price = p.price_per_night || 85;

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <ImageGallery images={images} alt={name} aspectRatio="wide" carousel className="rounded-2xl" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title + Stats */}
            <div>
              <h1 className="text-2xl font-bold text-ink-primary mb-1">{name}</h1>
              <div className="flex items-center gap-3 text-sm text-ink-secondary">
                {p.rating && <RatingBadge rating={p.rating} reviewCount={12} />}
                {p.bedrooms && <span>{p.bedrooms} bedrooms</span>}
                {p.bathrooms && <span>· {p.bathrooms} bathrooms</span>}
                {p.max_guests && <span>· Up to {p.max_guests} guests</span>}
              </div>
            </div>

            {/* Description */}
            {p.description && (
              <div className="prose prose-sm max-w-none text-ink-secondary">
                <p>{p.description}</p>
              </div>
            )}

            {/* Amenities */}
            {p.amenities && p.amenities.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-ink-primary mb-3">What this place offers</h2>
                <div className="grid grid-cols-2 gap-2">
                  {p.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-ink-secondary py-2">
                      <span className="w-5 h-5 rounded-full bg-accent-500/10 text-accent-500 flex items-center justify-center text-xs">✓</span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews placeholder */}
            <div>
              <h2 className="text-lg font-bold text-ink-primary mb-3">Reviews</h2>
              <div className="bg-surface-secondary rounded-xl p-6 text-center">
                <p className="text-sm text-ink-tertiary">No reviews yet. Be the first to review this property.</p>
              </div>
            </div>
          </div>

          {/* Right: Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingWidget
                type="date-range"
                pricePerUnit={price}
                unitLabel="/night"
                rating={p.rating}
                reviewCount={12}
                urgency={{ type: 'scarcity', value: 'Booked 3 times this week' }}
                cancellationText="Free cancellation up to 48 hours before check-in"
                ctaLabel={`Reserve • From $${price}/night`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stays Hub Page ──────────────────────────────────────────────────────────

export default function StaysHubPage() {
  const [properties, setProperties] = useState<RentalProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  const config = getHubConfig('rentals');
  const subHubs = getRentalSubHubs();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const staysSubtypes = ['stays', 'vacation', 'airbnb', 'short_term'];
        const filtered = rawData
          .filter((s: any) => staysSubtypes.includes((s.subtype || '').toLowerCase()))
          .map((s: any) => ({
            id: s.store_id || s.id,
            store_id: s.store_id,
            name: s.name || s.business_name,
            business_name: s.business_name,
            description: s.description,
            logo_url: s.logo_url,
            banner_url: s.banner_url,
            branding_color: s.branding_color,
            category: s.category,
            subtype: s.subtype,
            slug: s.slug,
            rating: s.rating,
            is_trending: s.is_trending,
            price_per_night: s.price_per_night || 85 + Math.floor(Math.random() * 200),
            bedrooms: s.bedrooms || 1 + Math.floor(Math.random() * 4),
            bathrooms: s.bathrooms || 1 + Math.floor(Math.random() * 3),
            max_guests: s.max_guests || 2 + Math.floor(Math.random() * 6),
            amenities: s.amenities || ['WiFi', 'Kitchen', 'Air conditioning', 'Free parking'],
            images: s.images || [],
          }));
        setProperties(filtered);
      } catch (error) {
        console.error('Failed to fetch rental properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filters = ['All', 'Houses', 'Villas', 'Apartments', 'Beachfront', 'Pet Friendly', 'Pool'];
  const sortOptions = ['Popular', 'Price: Low', 'Price: High', 'Rating', 'Newest'];
  const [featuredProviders, setFeaturedProviders] = useState<any[]>([]);

  useEffect(() => {
    api.get('/search/featured?type=rentals&limit=10').then(res => {
      if (Array.isArray(res.data) && res.data.length > 0) setFeaturedProviders(res.data);
    }).catch(() => {});
  }, []);

  const filteredProperties = useMemo(() => {
    let result = properties;
    // TODO: Apply filter logic based on activeFilter
    return result;
  }, [properties, activeFilter]);

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Featured providers marquee */}
      <FeaturedMarquee providers={featuredProviders} hubType="rentals" />
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-800 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-black text-white mb-2"
          >
            🏖️ Vacation Stays
          </motion.h1>
          <p className="text-lg text-teal-200 mb-6">
            Find the perfect place to stay in St. Kitts & Nevis
          </p>

          {/* Sub-hub navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {subHubs.map((sub) => (
              <Link
                key={sub.categoryId}
                href={`/hub/rentals/${sub.categoryId}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sub.categoryId === 'stays'
                    ? 'bg-white text-teal-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {sub.pageTitle}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <FilterBar
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortOptions={sortOptions}
          activeSort={activeSort}
          onSortChange={setActiveSort}
        />
      </div>

      {/* Property Grid — 2-col mobile, 3-4 col desktop */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-square bg-surface-secondary rounded-xl animate-pulse" />
                <div className="h-3 bg-surface-secondary rounded animate-pulse w-3/4" />
                <div className="h-2.5 bg-surface-secondary rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <EmptyState
            emoji="🏠"
            title="No properties found"
            message="Try adjusting your filters or check back later for new listings."
            actionLabel="Clear Filters"
            onAction={() => setActiveFilter('All')}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProperties.map((property, i) => (
              <RentalCard key={property.store_id || property.id} property={property} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
