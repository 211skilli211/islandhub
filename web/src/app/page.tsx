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
import HeroBackground from '@/components/HeroBackground';
import RequestServicesSection from '@/components/RequestServicesSection';
import AdSpace from '@/components/advertising/AdSpace';
import IslandPulse from '@/components/IslandPulse';
import BrandMarquee from '@/components/BrandMarquee';
import { ProductCard, CarouselSection } from '@/components/hub/ListingCard';
import { HeroSlider, DealCard, CategoryTiles, ContentSection } from '@/components/hub/MarketplaceSections';
import { CompactCard } from '@/components/hub/CompactCard';
import FacebookGrid from '@/components/marketplace/FacebookGrid';
import NewArrivals from '@/components/marketplace/NewArrivals';

export default function Home() {
  const { user } = useAuthStore();

  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns(true);
  const { data: toursData, isLoading: toursLoading } = useListings({ category: 'tour', sub_category: 'culture,land,sea,rail,adventure,charter', featured: true, limit: 10 });
  const { data: rentalsData, isLoading: rentalsLoading } = useListings({ category: 'rental', sub_category: 'Apartment,Stays,Car,Boat,Yacht,Gear,Land,Sea', limit: 20 });
  const { data: shopsData, isLoading: shopsLoading } = useListings({ category: 'product', featured: true, limit: 8 });

  const [promoBanners, setPromoBanners] = useState<any[]>([]);

  useEffect(() => {
    api.get('/promotions/active?location=home_hero').then(res => setPromoBanners(res.data)).catch(() => {});
  }, []);

  const extractListings = (data: any) => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.listings || [];
  };

  const featuredCampaigns = useMemo(() => extractListings(campaignsData).slice(0, 4), [campaignsData]);
  const featuredTours = useMemo(() => extractListings(toursData).slice(0, 4), [toursData]);
  const featuredShops = useMemo(() => extractListings(shopsData), [shopsData]);

  const diverseFeaturedRentals = useMemo(() => {
    const all = extractListings(rentalsData);
    if (!all.length) return [];
    const diverse: any[] = [];
    const seen = new Set();
    all.forEach((r: any) => {
      const sub = r.sub_category?.toLowerCase() || '';
      if (!seen.has(sub) && diverse.length < 4) { diverse.push(r); seen.add(sub); }
    });
    if (diverse.length < 4) all.forEach((r: any) => { if (!diverse.find(d => d.id === r.id) && diverse.length < 4) diverse.push(r); });
    return diverse;
  }, [rentalsData]);

  const loading = campaignsLoading || toursLoading || rentalsLoading;

  // Hero slides from API or defaults
  const heroSlides = useMemo(() => {
    if (promoBanners?.length > 0) {
      return promoBanners.slice(0, 3).map((b: any) => ({
        id: b.id || Math.random().toString(),
        badge: b.badge,
        headline: b.headline || b.title,
        subheadline: b.subheadline || b.description,
        ctaText: b.cta_text || 'Shop Now',
        ctaHref: b.cta_link || b.link || '/hub',
        gradient: b.gradient || 'from-teal-700 via-cyan-800 to-teal-900',
      }));
    }
    return [
      { id: 's1', badge: 'IslandHub', headline: 'The Caribbean Commerce Hub', subheadline: 'Connected directly to local artisans, restaurants, and community causes. Support the islands with every purchase.', ctaText: 'Browse Marketplace', ctaHref: '/hub', gradient: 'from-teal-700 via-cyan-800 to-teal-900' },
      { id: 's2', headline: 'Discover Local Experiences', subheadline: 'From volcano treks to scenic railway journeys. Discover the best curated adventures across St. Kitts & Nevis.', ctaText: 'Explore Tours', ctaHref: '/hub/tours', gradient: 'from-emerald-700 via-teal-800 to-cyan-900' },
      { id: 's3', headline: 'Premium Island Living', subheadline: 'From luxury villas to high-performance vehicles and private yachts. Rent the best the islands have to offer.', ctaText: 'View Rentals', ctaHref: '/hub/rentals', gradient: 'from-amber-700 via-orange-800 to-amber-900' },
    ];
  }, [promoBanners]);

  const categoryTiles = [
    { id: 'food', label: 'Food & Dining', emoji: '🍽️', href: '/hub/food' },
    { id: 'products', label: 'Shopping', emoji: '🛍️', href: '/hub/products' },
    { id: 'services', label: 'Services', emoji: '🛠️', href: '/hub/services' },
    { id: 'rentals', label: 'Rentals', emoji: '🏠', href: '/hub/rentals' },
    { id: 'tours', label: 'Tours', emoji: '🗺️', href: '/hub/tours' },
    { id: 'transport', label: 'Transport', emoji: '🚕', href: '/hub/transport' },
    { id: 'events', label: 'Events', emoji: '🎫', href: '/hub/events' },
    { id: 'campaigns', label: 'Campaigns', emoji: '❤️', href: '/hub/campaigns' },
    { id: 'community', label: 'Community', emoji: '🌴', href: '/hub/community' },
  ];

  return (
    <main className="min-h-screen bg-surface-primary">

      {/* ═══ HERO — Admin-configurable via HeroBackground ═══ */}
      <HeroBackground pageKey="home" align="center">
        <div className="max-w-7xl mx-auto w-full">
          <HeroSlider slides={heroSlides} autoPlay autoPlayInterval={6000} className="mb-6 md:mb-8" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto relative mb-6">
            <SmartSearch />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-3">
            <Link href="/hub" className="px-5 py-2.5 bg-white text-teal-900 text-sm font-bold rounded-xl hover:bg-white/90 transition-colors">
              Browse Marketplace 🛒
            </Link>
            <Link href="/community" className="px-5 py-2.5 text-white text-sm font-bold rounded-xl border border-white/20 hover:bg-white/10 transition-colors">
              Join Community 🏝️
            </Link>
          </motion.div>
        </div>
      </HeroBackground>
      <BrandMarquee title="Trusted by leading Caribbean brands" speed={30} />

      {/* ═══ REQUEST SERVICES ═══ */}
      <RequestServicesSection />

      {/* ═══ SHOP BY CATEGORY TILES (3-col mobile) ═══ */}
      <AnimatedContent distance={50}>
        <section className="max-w-7xl mx-auto px-4 py-6">
          <CategoryTiles title="Shop by Category" tiles={categoryTiles} columns={3} />
        </section>
      </AnimatedContent>

      {/* ═══ TRENDING / FEATURED SHOPS (horizontal carousel) ═══ */}
      {!shopsLoading && featuredShops.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <CarouselSection title="🔥 Featured Shops" seeMoreHref="/hub/products">
            {featuredShops.map((shop: any) => (
              <div key={shop.id} className="shrink-0 w-[150px]">
                <ProductCard
                  id={shop.id}
                  name={shop.name || shop.business_name || 'Shop'}
                  slug={shop.slug}
                  imageUrl={shop.banner_url || shop.image_url}
                  emoji="🏪"
                  rating={shop.rating}
                  href={`/hub/products/shops/${shop.slug}`}
                  variant="store"
                />
              </div>
            ))}
          </CarouselSection>
        </section>
      )}

      {/* ═══ NEW ARRIVALS ═══ */}
      <NewArrivals />

      {/* ═══ HOT DEALS (2-col DealCard grid) ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <ContentSection title="🏷️ Hot Deals" seeMoreHref="/hub/products">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <DealCard emoji="📱" offerText="Save on electronics & gadgets" description="Latest phones, tablets, and accessories" ctaText="Shop now" ctaHref="/hub/products/shops" />
            <DealCard emoji="👗" offerText="Fashion & accessories sale" description="Caribbean style at up to 40% off" ctaText="Shop now" ctaHref="/hub/products/fashion" />
            <DealCard emoji="🏠" offerText="Vacation rental deals" description="Early booking discounts on island stays" ctaText="View deals" ctaHref="/hub/rentals/stays" />
            <DealCard emoji="🗺️" offerText="Tour bundle offers" description="Book 2 tours and save 15%" ctaText="Explore" ctaHref="/hub/tours" />
          </div>
        </ContentSection>
      </section>

      {/* ═══ FACEBOOK MARKETPLACE GRID ═══ */}
      <FacebookGrid title="Browse All Listings" seeMoreHref="/hub/products" />

      {/* ═══ BRAND MARQUEE ═══ */}
      <BrandMarquee title="Trusted by leading Caribbean brands" speed={40} />

      {/* ═══ FEATURED CAMPAIGNS (2-col mobile) ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <ContentSection title="❤️ Active Campaigns" seeMoreHref="/hub/campaigns">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-64 bg-surface-secondary rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {featuredCampaigns.map((campaign: any) => (
                <CompactCard
                  key={campaign.id}
                  href={`/hub/campaigns/community/${campaign.slug || campaign.id}`}
                  imageUrl={campaign.image_url}
                  emoji="❤️"
                  title={campaign.title || campaign.name}
                  subtitle={campaign.category || 'Campaign'}
                  badge={campaign.urgency}
                  badgeColor="bg-rose-500"
                  meta={[`$${campaign.current_amount || 0} of $${campaign.goal_amount || 0}`].filter(Boolean)}
                  ctaLabel="Contribute"
                />
              ))}
            </div>
          )}
        </ContentSection>
      </section>

      {/* ═══ SIGNATURE EXPERIENCES / TOURS (2-col mobile) ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-6 bg-surface-secondary/50">
        <ContentSection title="🗺️ Signature Experiences" seeMoreHref="/hub/tours">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-64 bg-surface-secondary rounded-xl animate-pulse" />)}
            </div>
          ) : featuredTours.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {featuredTours.map((tour: any) => (
                <CompactCard
                  key={tour.id}
                  href={`/hub/tours/land/${tour.slug || tour.id}`}
                  imageUrl={tour.image_url || tour.banner_url}
                  emoji="🗺️"
                  title={tour.title || tour.name || tour.business_name}
                  subtitle={[tour.duration, tour.difficulty].filter(Boolean).join(' · ')}
                  price={tour.price}
                  priceSuffix="/person"
                  rating={tour.rating}
                  ctaLabel="Book Now"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface-elevated rounded-2xl border-2 border-dashed border-border-primary">
              <p className="text-ink-tertiary italic">Premium experiences coming soon.</p>
            </div>
          )}
        </ContentSection>
      </section>

      {/* ═══ ISLAND RENTALS (2-col mobile, compact cards) ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <ContentSection title="🏠 Island Rentals" subtitle="From villas, cars, to boats" seeMoreHref="/hub/rentals">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {diverseFeaturedRentals.map((item: any) => (
              <motion.div key={item.id} whileHover={{ y: -4 }}>
                <Link href={`/hub/rentals/stays/${item.slug || item.id}`} className="block group">
                  <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 transition-all">
                    <div className="relative aspect-square bg-surface-secondary">
                      <img
                        src={getImageUrl((Array.isArray(item.photos) && item.photos[0]) ? item.photos[0] : (Array.isArray(item.images) && item.images[0]) ? item.images[0] : item.image_url || '/assets/placeholder-listing.png')}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg">
                        <span className="text-xs font-bold text-ink-primary">${item.price}</span>
                        <span className="text-[9px] text-ink-tertiary ml-0.5">
                          {item.sub_category === 'stays' ? '/night' : item.sub_category === 'car' ? '/day' : item.sub_category === 'boat' || item.sub_category === 'sea' ? '/trip' : '/day'}
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <h3 className="text-xs font-bold text-ink-primary group-hover:text-accent-500 line-clamp-2 leading-tight">{item.title}</h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </ContentSection>
      </section>

      {/* ═══ IBT SOLUTIONS (compact 2-col cards) ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <ContentSection title="💼 Business Solutions" subtitle="AI, web, automation & co-ops" seeMoreHref="/hub/services">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '🤖', title: 'AI Employees', desc: '24/7 digital workforce', href: '/hub/services/professional' },
              { icon: '💻', title: 'Web & App Design', desc: 'Custom development', href: '/hub/services/professional' },
              { icon: '⚙️', title: 'Automation', desc: 'Streamline operations', href: '/hub/services/professional' },
              { icon: '🤝', title: 'Co-ops', desc: 'Join the federation', href: '/store/ibt-solutions/coops' },
            ].map((item) => (
              <Link key={item.title} href={item.href} className="group bg-surface-elevated rounded-xl border border-border-primary p-4 text-center hover:border-accent-500/30 transition-all">
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{item.icon}</span>
                <h4 className="text-xs font-bold text-ink-primary mb-0.5">{item.title}</h4>
                <p className="text-[9px] text-ink-tertiary uppercase tracking-wider">{item.desc}</p>
              </Link>
            ))}
          </div>
        </ContentSection>
      </section>

      {/* ═══ VENDOR SPOTLIGHT ═══ */}
      <section className="py-6 bg-surface-secondary/50">
        <VendorSpotlight />
      </section>

      {/* ═══ RECOMMENDED FOR YOU ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <RecommendedForYou />
      </section>

      {/* ═══ ISLAND PULSE ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <IslandPulse />
      </section>

      {/* ═══ BACK TO TOP ═══ */}
      <div className="max-w-7xl mx-auto px-4 pb-8 text-center">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xs text-ink-tertiary hover:text-accent-500 transition-colors">
          ↑ Back to top
        </button>
      </div>
    </main>
  );
}
