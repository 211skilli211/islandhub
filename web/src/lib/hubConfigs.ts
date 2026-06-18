import type { HubPageConfig } from '@/components/hub/HubComponents';

export const HUB_CONFIGS: Record<string, HubPageConfig> = {
    food: {
        type: 'food',
        slug: 'food',
        pageKey: 'food-stores',
        fallbackTitle: 'Island Flavors',
        heroSubtitle: '🍳 Fresh kitchens - 🍽️ Top restaurants - ☕ Cozy cafés',
        heroEmoji: '🍽️🍜☕',
        heroStats: { label: 'Places', emoji: '🌴' },
        categories: [
            { id: 'all', title: 'All', icon: '🍽️', desc: '', subtypes: [] },
            { id: 'kitchen', title: 'Kitchens', icon: '🍳', desc: 'Home-cooked & cloud kitchens', subtypes: ['kitchen', 'cloud_kitchen', 'home_cooking'] },
            { id: 'restaurant', title: 'Restaurants', icon: '🍽️', desc: 'Full-service dining', subtypes: ['restaurant', 'dining', 'fine_dining'] },
            { id: 'cafe', title: 'Cafés', icon: '☕', desc: 'Coffee, pastries & light bites', subtypes: ['cafe', 'coffee', 'bakery', 'pastry'] },
            { id: 'grill', title: 'Grills & Bars', icon: '🍺', desc: 'BBQ, grills & nightlife', subtypes: ['grill', 'bar', 'bbq', 'nightlife', 'pub'] },
        ],
        theme: {
            primary: 'orange',
            gradient: 'from-orange-500 to-red-500',
            lightBg: 'bg-orange-50 dark:bg-orange-900/20',
            lightText: 'text-orange-600 dark:text-orange-400',
            border: 'border-orange-100 dark:border-orange-900/30',
            ring: 'ring-orange-200 dark:ring-orange-800',
            accentBg: 'bg-orange-500',
        },
        storeCardVariant: 'food',
        ctaTitle: 'Own a Kitchen or Restaurant?',
        ctaSubtitle: "Join IslandHub's food court 🍴 and serve thousands of hungry customers across the Caribbean!",
        ctaEmoji: '🍳',
        searchPlaceholder: '🍽️ Search kitchens, restaurants, cafés...',
    },

    products: {
        type: 'products',
        slug: 'products',
        pageKey: 'product-stores',
        fallbackTitle: 'Island Marketplace',
        heroSubtitle: '🛍️ Local crafts - 🎨 Artisan goods - 🌿 Natural products',
        heroEmoji: '🛍️🎨🌿',
        heroStats: { label: 'Shops', emoji: '🌴' },
        categories: [
            { id: 'all', title: 'All', icon: '🛍️', desc: '', subtypes: [] },
            { id: 'shop', title: 'Shops', icon: '🏪', desc: 'General retail stores', subtypes: ['shop', 'retail', 'general'] },
            { id: 'specialty', title: 'Specialty', icon: '🎨', desc: 'Artisan & specialty goods', subtypes: ['specialty_food', 'artisan', 'craft', 'handmade'] },
            { id: 'fashion', title: 'Fashion', icon: '👗', desc: 'Clothing, shoes & accessories', subtypes: ['fashion', 'clothing', 'shoes', 'accessories'] },
            { id: 'health', title: 'Health', icon: '💊', desc: 'Health, wellness & beauty', subtypes: ['health_beauty', 'wellness', 'supplements'] },
        ],
        theme: {
            primary: 'emerald',
            gradient: 'from-emerald-500 to-teal-500',
            lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
            lightText: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-100 dark:border-emerald-900/30',
            ring: 'ring-emerald-200 dark:ring-emerald-800',
            accentBg: 'bg-emerald-500',
        },
        storeCardVariant: 'product',
        ctaTitle: 'Sell Your Products',
        ctaSubtitle: 'Join IslandHub marketplace and reach thousands of customers across the Caribbean!',
        ctaEmoji: '🛍️',
        searchPlaceholder: '🛍️ Search products, shops, brands...',
    },

    services: {
        type: 'services',
        slug: 'services',
        pageKey: 'service-stores',
        fallbackTitle: 'Island Services',
        heroSubtitle: '🛠️ Professional - 🚗 Automotive - 💆 Health & Beauty',
        heroEmoji: '🛠️💼🚗',
        heroStats: { label: 'Providers', emoji: '🌴' },
        categories: [
            { id: 'all', title: 'All', icon: '🛠️', desc: '', subtypes: [] },
            { id: 'professional', title: 'Professional', icon: '💼', desc: 'Legal, consulting & business', subtypes: ['professional_services', 'legal', 'consulting', 'accounting'] },
            { id: 'automotive', title: 'Automotive', icon: '🚗', desc: 'Repair, detailing & maintenance', subtypes: ['automotive', 'car_repair', 'detailing'] },
            { id: 'health', title: 'Health & Beauty', icon: '💆', desc: 'Spa, wellness & personal care', subtypes: ['health_beauty', 'spa', 'wellness', 'salon'] },
            { id: 'marine', title: 'Marine', icon: '⚓', desc: 'Boat services & water activities', subtypes: ['marine', 'boat_service', 'diving'] },
            { id: 'events', title: 'Events', icon: '🎉', desc: 'Planning, catering & entertainment', subtypes: ['event_services', 'catering', 'entertainment', 'planning'] },
        ],
        theme: {
            primary: 'blue',
            gradient: 'from-blue-500 to-indigo-500',
            lightBg: 'bg-blue-50 dark:bg-blue-900/20',
            lightText: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-100 dark:border-blue-900/30',
            ring: 'ring-blue-200 dark:ring-blue-800',
            accentBg: 'bg-blue-500',
        },
        storeCardVariant: 'service',
        ctaTitle: 'Offer Your Services',
        ctaSubtitle: 'Join IslandHub and connect with customers looking for your expertise!',
        ctaEmoji: '🛠️',
        searchPlaceholder: '🛠️ Search services, providers...',
    },

    tours: {
        type: 'tours',
        slug: 'tours',
        pageKey: 'tour-hub',
        fallbackTitle: 'Island Adventures',
        heroSubtitle: '🥾 Land tours - 🌊 Sea adventures - 🧗 Extreme fun',
        heroEmoji: '🗺️🥾🌊',
        heroStats: { label: 'Tours', emoji: '🌴' },
        categories: [
            { id: 'all', title: 'All', icon: '🗺️', desc: '', subtypes: [] },
            { id: 'land', title: 'Land Tours', icon: '🥾', desc: 'Hiking, history & nature', subtypes: ['land', 'hiking', 'history', 'nature', 'culture'] },
            { id: 'sea', title: 'Sea & Water', icon: '🌊', desc: 'Snorkeling, sailing & fishing', subtypes: ['sea', 'snorkeling', 'sailing', 'fishing', 'diving'] },
            { id: 'adventure', title: 'Adventure', icon: '🧗', desc: 'Zip-lining, ATV & extreme', subtypes: ['adventure', 'zipline', 'atv', 'extreme'] },
            { id: 'charter', title: 'Charters', icon: '⛵', desc: 'Private boat & yacht charters', subtypes: ['charter', 'yacht', 'private_boat'] },
        ],
        theme: {
            primary: 'emerald',
            gradient: 'from-emerald-500 to-green-500',
            lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
            lightText: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-100 dark:border-emerald-900/30',
            ring: 'ring-emerald-200 dark:ring-emerald-800',
            accentBg: 'bg-emerald-500',
        },
        storeCardVariant: 'tour',
        ctaTitle: 'Lead Tours & Adventures',
        ctaSubtitle: 'Share the beauty of the Caribbean with visitors from around the world!',
        ctaEmoji: '🗺️',
        searchPlaceholder: '🗺️ Search tours, adventures, charters...',
    },

    transport: {
        type: 'transport',
        slug: 'transport',
        pageKey: 'taxi-hub',
        fallbackTitle: 'Island Transport',
        heroSubtitle: '🚕 Ride hailing - 📦 Delivery - 🚤 Boat charters',
        heroEmoji: '🚕📦🚤',
        heroStats: { label: 'Drivers', emoji: '🌴' },
        categories: [
            { id: 'all', title: 'All', icon: '🚕', desc: '', subtypes: [] },
            { id: 'ride', title: 'Ride Hailing', icon: '🚕', desc: 'Quick rides across the island', subtypes: ['ride', 'taxi', 'ride_hail'] },
            { id: 'delivery', title: 'Delivery', icon: '📦', desc: 'Send packages and goods', subtypes: ['delivery', 'courier', 'package'] },
            { id: 'boat', title: 'Boat Charters', icon: '🚤', desc: 'Private boat and ferry services', subtypes: ['boat', 'ferry', 'charter', 'marine'] },
            { id: 'moving', title: 'Moving', icon: '🚚', desc: 'Relocation and heavy lifting', subtypes: ['moving', 'relocation', 'heavy'] },
        ],
        theme: {
            primary: 'sky',
            gradient: 'from-sky-500 to-blue-500',
            lightBg: 'bg-sky-50 dark:bg-sky-900/20',
            lightText: 'text-sky-600 dark:text-sky-400',
            border: 'border-sky-100 dark:border-sky-900/30',
            ring: 'ring-sky-200 dark:ring-sky-800',
            accentBg: 'bg-sky-500',
        },
        storeCardVariant: 'transport',
        ctaTitle: 'Become a Driver',
        ctaSubtitle: 'Join IslandHub transport network and earn on your schedule!',
        ctaEmoji: '🚕',
        searchPlaceholder: '🚕 Search rides, delivery, charters...',
    },

    rentals: {
        type: 'rentals',
        slug: 'rentals',
        pageKey: 'rental-hub',
        fallbackTitle: 'Island Stays',
        heroSubtitle: '🏠 Vacation homes - 🏖️ Beach villas - 🏢 Long-term rentals',
        heroEmoji: '🏠🏖️🏢',
        heroStats: { label: 'Properties', emoji: '🌴' },
        categories: [
            { id: 'all', title: 'All', icon: '🏠', desc: '', subtypes: [] },
            { id: 'stays', title: 'Vacation Stays', icon: '🏖️', desc: 'Short-term vacation rentals', subtypes: ['stays', 'vacation', 'airbnb', 'short_term'] },
            { id: 'cars', title: 'Car Rentals', icon: '🚗', desc: 'Rent a car and explore', subtypes: ['car', 'auto', 'vehicle'] },
            { id: 'sea', title: 'Boat & Sea', icon: '🚤', desc: 'Boats and watercraft', subtypes: ['boat', 'sea', 'marine', 'watercraft'] },
            { id: 'longterm', title: 'Long-term', icon: '🏢', desc: 'Monthly & annual rentals', subtypes: ['long_term', 'monthly', 'annual', 'apartment'] },
            { id: 'equipment', title: 'Equipment', icon: '🔧', desc: 'Tools, gear & equipment', subtypes: ['equipment', 'tools', 'gear', 'rental_equipment'] },
        ],
        theme: {
            primary: 'amber',
            gradient: 'from-amber-500 to-orange-500',
            lightBg: 'bg-amber-50 dark:bg-amber-900/20',
            lightText: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-100 dark:border-amber-900/30',
            ring: 'ring-amber-200 dark:ring-amber-800',
            accentBg: 'bg-amber-500',
        },
        storeCardVariant: 'rental',
        ctaTitle: 'List Your Property',
        ctaSubtitle: 'Join IslandHub rentals and earn from your property!',
        ctaEmoji: '🏠',
        searchPlaceholder: '🏠 Search stays, rentals, equipment...',
    },

    campaigns: {
        type: 'campaigns',
        slug: 'campaigns',
        pageKey: 'campaigns',
        fallbackTitle: 'Island Causes',
        heroSubtitle: '❤️ Community fundraisers - 🌱 Environmental - 📚 Education',
        heroEmoji: '❤️🌱📚',
        heroStats: { label: 'Campaigns', emoji: '🌴' },
        categories: [
            { id: 'all', title: 'All', icon: '❤️', desc: '', subtypes: [] },
            { id: 'community', title: 'Community', icon: '🤝', desc: 'Local community projects', subtypes: ['community', 'local', 'neighborhood'] },
            { id: 'environment', title: 'Environment', icon: '🌱', desc: 'Eco & conservation', subtypes: ['environment', 'eco', 'conservation', 'green'] },
            { id: 'education', title: 'Education', icon: '📚', desc: 'Schools & learning', subtypes: ['education', 'school', 'learning', 'scholarship'] },
            { id: 'health', title: 'Health', icon: '🏥', desc: 'Medical & health causes', subtypes: ['health', 'medical', 'hospital', 'wellness'] },
        ],
        theme: {
            primary: 'rose',
            gradient: 'from-rose-500 to-pink-500',
            lightBg: 'bg-rose-50 dark:bg-rose-900/20',
            lightText: 'text-rose-600 dark:text-rose-400',
            border: 'border-rose-100 dark:border-rose-900/30',
            ring: 'ring-rose-200 dark:ring-rose-800',
            accentBg: 'bg-rose-500',
        },
        storeCardVariant: 'campaign',
        ctaTitle: 'Start a Campaign',
        ctaSubtitle: 'Raise funds for your cause and make a difference in the Caribbean!',
        ctaEmoji: '❤️',
        searchPlaceholder: '❤️ Search campaigns, causes...',
    },

    community: {
        type: 'community',
        slug: 'community',
        pageKey: 'community',
        fallbackTitle: 'Island Community',
        heroSubtitle: '🌴 Events - 📸 Stories - 🤝 Connect with locals',
        heroEmoji: '🌴📸🤝',
        heroStats: { label: 'Members', emoji: '🌴' },
        categories: [
            { id: 'all', title: 'All', icon: '🌴', desc: '', subtypes: [] },
            { id: 'events', title: 'Events', icon: '📅', desc: 'Upcoming local events', subtypes: ['event', 'meetup', 'gathering'] },
            { id: 'stories', title: 'Stories', icon: '📸', desc: 'Community stories & posts', subtypes: ['story', 'post', 'update'] },
            { id: 'groups', title: 'Groups', icon: '👥', desc: 'Interest-based groups', subtypes: ['group', 'club', 'association'] },
        ],
        theme: {
            primary: 'green',
            gradient: 'from-green-500 to-emerald-500',
            lightBg: 'bg-green-50 dark:bg-green-900/20',
            lightText: 'text-green-600 dark:text-green-400',
            border: 'border-green-100 dark:border-green-900/30',
            ring: 'ring-green-200 dark:ring-green-800',
            accentBg: 'bg-green-500',
        },
        storeCardVariant: 'community',
        ctaTitle: 'Join the Community',
        ctaSubtitle: 'Connect with locals, share stories, and be part of island life!',
        ctaEmoji: '🌴',
        searchPlaceholder: '🌴 Search community, events, groups...',
    },

    events: {
        type: 'events',
        slug: 'events',
        pageKey: 'events',
        fallbackTitle: 'Events & Tickets',
        heroSubtitle: '🎫 Concerts - 🎪 Festivals - 🎭 Shows - 🏆 Sports',
        heroEmoji: '🎫🎪🎭',
        heroStats: { label: 'Events', emoji: '🎉' },
        categories: [
            { id: 'all', title: 'All Events', icon: '🎫', desc: '', subtypes: [] },
            { id: 'concert', title: 'Concerts', icon: '🎵', desc: 'Live music & DJ sets', subtypes: ['concert', 'music', 'dj', 'live_music'] },
            { id: 'festival', title: 'Festivals', icon: '🎪', desc: 'Multi-day celebrations', subtypes: ['festival', 'carnival', 'fair'] },
            { id: 'sports', title: 'Sports', icon: '🏆', desc: 'Matches, tournaments & races', subtypes: ['sports', 'match', 'tournament', 'race'] },
            { id: 'workshop', title: 'Workshops', icon: '🛠️', desc: 'Learn & create', subtypes: ['workshop', 'class', 'training', 'seminar'] },
            { id: 'community', title: 'Community', icon: '🤝', desc: 'Meetups & social', subtypes: ['meetup', 'gathering', 'social', 'networking'] },
            { id: 'theater', title: 'Theater & Shows', icon: '🎭', desc: 'Plays, comedy & performances', subtypes: ['theater', 'comedy', 'performance', 'dance'] },
        ],
        theme: {
            primary: 'violet',
            gradient: 'from-violet-500 to-purple-600',
            lightBg: 'bg-violet-50 dark:bg-violet-900/20',
            lightText: 'text-violet-600 dark:text-violet-400',
            border: 'border-violet-100 dark:border-violet-900/30',
            ring: 'ring-violet-200 dark:ring-violet-800',
            accentBg: 'bg-violet-500',
        },
        storeCardVariant: 'event',
        ctaTitle: 'Hosting an Event?',
        ctaSubtitle: 'List your event on IslandHub and sell tickets with secure QR codes!',
        ctaEmoji: '🎫',
        searchPlaceholder: '🎫 Search events, concerts, workshops...',
    },
};

