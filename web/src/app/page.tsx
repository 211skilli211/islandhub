'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import SmartSearch from '@/components/search/SmartSearch';
import { useCampaigns, useListings } from '@/lib/hooks/use-swr';
import { useAuthStore } from '@/lib/auth';
import RecommendedForYou from '@/components/recommendations/RecommendedForYou';
import VendorSpotlight from '@/components/marketplace/VendorSpotlight';
import ListingCard from '@/components/ListingCard';
import HeroBackground from '@/components/HeroBackground';
import RequestServicesSection from '@/components/RequestServicesSection';
import AdSpace from '@/components/advertising/AdSpace';
import IslandPulse from '@/components/IslandPulse';
import BrandMarquee from '@/components/BrandMarquee';
// Theme-aware classes helper
import {
  getBgClass,
  getTextClass,
  getBorderClass,
  getCardBaseClasses,
  getButtonClasses,
  getLinkClasses,
  getShadowClass,
  cnTheme
} from '@/lib/theme-helpers';

export default function Home() {
  const { user } = useAuthStore();


  // --- SWR Hooks for Data Fetching with Caching & Deduplication ---
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns(true); // featured=true

  // Signature Experiences (Tours)
  const { data: toursData, isLoading: toursLoading } = useListings({
    category: 'tour',
    sub_category: 'culture,land,sea,rail,adventure,charter',
    featured: true,
    limit: 10
  });

  // Diverse Rentals (Excluding Tools & Equipment)
  const { data: rentalsData, isLoading: rentalsLoading } = useListings({
    category: 'rental',
    sub_category: 'Apartment,Stays,Car,Boat,Yacht,Gear,Land,Sea', // Multiple subcategories supported now
    featured: true,
    limit: 12
  });

  // Note: Promo Banners and Home Sections would ideally have their own SWR hooks.
  // For now, keeping them in a useEffect until their hooks are created.
  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [homeSections, setHomeSections] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const [bannersRes, homeSectionsRes] = await Promise.all([
          api.get('/promotions/active?location=home_hero'),
          api.get('/homepage')
        ]);
        setPromoBanners(bannersRes.data);
        setHomeSections(homeSectionsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch additional home data', error);
      }
    };
    fetchAdditionalData();
  }, []);


  // Helper to extract listings array from API response (handles both { listings: [] } and [] formats)
  const extractListings = (data: any) => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.listings || [];
  };

  // --- Memoized Calculations ---
  const featuredCampaigns = useMemo(() => {
    const data = extractListings(campaignsData);
    return data.slice(0, 3);
  }, [campaignsData]);

  const featuredTours = useMemo(() => {
    const data = extractListings(toursData);
    return data.slice(0, 3);
  }, [toursData]);

  const diverseFeaturedRentals = useMemo(() => {
    const allRentals = extractListings(rentalsData);
    if (allRentals.length === 0) return [];

    // Prioritize variety: Try to get one of each sub_category first
    const types = ['Apartment', 'Stays', 'Car', 'Boat', 'Yacht', 'Land', 'Sea', 'Gear'];
    const diverse: any[] = [];
    const seenTypes = new Set();

    // 1. First pass: Unique types
    allRentals.forEach((r: any) => {
      const subCat = r.sub_category?.toLowerCase() || '';
      if (!seenTypes.has(subCat) && diverse.length < 3) {
        diverse.push(r);
        seenTypes.add(subCat);
      }
    });

    // 2. Second pass: Fill up to 3 with whatever is available
    if (diverse.length < 3) {
      allRentals.forEach((r: any) => {
        if (!diverse.find(d => d.id === r.id) && diverse.length < 3) {
          diverse.push(r);
        }
      });
    }

    return diverse;
  }, [rentalsData]);

  const loading = useMemo(() => {
    return campaignsLoading || toursLoading || rentalsLoading;
  }, [campaignsLoading, toursLoading, rentalsLoading]);



  return (
    <main className={cnTheme('min-h-screen theme-transition', getBgClass('primary'))}>
      <HeroBackground
        pageKey="home"
        align="center"
      >
        <section className="relative py-16 md:py-40 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              🏝 Welcome to the Heart of the Islands
            </motion.div>

            {/* Dynamic Ad Space (Site-wide Banners) */}
            <AdSpace
              spaceName="homepage_hero"
              className="max-w-4xl mx-auto mb-12 h-20 md:h-24"
              autoRotate={true}
            />

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-8xl font-black text-white mb-6 md:mb-8 tracking-tighter leading-[0.95] md:leading-[0.9]"
            >
              The Caribbean <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-300 via-emerald-400 to-teal-200">Commerce Hub</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-teal-50 text-lg md:text-xl max-w-2xl mx-auto mb-16 font-medium leading-relaxed opacity-80"
            >
              Connected directly to local artisans, restaurants, and community causes.
              Support the islands with every purchase.
            </motion.p>

            {/* Smart Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl mx-auto relative group mb-12"
            >
              <SmartSearch />
            </motion.div>

            {/* Quick Landing Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link href="/listings" className={cnTheme(getButtonClasses('primary'))}>
                Browse Marketplace 🛒
              </Link>
              <Link href="/community" className={cnTheme(getButtonClasses('outline'), 'text-white border-white/20 hover:bg-white/10')}>
                Join Community 🏝
              </Link>
            </motion.div>
          </div>
        </section>
      </HeroBackground>


      {/* Request Services Section - Taxi, Food, Delivery */}
      <RequestServicesSection />

      {/* Interstitial Ad Space */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <AdSpace
          spaceName="homepage_interstitial"
          className="h-32 md:h-48 rounded-4xl overflow-hidden border-4 border-white shadow-2xl"
        />
      </div>

      {/* Marketplace Section - Using theme-aware classes */}
      <section className={cnTheme('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 theme-transition', getBgClass('secondary'))}>
        <div className={cnTheme(getCardBaseClasses(false), 'p-8 md:p-24 rounded-[3rem] md:rounded-[4rem] relative overflow-hidden group', getShadowClass('lg'))}>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-500/10 transition-colors duration-1000" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 bg-(--accent-primary)/10 text-(--accent-primary) rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                🛍️ The Island Market
              </div>
              <h2 className={cnTheme('text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-tight italic', getTextClass('primary'))}>
                The ultimate hub for <br />
                <span className="text-(--accent-primary)">Local Commerce.</span>
              </h2>
              <p className={cnTheme('text-xl mb-12 leading-relaxed italic', getTextClass('secondary'))}>
                From fresh island produce to boutique fashion and professional services. Explore the best of what our community has to offer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/listings" className={cnTheme(getButtonClasses('primary'), 'text-center')}>
                  Enter Marketplace
                </Link>
                <Link href="/become-vendor" className={cnTheme(getButtonClasses('outline'), getBorderClass('primary'))}>
                  Open Your Store/Host
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Fresh Food', count: '45+', icon: '🍴', href: '/stores?category=food' },
                { label: 'Local Brands/Hosts', count: '120+', icon: '📦', href: '/stores?category=product' },
                { label: 'Rentals', count: '30+', icon: '🏠', href: '/rental-hub' },
                { label: 'Services', count: '80+', icon: '🛠️', href: '/stores?category=service' }
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cnTheme(
                    getCardBaseClasses(true),
                    'hover:shadow-xl hover:-translate-y-2',
                    getBorderClass('primary'),
                    'hover:border-(--accent-primary)/30',
                    'theme-transition group/tile'
                  )}
                >
                  <span className="text-3xl mb-4 block group-hover/tile:scale-110 transition-transform">{item.icon}</span>
                  <h4 className={cnTheme('text-2xl font-black leading-none mb-1', getTextClass('primary'))}>{item.count}</h4>
                  <p className={cnTheme('text-[10px] font-black uppercase tracking-widest theme-transition', getTextClass('tertiary'), 'group-hover/tile:text-(--accent-primary)')}>{item.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className={cnTheme('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 theme-transition', getBorderClass('primary'))}>
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">❤️</span>
              <h2 className={cnTheme('text-4xl md:text-5xl font-black tracking-tight', getTextClass('primary'))}>Active Campaigns</h2>
            </div>
            <p className={cnTheme('font-medium max-w-xl', getTextClass('secondary'))}>
              Be part of something bigger. Support community-led projects that are making a real difference across the islands.
            </p>
          </div>
          <Link href="/campaigns" className={cnTheme(getButtonClasses('primary'))}>
            View All Campaigns <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className={cnTheme('h-96 animate-pulse rounded-[2.5rem]', getBgClass('secondary'), getBorderClass('primary'))} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredCampaigns.map((campaign: any, idx: number) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <ListingCard listing={campaign} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <IslandPulse />
          </div>
        </div>
      </section>

      {/* Signature Experiences (Tours) */}
      <section className={cnTheme('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 theme-transition', getBorderClass('primary'), getBgClass('secondary'))}>
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🗺️</span>
              <h2 className={cnTheme('text-4xl md:text-5xl font-black tracking-tight', getTextClass('primary'))}>Signature Experiences</h2>
            </div>
            <p className={cnTheme('font-medium max-w-xl', getTextClass('secondary'))}>
              From volcano treks to scenic railway journeys. Discover the best curated adventures across St. Kitts & Nevis.
            </p>
          </div>
          <Link href="/tours" className={cnTheme(getButtonClasses('primary'), 'bg-orange-600 hover:bg-orange-700')}>
            Explore All Tours <span>→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={cnTheme('h-96 animate-pulse rounded-[2.5rem]', getBgClass('primary'), getBorderClass('primary'))} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredTours.length > 0 ? (
              featuredTours.map((tour: any, idx: number) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ListingCard listing={tour} />
                </motion.div>
              ))
            ) : (
              <div className={cnTheme('col-span-3 py-20 text-center rounded-[3rem] border-2 border-dashed', getBorderClass('primary'), getBgClass('primary'))}>
                <p className={cnTheme('italic', getTextClass('tertiary'))}>
                  Premium experiences coming soon to this section.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Brand Marquee - Featured Brands */}
      <BrandMarquee type="brand" />

      {/* Island Rentals Section */}
      <section className={cnTheme('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-32 theme-transition', getBorderClass('primary'))}>
        <div className="relative mb-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10">
            <div>
              <div className={cnTheme('inline-flex items-center gap-3 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6', getBgClass('tertiary'), getTextClass('primary'))}>
                🏝️ Premium Experiences
              </div>
              <h2 className={cnTheme('text-4xl md:text-7xl font-black tracking-tighter leading-none mb-6 italic', getTextClass('primary'))}>
                Your Island <br />
                <span className={cnTheme('font-medium tracking-normal not-italic', getTextClass('primary'))}>Journey Starts Here</span>
              </h2>
              <p className={cnTheme('text-xl font-medium max-w-xl leading-relaxed', getTextClass('secondary'))}>
                From luxury villas to high-performance vehicles and private yachts. Rent the best the islands have to offer.
              </p>
            </div>
            <Link href="/rentals" className={cnTheme(getButtonClasses('primary'), 'bg-blue-600 hover:bg-blue-700 flex items-center gap-3')}>
              View All Rentals <span className="text-xl">→</span>
            </Link>
          </div>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {diverseFeaturedRentals.map((item: any) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -10 }}
              className={cnTheme(
                getCardBaseClasses(false),
                'overflow-hidden flex flex-col group',
                getShadowClass('lg'),
                'theme-transition'
              )}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={getImageUrl(
                    (Array.isArray(item.photos) && item.photos.length > 0) ? item.photos[0] :
                      (Array.isArray(item.images) && item.images.length > 0) ? item.images[0] :
                        item.image_url || item.image || '/assets/placeholder-listing.png'
                  )}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={item.title}
                />
                <div className={cnTheme('absolute top-4 right-4 backdrop-blur px-4 py-2 rounded-2xl font-black shadow-xl', getBgClass('primary'), getTextClass('primary'))}>
                  <p className={cnTheme('text-[10px] uppercase tracking-widest opacity-60 leading-none mb-1', getTextClass('tertiary'))}>From</p>
                  <p className="text-xl leading-none italic">${item.price}<span className={cnTheme('text-[10px] font-bold not-italic ml-1', getTextClass('tertiary'))}>
                    {item.sub_category === 'stays' ? '/night' : item.sub_category === 'land' ? '/day' : '/trip'}
                  </span></p>
                </div>
              </div>
              <div className={cnTheme('p-8 pb-10 flex-1 flex flex-col items-center text-center theme-transition', getBgClass('primary'))}>
                <h3 className={cnTheme('text-2xl font-black mb-6 tracking-tight italic uppercase', getTextClass('primary'))}>{item.title}</h3>
                <Link
                  href={`/listings/${item.id}`}
                  className={cnTheme(getButtonClasses('primary'), 'w-full')}
                >
                  Book Now ➔
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vendor Spotlight */}
      <section className={cnTheme('py-12 theme-transition', getBgClass('secondary'))}>
        <VendorSpotlight />
      </section>

      {/* Subscription Teaser Section */}
      <section className={cnTheme('py-24 relative overflow-hidden theme-transition', getBgClass('primary'))}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={cnTheme('inline-block px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6', getBgClass('tertiary'), getTextClass('primary'))}
            >
              ⭐ Elevate Your Experience
            </motion.div>
            <h2 className={cnTheme('text-4xl md:text-6xl font-black mb-6 tracking-tight italic', getTextClass('primary'))}>
              Exclusive <span className="text-(--accent-primary)">Island Tiers</span>
            </h2>
            <p className={cnTheme('font-medium max-w-2xl mx-auto text-lg leading-relaxed', getTextClass('secondary'))}>
              Unlock the full potential of IslandHub with our premium memberships.
              Higher rewards, lower fees, and elite visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* VIP Customer Teaser */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={cnTheme(
                'group relative p-12 rounded-[3.5rem] overflow-hidden theme-transition',
                getBgClass('secondary')
              )}
              style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.1) 100%)'
              }}
            >
              <div className="relative z-10">
                <span className="text-5xl mb-8 block">✨</span>
                <h3 className={cnTheme('text-3xl font-black mb-4 tracking-tight', getTextClass('primary'))}>Island VIP Customer</h3>
                <p className={cnTheme('mb-8 leading-relaxed', getTextClass('secondary'))}>
                  Join the elite shoppers. Get 10% OFF every order, double reward points, and early access to limited edition island products.
                </p>
                <div className="flex items-center gap-2 mb-10">
                  <span className={cnTheme('text-4xl font-black', getTextClass('primary'))}>$15</span>
                  <span className={cnTheme('font-bold uppercase tracking-widest text-[10px]', getTextClass('tertiary'))}>/ month</span>
                </div>
                <Link href="/pricing" className={cnTheme(getButtonClasses('primary'), 'bg-amber-500 hover:bg-amber-600 inline-flex items-center gap-3')}>
                  Claim VIP Status <span>→</span>
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full group-hover:bg-amber-500/10 transition-colors" />
            </motion.div>

            {/* Premium Vendor Teaser */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={cnTheme(
                'group relative p-12 rounded-[3.5rem] overflow-hidden theme-transition',
                getBgClass('secondary')
              )}
              style={{
                background: 'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(5,150,105,0.1) 100%)'
              }}
            >
              <div className="relative z-10">
                <span className="text-5xl mb-8 block">🛡️</span>
                <h3 className={cnTheme('text-3xl font-black mb-4 tracking-tight', getTextClass('primary'))}>Premium Vendor</h3>
                <p className={cnTheme('mb-8 leading-relaxed', getTextClass('secondary'))}>
                  Scale your business with advanced analytics, custom branding, lower commission rates, and featured storefront visibility.
                </p>
                <div className="flex items-center gap-2 mb-10">
                  <span className={cnTheme('text-4xl font-black', getTextClass('primary'))}>$99</span>
                  <span className={cnTheme('font-bold uppercase tracking-widest text-[10px]', getTextClass('tertiary'))}>/ month</span>
                </div>
                <Link href="/pricing" className={cnTheme(getButtonClasses('primary'), 'inline-flex items-center gap-3')}>
                  Upgrade Business <span>→</span>
                </Link>
              </div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full group-hover:bg-teal-500/10 transition-colors" />
            </motion.div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/pricing" className={cnTheme(getLinkClasses('secondary'), 'flex items-center justify-center gap-2')}>
              View all available tiers and feature comparison <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Site Sections (Dynamic) */}
      {homeSections.filter(s => s.section_type === 'homepage').map((section, idx) => (
        <section key={section.id || idx} className={cnTheme('py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 theme-transition', getBgClass('primary'))}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cnTheme('bg-linear-to-br rounded-[3rem] p-12 md:p-24 relative overflow-hidden theme-transition', getBgClass('secondary'))}
            style={{
              background: `linear-gradient(135deg, ${section.style_config?.from || 'var(--accent-primary)'}, ${section.style_config?.to || 'var(--success-primary)'})`
            }}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className={cnTheme('text-4xl md:text-6xl font-black mb-10 tracking-tighter leading-none italic uppercase', getTextClass('inverse'))}>
                  {section.title}
                </h2>
                <p className={cnTheme('text-lg md:text-xl font-medium mb-12 leading-relaxed', getTextClass('inverse'), 'opacity-80')}>
                  {section.body}
                </p>

                {/* Custom List Items if present */}
                {section.list_items && section.list_items.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                    {section.list_items.map((item: any, i: number) => (
                      <div key={i} className="flex gap-4">
                        <div className="text-2xl">{item.icon}</div>
                        <div>
                          <p className={cnTheme('font-black text-white text-lg', getTextClass('inverse'))}>{item.title}</p>
                          <p className={cnTheme('text-xs font-bold uppercase tracking-widest', getTextClass('inverse'), 'opacity-60')}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.cta_text && (
                  <Link href={section.cta_link || '#'} className="inline-flex items-center justify-center px-6 py-3 font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 theme-transition shadow-2xl bg-white text-(--accent-primary) hover:bg-gray-50 focus:ring-(--accent-primary)">
                    {section.cta_text}
                  </Link>
                )}
              </div>
              {section.image_url && (
                <div className={cnTheme('relative aspect-square md:aspect-auto md:h-[500px] rounded-[3rem] overflow-hidden border-8 shadow-2xl group', getBorderClass('primary'))}>
                  <img src={getImageUrl(section.image_url)} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt="" />
                </div>
              )}
            </div>
          </motion.div>
        </section>
      ))}

      {/* Final CTA */}
      <section className={cnTheme('py-24 text-center theme-transition', getBgClass('primary'))}>
        <h2 className={cnTheme('text-4xl font-black mb-6 tracking-tight', getTextClass('primary'))}>Ready to join the movement?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link href="/register" className={getButtonClasses('primary')}>
            Become a Vendor/Host
          </Link>
          <Link href="/register" className={cnTheme(getButtonClasses('outline'), getBorderClass('primary'))}>
            Create an Account
          </Link>
        </div>
      </section>
    </main>
  );
}
