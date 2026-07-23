'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import { useCampaigns, useListings } from '@/lib/hooks/use-swr';
import { useAuthStore } from '@/lib/auth';

// Dynamic imports for heavy components
import { 
  SmartSearch, 
  HeroBackground, 
  HeroSlider,
  RecommendedForYou,
  VendorSpotlight,
  IslandPulse,
  BrandMarquee,
  RequestServicesSection,
  AdSpace
} from '@/lib/dynamic-imports';

import { ProductCard, CarouselSection } from '@/components/hub/ListingCard';
import { DealCard, DynamicCategoryTiles, ContentSection } from '@/components/hub/MarketplaceSections';
import { CompactCard } from '@/components/hub/CompactCard';
import Aurora from '@/components/react-bits/backgrounds/Aurora';
import AnimatedContent from '@/components/react-bits/animations/AnimatedContent';
import BlurText from '@/components/react-bits/text/BlurText';
import { Bot, Code, Zap, Users, TrendingUp, ShoppingBag, Home as HomeIcon, MapPin, Heart, MessageCircle, Monitor, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

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

  // Hero slides from API or defaults - using DESIGN.md tokens
  const heroSlides = useMemo(() => {
    if (promoBanners?.length > 0) {
      return promoBanners.slice(0, 3).map((b: any) => ({
        id: b.id || Math.random().toString(),
        badge: b.badge,
        headline: b.headline || b.title,
        subheadline: b.subheadline || b.description,
        ctaText: b.cta_text || 'Shop Now',
        ctaHref: b.cta_link || b.link || '/hub',
        gradient: b.gradient || 'from-[var(--ocean-700)] via-[var(--ocean-800)] to-[var(--ocean-900)]',
      }));
    }
    return [
      { id: 's1', badge: 'IslandHub', headline: 'The Caribbean Commerce Hub', subheadline: 'Connected directly to local artisans, restaurants, and community causes. Support the islands with every purchase.', ctaText: 'Browse Marketplace', ctaHref: '/hub', gradient: 'from-[var(--ocean-700)] via-[var(--ocean-800)] to-[var(--ocean-900)]' },
      { id: 's2', headline: 'Discover Local Experiences', subheadline: 'From volcano treks to scenic railway journeys. Discover the best curated adventures across St. Kitts & Nevis.', ctaText: 'Explore Tours', ctaHref: '/hub/tours', gradient: 'from-[var(--emerald-700)] via-[var(--ocean-800)] to-[var(--ocean-900)]' },
      { id: 's3', headline: 'Premium Island Living', subheadline: 'From luxury villas to high-performance vehicles and private yachts. Rent the best the islands have to offer.', ctaText: 'View Rentals', ctaHref: '/hub/rentals', gradient: 'from-[var(--amber-700)] via-[var(--orange-800)] to-[var(--amber-900)]' },
    ];
  }, [promoBanners]);

  return (
    <main className="min-h-screen bg-surface-primary">

      <HeroBackground pageKey="home" align="center">
        <div className="max-w-7xl mx-auto w-full">
          <HeroSlider slides={heroSlides} autoPlay autoPlayInterval={6000} className="mb-6 md:mb-8" />
          <motion.div 
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }} 
            animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }} 
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }} 
            className="max-w-3xl mx-auto relative mb-6">
            <SmartSearch />
          </motion.div>
          <motion.div 
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }} 
            animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }} 
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.3 }} 
            className="flex flex-wrap justify-center gap-3">
            <Link href="/hub" className="px-5 py-2.5 bg-white text-[var(--ocean-900)] text-sm font-bold rounded-xl hover:bg-white/90 transition-colors">
              Browse Marketplace 🛒
            </Link>
            <Link href="/community" className="px-5 py-2.5 text-white text-sm font-bold rounded-xl border border-white/20 hover:bg-white/10 transition-colors">
              Join Community 🏝️
            </Link>
          </motion.div>
        </div>
      </HeroBackground>
      <BrandMarquee title="Trusted by leading Caribbean brands" speed={30} />

      <RequestServicesSection />

      <AnimatedContent distance={50}>
        <section className="max-w-7xl mx-auto px-4 py-6">
          <DynamicCategoryTiles title="Shop by Category" columns={3} />
        </section>
      </AnimatedContent>

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

      <BrandMarquee title="Trusted by leading Caribbean brands" speed={40} />

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

      <BrandMarquee title="Trusted by leading Caribbean brands" speed={40} />

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
                  subtitle={[tour.duration, tour.difficulty].filter(Boolean).join(' . ')}
                  price={tour.price}
                  priceSuffix="/person"
                  rating={tour.rating}
                  ctaLabel="Book Now"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-64 bg-surface-secondary rounded-xl animate-pulse" />)}
            </div>
          )}
        </ContentSection>
      </section>

      <BrandMarquee title="Trusted by leading Caribbean brands" speed={40} />

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

      <section className="max-w-7xl mx-auto px-4 py-6 bg-surface-secondary/50">
        <ContentSection title="🏷️ Hot Deals" seeMoreHref="/hub/products">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <DealCard emoji="📱" offerText="Save on electronics & gadgets" description="Latest phones, tablets, and accessories" ctaText="Shop now" ctaHref="/hub/products/shops" />
            <DealCard emoji="👗" offerText="Fashion & accessories sale" description="Caribbean style at up to 40% off" ctaText="Shop now" ctaHref="/hub/products/fashion" />
            <DealCard emoji="🏠" offerText="Vacation rental deals" description="Early booking discounts on island stays" ctaText="View deals" ctaHref="/hub/rentals/stays" />
            <DealCard emoji="🗺️" offerText="Tour bundle offers" description="Book 2 tours and save 15%" ctaText="Explore" ctaHref="/hub/tours" />
          </div>
        </ContentSection>
      </section>
    </main>
  );
}