export function getHubConfig(type: string): HubPageConfig | undefined {
    return HUB_CONFIGS[type];
}

export function getAllHubTypes(): string[] {
    return Object.keys(HUB_CONFIGS);
}

// ─── Category-Level Layout Config ───────────────────────────────────────────
// Each hub type + category combination gets its own layout specification.
// This drives which card component, detail page, and UX pattern to use.

export interface CategoryLayoutConfig {
  /** Hub type this belongs to */
  hubType: string;
  /** Category slug (matches hubConfig.categories[].id) */
  categoryId: string;
  /** Human-readable page title */
  pageTitle: string;
  /** Hero subtitle */
  subtitle: string;
  /** Design reference for this category */
  reference: string;
  /** Layout pattern for the category page */
  pageLayout: 'grid' | 'list' | 'map' | 'immersive' | 'menu-first' | 'feed';
  /** Card style variant */
  cardVariant: string;
  /** Detail page type */
  detailType: string;
  /** Whether this category needs a booking widget */
  hasBooking: boolean;
  /** Booking widget type (if hasBooking) */
  bookingWidget?: 'date-range' | 'date-time' | 'quote' | 'ticket' | 'donation' | 'cart' | 'calendar';
  /** Filter chips specific to this category */
  filters: string[];
  /** Sort options */
  sortOptions: string[];
}

export const CATEGORY_LAYOUTS: Record<string, CategoryLayoutConfig> = {
  // ─── FOOD ───────────────────────────────────────────────────────────────
  'food-kitchen': {
    hubType: 'food', categoryId: 'kitchen',
    pageTitle: 'Cloud Kitchens & Home Cooking',
    subtitle: 'Fresh home-cooked meals delivered to your door',
    reference: 'CloudKitchens, Kitchen United',
    pageLayout: 'grid', cardVariant: 'food-kitchen', detailType: 'food-menu',
    hasBooking: true, bookingWidget: 'cart',
    filters: ['Cuisine', 'Dietary', 'Price', 'Rating'],
    sortOptions: ['Popular', 'Rating', 'Delivery Time', 'Price'],
  },
  'food-restaurant': {
    hubType: 'food', categoryId: 'restaurant',
    pageTitle: 'Restaurants & Fine Dining',
    subtitle: 'Full-service dining across St. Kitts & Nevis',
    reference: 'OpenTable, Resy',
    pageLayout: 'menu-first', cardVariant: 'food-restaurant', detailType: 'food-menu',
    hasBooking: true, bookingWidget: 'cart',
    filters: ['Cuisine', 'Price Range', 'Open Now', 'Rating', 'Outdoor Seating'],
    sortOptions: ['Popular', 'Rating', 'Price', 'Distance'],
  },
  'food-cafe': {
    hubType: 'food', categoryId: 'cafe',
    pageTitle: 'Cafés & Bakeries',
    subtitle: 'Coffee, pastries, and light bites',
    reference: 'Blue Bottle, Stumptown',
    pageLayout: 'grid', cardVariant: 'food-cafe', detailType: 'food-menu',
    hasBooking: true, bookingWidget: 'cart',
    filters: ['Open Now', 'Price', 'Dietary'],
    sortOptions: ['Popular', 'Rating', 'Distance'],
  },
  'food-grill': {
    hubType: 'food', categoryId: 'grill',
    pageTitle: 'Grills, Bars & Nightlife',
    subtitle: 'BBQ, grills, and island nightlife',
    reference: 'Yelp Nightlife, Untappd',
    pageLayout: 'grid', cardVariant: 'food-bar', detailType: 'food-menu',
    hasBooking: true, bookingWidget: 'cart',
    filters: ['Vibe', 'Happy Hour', 'Live Music', 'Rating'],
    sortOptions: ['Popular', 'Rating', 'Distance'],
  },

  // ─── PRODUCTS ───────────────────────────────────────────────────────────
  'products-shop': {
    hubType: 'products', categoryId: 'shop',
    pageTitle: 'Island Shops & Retail',
    subtitle: 'General retail stores across the Caribbean',
    reference: 'Shopify stores, Etsy',
    pageLayout: 'grid', cardVariant: 'product-shop', detailType: 'product-shop-page',
    hasBooking: false,
    filters: ['Category', 'Price', 'Rating', 'In Stock'],
    sortOptions: ['Popular', 'Newest', 'Price: Low', 'Price: High'],
  },
  'products-specialty': {
    hubType: 'products', categoryId: 'specialty',
    pageTitle: 'Artisan & Specialty Goods',
    subtitle: 'Handcrafted products made in the Caribbean',
    reference: 'Etsy, Uncommon Goods',
    pageLayout: 'grid', cardVariant: 'product-artisan', detailType: 'product-detail',
    hasBooking: false,
    filters: ['Craft Type', 'Price', 'Handmade', 'Local'],
    sortOptions: ['Popular', 'Newest', 'Price: Low', 'Price: High'],
  },
  'products-fashion': {
    hubType: 'products', categoryId: 'fashion',
    pageTitle: 'Fashion & Accessories',
    subtitle: 'Clothing, shoes, and island style',
    reference: 'Zara, ASOS',
    pageLayout: 'grid', cardVariant: 'product-fashion', detailType: 'product-detail',
    hasBooking: false,
    filters: ['Size', 'Brand', 'Price', 'Style', 'Gender'],
    sortOptions: ['Popular', 'Newest', 'Price: Low', 'Price: High'],
  },
  'products-health': {
    hubType: 'products', categoryId: 'health',
    pageTitle: 'Health & Beauty',
    subtitle: 'Wellness, supplements, and self-care',
    reference: 'Sephora, The Ordinary',
    pageLayout: 'grid', cardVariant: 'product-health', detailType: 'product-detail',
    hasBooking: false,
    filters: ['Skin Type', 'Concern', 'Brand', 'Price'],
    sortOptions: ['Popular', 'Rating', 'Price: Low', 'Price: High'],
  },

  // ─── SERVICES ───────────────────────────────────────────────────────────
  'services-professional': {
    hubType: 'services', categoryId: 'professional',
    pageTitle: 'Professional Services',
    subtitle: 'Legal, consulting, accounting, and business services',
    reference: 'LinkedIn ProFinder, Upwork',
    pageLayout: 'list', cardVariant: 'service-provider', detailType: 'service-booking',
    hasBooking: true, bookingWidget: 'calendar',
    filters: ['Specialty', 'Availability', 'Price', 'Rating', 'Credentials'],
    sortOptions: ['Rating', 'Price', 'Availability'],
  },
  'services-automotive': {
    hubType: 'services', categoryId: 'automotive',
    pageTitle: 'Automotive Services',
    subtitle: 'Car repair, detailing, and maintenance',
    reference: 'YourMechanic, Wrench',
    pageLayout: 'list', cardVariant: 'service-auto', detailType: 'service-booking',
    hasBooking: true, bookingWidget: 'calendar',
    filters: ['Service Type', 'Mobile Service', 'Price', 'Rating'],
    sortOptions: ['Rating', 'Distance', 'Price'],
  },
  'services-health': {
    hubType: 'services', categoryId: 'health',
    pageTitle: 'Health & Beauty Services',
    subtitle: 'Spa, salon, and wellness treatments',
    reference: 'Booksy, StyleSeat',
    pageLayout: 'list', cardVariant: 'service-beauty', detailType: 'service-booking',
    hasBooking: true, bookingWidget: 'calendar',
    filters: ['Treatment', 'Gender', 'Price', 'Rating', 'Next Available'],
    sortOptions: ['Rating', 'Price', 'Next Available'],
  },
  'services-marine': {
    hubType: 'services', categoryId: 'marine',
    pageTitle: 'Marine Services',
    subtitle: 'Boat services, diving, and water activities',
    reference: 'Marine service directories',
    pageLayout: 'list', cardVariant: 'service-marine', detailType: 'service-booking',
    hasBooking: true, bookingWidget: 'calendar',
    filters: ['Service Type', 'Certification', 'Insured', 'Price'],
    sortOptions: ['Rating', 'Price', 'Availability'],
  },
  'services-events': {
    hubType: 'services', categoryId: 'events',
    pageTitle: 'Event Services',
    subtitle: 'Catering, planning, and entertainment',
    reference: 'The Knot, EventUp',
    pageLayout: 'list', cardVariant: 'service-event', detailType: 'service-inquiry',
    hasBooking: true, bookingWidget: 'quote',
    filters: ['Event Type', 'Price', 'Rating', 'Availability'],
    sortOptions: ['Rating', 'Price', 'Experience'],
  },

  // ─── TOURS ──────────────────────────────────────────────────────────────
  'tours-land': {
    hubType: 'tours', categoryId: 'land',
    pageTitle: 'Land Tours & Hiking',
    subtitle: 'Hiking trails, history walks, and nature tours',
    reference: 'Viator, GetYourGuide',
    pageLayout: 'immersive', cardVariant: 'tour-card', detailType: 'tour-detail',
    hasBooking: true, bookingWidget: 'date-time',
    filters: ['Duration', 'Difficulty', 'Group Size', 'Price'],
    sortOptions: ['Popular', 'Rating', 'Duration', 'Price'],
  },
  'tours-sea': {
    hubType: 'tours', categoryId: 'sea',
    pageTitle: 'Sea & Water Adventures',
    subtitle: 'Snorkeling, sailing, fishing, and diving',
    reference: 'PADI, Snorkel Tours',
    pageLayout: 'immersive', cardVariant: 'tour-card', detailType: 'tour-detail',
    hasBooking: true, bookingWidget: 'date-time',
    filters: ['Activity', 'Equipment Included', 'Price', 'Duration'],
    sortOptions: ['Popular', 'Rating', 'Duration', 'Price'],
  },
  'tours-adventure': {
    hubType: 'tours', categoryId: 'adventure',
    pageTitle: 'Adventure & Extreme',
    subtitle: 'Zip-lining, ATV, and extreme experiences',
    reference: 'Viator Extreme, Manawa',
    pageLayout: 'immersive', cardVariant: 'tour-adventure', detailType: 'tour-detail',
    hasBooking: true, bookingWidget: 'date-time',
    filters: ['Thrill Level', 'Age Requirement', 'Price', 'Duration'],
    sortOptions: ['Popular', 'Rating', 'Thrill Level'],
  },
  'tours-charter': {
    hubType: 'tours', categoryId: 'charter',
    pageTitle: 'Private Charters',
    subtitle: 'Private boat and yacht charters',
    reference: 'GetMyBoat, Boatsetter',
    pageLayout: 'immersive', cardVariant: 'tour-charter', detailType: 'tour-detail',
    hasBooking: true, bookingWidget: 'date-time',
    filters: ['Boat Type', 'Duration', 'Capacity', 'Captain Included'],
    sortOptions: ['Popular', 'Rating', 'Price', 'Capacity'],
  },

  // ─── TRANSPORT ──────────────────────────────────────────────────────────
  'transport-ride': {
    hubType: 'transport', categoryId: 'ride',
    pageTitle: 'Ride Hailing',
    subtitle: 'Quick rides across St. Kitts & Nevis',
    reference: 'Uber, Lyft',
    pageLayout: 'map', cardVariant: 'transport-map', detailType: 'transport-ride-booking',
    hasBooking: true, bookingWidget: 'quote',
    filters: ['Vehicle Type', 'ETA', 'Price'],
    sortOptions: ['Nearest', 'Price', 'Rating'],
  },
  'transport-delivery': {
    hubType: 'transport', categoryId: 'delivery',
    pageTitle: 'Package Delivery',
    subtitle: 'Send packages and goods across the island',
    reference: 'Roadie, GoShare',
    pageLayout: 'list', cardVariant: 'transport-delivery', detailType: 'transport-delivery-booking',
    hasBooking: true, bookingWidget: 'quote',
    filters: ['Package Size', 'Urgency', 'Price'],
    sortOptions: ['Price', 'Speed', 'Rating'],
  },
  'transport-boat': {
    hubType: 'transport', categoryId: 'boat',
    pageTitle: 'Boat Charters & Ferries',
    subtitle: 'Private boat and ferry services',
    reference: 'GetMyBoat, Ferry operators',
    pageLayout: 'list', cardVariant: 'transport-boat', detailType: 'transport-boat-booking',
    hasBooking: true, bookingWidget: 'date-time',
    filters: ['Route', 'Schedule', 'Capacity', 'Price'],
    sortOptions: ['Schedule', 'Price', 'Duration'],
  },
  'transport-moving': {
    hubType: 'transport', categoryId: 'moving',
    pageTitle: 'Moving & Relocation',
    subtitle: 'Relocation and heavy lifting services',
    reference: 'Lugg, TaskRabbit',
    pageLayout: 'list', cardVariant: 'transport-moving', detailType: 'transport-moving-quote',
    hasBooking: true, bookingWidget: 'quote',
    filters: ['Truck Size', 'Crew Size', 'Availability', 'Price'],
    sortOptions: ['Price', 'Availability', 'Rating'],
  },

  // ─── RENTALS ────────────────────────────────────────────────────────────
  'rentals-stays': {
    hubType: 'rentals', categoryId: 'stays',
    pageTitle: 'Vacation Stays',
    subtitle: 'Vacation homes, villas, and beach houses',
    reference: 'Airbnb, Vrbo',
    pageLayout: 'grid', cardVariant: 'rental-property', detailType: 'rental-stay-detail',
    hasBooking: true, bookingWidget: 'date-range',
    filters: ['Property Type', 'Bedrooms', 'Bathrooms', 'Amenities', 'Price/Night', 'Instant Book', 'Superhost'],
    sortOptions: ['Popular', 'Price: Low', 'Price: High', 'Rating', 'Newest'],
  },
  'rentals-longterm': {
    hubType: 'rentals', categoryId: 'longterm',
    pageTitle: 'Long-Term Rentals',
    subtitle: 'Monthly and annual leases',
    reference: 'Zillow, Apartments.com',
    pageLayout: 'list', cardVariant: 'rental-longterm', detailType: 'rental-longterm-detail',
    hasBooking: true, bookingWidget: 'quote',
    filters: ['Property Type', 'Bedrooms', 'Bathrooms', 'Price/Month', 'Pet Policy', 'Available Date'],
    sortOptions: ['Price: Low', 'Price: High', 'Newest', 'Available Soon'],
  },
  'rentals-equipment': {
    hubType: 'rentals', categoryId: 'equipment',
    pageTitle: 'Equipment & Tools',
    subtitle: 'Tools, gear, and equipment for rent',
    reference: 'Fat Llama, ToolMates',
    pageLayout: 'grid', cardVariant: 'rental-equipment', detailType: 'rental-equipment-detail',
    hasBooking: true, bookingWidget: 'date-range',
    filters: ['Category', 'Brand', 'Condition', 'Price/Day', 'Delivery'],
    sortOptions: ['Popular', 'Price: Low', 'Rating', 'Available'],
  },
  'rentals-cars': {
    hubType: 'rentals', categoryId: 'cars',
    pageTitle: 'Car Rentals',
    subtitle: 'Rent a car and explore the island',
    reference: 'Turo, Hertz',
    pageLayout: 'grid', cardVariant: 'rental-car', detailType: 'rental-car-detail',
    hasBooking: true, bookingWidget: 'date-range',
    filters: ['Transmission', 'Seats', 'Price/Day', 'Instant Book'],
    sortOptions: ['Popular', 'Price: Low', 'Rating', 'Newest'],
  },
  'rentals-sea': {
    hubType: 'rentals', categoryId: 'sea',
    pageTitle: 'Boat & Sea Rentals',
    subtitle: 'Boats, jet skis, and watercraft',
    reference: 'GetMyBoat, Boatsetter',
    pageLayout: 'grid', cardVariant: 'rental-boat', detailType: 'rental-boat-detail',
    hasBooking: true, bookingWidget: 'date-time',
    filters: ['Boat Type', 'Capacity', 'Captain Included', 'Price/Half Day'],
    sortOptions: ['Popular', 'Price: Low', 'Rating', 'Capacity'],
  },

  // ─── EVENTS ────────────────────────────────────────────────────────────
  'events-community': {
    hubType: 'events', categoryId: 'community',
    pageTitle: 'Community Events',
    subtitle: 'Local gatherings, meetups, and social events',
    reference: 'Meetup, Facebook Events',
    pageLayout: 'feed', cardVariant: 'event-card', detailType: 'event-detail',
    hasBooking: true, bookingWidget: 'ticket',
    filters: ['Date', 'Category', 'Free/Paid', 'Location'],
    sortOptions: ['Date', 'Popular', 'Distance'],
  },
  'events-environment': {
    hubType: 'events', categoryId: 'environment',
    pageTitle: 'Environmental Events',
    subtitle: 'Eco, conservation, and green initiatives',
    reference: 'Eventbrite (cause events)',
    pageLayout: 'feed', cardVariant: 'event-card', detailType: 'event-detail',
    hasBooking: true, bookingWidget: 'ticket',
    filters: ['Date', 'Cause Type', 'Volunteer', 'Free/Paid'],
    sortOptions: ['Date', 'Popular'],
  },
  'events-education': {
    hubType: 'events', categoryId: 'education',
    pageTitle: 'Education & Workshops',
    subtitle: 'Learning, training, and skill-building',
    reference: 'Eventbrite (workshops)',
    pageLayout: 'feed', cardVariant: 'event-card', detailType: 'event-detail',
    hasBooking: true, bookingWidget: 'ticket',
    filters: ['Date', 'Topic', 'Price', 'Level'],
    sortOptions: ['Date', 'Popular', 'Price'],
  },
  'events-health': {
    hubType: 'events', categoryId: 'health',
    pageTitle: 'Health & Wellness Events',
    subtitle: 'Medical camps, fitness, and wellness',
    reference: 'Eventbrite (health)',
    pageLayout: 'feed', cardVariant: 'event-card', detailType: 'event-detail',
    hasBooking: true, bookingWidget: 'ticket',
    filters: ['Date', 'Event Type', 'Free/Paid'],
    sortOptions: ['Date', 'Popular'],
  },

  // ─── CAMPAIGNS ─────────────────────────────────────────────────────────
  'campaigns-community': {
    hubType: 'campaigns', categoryId: 'community',
    pageTitle: 'Community Fundraisers',
    subtitle: 'Local community projects and causes',
    reference: 'GoFundMe (community)',
    pageLayout: 'grid', cardVariant: 'campaign-card', detailType: 'campaign-detail',
    hasBooking: true, bookingWidget: 'donation',
    filters: ['Status', 'Goal', 'Days Left'],
    sortOptions: ['Most Urgent', 'Most Funded', 'Newest'],
  },
  'campaigns-environment': {
    hubType: 'campaigns', categoryId: 'environment',
    pageTitle: 'Environmental Causes',
    subtitle: 'Eco, conservation, and green projects',
    reference: 'Kickstarter (eco)',
    pageLayout: 'grid', cardVariant: 'campaign-card', detailType: 'campaign-detail',
    hasBooking: true, bookingWidget: 'donation',
    filters: ['Impact Type', 'Goal', 'Status'],
    sortOptions: ['Most Urgent', 'Most Funded', 'Impact'],
  },
  'campaigns-education': {
    hubType: 'campaigns', categoryId: 'education',
    pageTitle: 'Education & Scholarships',
    subtitle: 'Schools, learning, and student support',
    reference: 'GoFundMe (education)',
    pageLayout: 'grid', cardVariant: 'campaign-card', detailType: 'campaign-detail',
    hasBooking: true, bookingWidget: 'donation',
    filters: ['Beneficiary', 'Goal', 'Status'],
    sortOptions: ['Most Urgent', 'Most Funded', 'Newest'],
  },
  'campaigns-health': {
    hubType: 'campaigns', categoryId: 'health',
    pageTitle: 'Health & Medical',
    subtitle: 'Medical treatment and health causes',
    reference: 'GoFundMe (medical)',
    pageLayout: 'grid', cardVariant: 'campaign-card', detailType: 'campaign-detail',
    hasBooking: true, bookingWidget: 'donation',
    filters: ['Urgency', 'Goal', 'Status'],
    sortOptions: ['Most Urgent', 'Most Funded', 'Newest'],
  },

  // ─── COMMUNITY ─────────────────────────────────────────────────────────
  'community-events': {
    hubType: 'community', categoryId: 'events',
    pageTitle: 'Community Events',
    subtitle: 'Upcoming local events and meetups',
    reference: 'Meetup, Facebook Events',
    pageLayout: 'feed', cardVariant: 'community-event', detailType: 'event-detail',
    hasBooking: false,
    filters: ['Date', 'Category', 'Location'],
    sortOptions: ['Date', 'Popular'],
  },
  'community-stories': {
    hubType: 'community', categoryId: 'stories',
    pageTitle: 'Island Stories',
    subtitle: 'Community stories and updates',
    reference: 'Instagram, Facebook Feed',
    pageLayout: 'feed', cardVariant: 'community-story', detailType: 'story-detail',
    hasBooking: false,
    filters: ['Type', 'Author', 'Recent'],
    sortOptions: ['Recent', 'Popular', 'Trending'],
  },
  'community-groups': {
    hubType: 'community', categoryId: 'groups',
    pageTitle: 'Community Groups',
    subtitle: 'Interest-based groups and clubs',
    reference: 'Facebook Groups, Discord',
    pageLayout: 'grid', cardVariant: 'community-group', detailType: 'group-detail',
    hasBooking: false,
    filters: ['Category', 'Members', 'Activity'],
    sortOptions: ['Members', 'Active', 'Newest'],
  },
};

/** Get category layout config by hub type + category id */
export function getCategoryLayout(hubType: string, categoryId: string): CategoryLayoutConfig | undefined {
    return CATEGORY_LAYOUTS[`${hubType}-${categoryId}`];
}

/** Get all category configs for a hub type */
export function getHubCategories(hubType: string): CategoryLayoutConfig[] {
    return Object.values(CATEGORY_LAYOUTS).filter(c => c.hubType === hubType);
}

/** Get all rental sub-hub configs */
export function getRentalSubHubs(): CategoryLayoutConfig[] {
    return Object.values(CATEGORY_LAYOUTS).filter(c => c.hubType === 'rentals');
}
