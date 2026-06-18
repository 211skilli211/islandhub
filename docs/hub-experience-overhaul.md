# Hub Experience Overhaul — Research & Rebuild Plan

> Created: 2026-06-05
> Trigger: User feedback — "all listing pages show all kind of data", "rentals and tours still does not give the experience I asked for", "no premium experience", "this is a mess"

---

## Problem Statement

Current state: ALL hub pages (`/hub/food`, `/hub/products`, `/hub/services`, `/hub/tours`, `/hub/transport`, `/hub/rentals`) use the **exact same generic layout**:
1. Hero banner
2. Category filter bar
3. Grid of identical `StoreCard` tiles (4-col responsive)
4. CTA section

**Issues:**
- No category-specific experience — a restaurant, a vacation rental, and a tour operator all look identical
- No sub-type pages — clicking "Apartments" in rentals just filters the grid, doesn't open an Airbnb-style experience
- All listings dumped together — kitchens mixed with restaurants, rentals mixed with equipment
- StoreCard is one-size-fits-all — same card component for every hub type
- No dedicated listing detail pages per type — `/listings/[id]` is generic
- No booking flow on hub pages — just "View Store" links
- Food and product hubs feel worse than before — "no premium experience"
- "All type of listing all over the place that have nothing to do with each category"

---

## Target Architecture

### Route Structure

```
/hub                          → Gateway (7 category cards, existing)
/hub/food                     → Food hub (restaurants, kitchens, cafés, grills)
/hub/food/[subtype]           → Dedicated subtype page (e.g., /hub/food/restaurants)
/hub/food/[subtype]/[slug]    → Individual store/menu page
/hub/products                 → Product hub (shops, specialty, fashion, health)
/hub/products/[subtype]       → Dedicated subtype page
/hub/products/[subtype]/[id]  → Individual product listing
/hub/services                 → Service hub
/hub/services/[subtype]       → Dedicated subtype page (e.g., /hub/services/spa)
/hub/services/[subtype]/[slug]→ Individual service provider page
/hub/tours                    → Tour hub (land, sea, adventure, charters)
/hub/tours/[subtype]          → Dedicated subtype page (e.g., /hub/tours/sea)
/hub/tours/[subtype]/[slug]   → Individual tour listing (immersive, Airbnb-style)
/hub/rentals                  → Rental hub (stays, long-term, equipment)
/hub/rentals/[subtype]        → Dedicated subtype page (e.g., /hub/rentals/stays)
/hub/rentals/[subtype]/[slug] → Individual rental listing (Airbnb-style)
/hub/transport                → Transport hub (rides, delivery, boats, moving)
/hub/transport/[subtype]      → Dedicated subtype page
```

### Page Types (6 distinct layouts)

| Hub | Layout Style | Reference | Key Features |
|-----|-------------|-----------|-------------|
| **Food** | Menu-first, order-focused | UberEats, DoorDash | Menu items, add-to-cart, delivery time, "Open/Closed" status |
| **Products** | Product grid, shop-focused | Shopify, Etsy | Product cards, variants, reviews, "Ships today" |
| **Services** | Booking calendar, provider-focused | Booksy, StyleSeat | Service list, calendar picker, provider profile, "Book Now" |
| **Tours** | Immersive hero, experience-focused | Airbnb Experiences, Viator | 80vh hero, date picker, group size, "What's included", guide profile |
| **Rentals** | Property showcase, stay-focused | Airbnb, Vrbo | Property cards, amenities, calendar availability, "Book Stay" |
| **Transport** | Map-first, ride-focused | Uber, Lyft | Map preview, vehicle selection, fare estimate, driver proximity |

---

## Implementation Plan

### Phase 1: Routing + Subtype Pages (Foundation)
1. Create `/hub/[type]/[subtype]/page.tsx` — dynamic subtype page
2. Create `/hub/[type]/[subtype]/[slug]/page.tsx` — individual listing page
3. Update `hubConfigs.ts` — add subtype-specific config (theme, hero, filters)
4. Update `HubPage.tsx` — add "View All" links to subtype pages from main hub

### Phase 2: Rental Hub Rebuild (Airbnb-style)
1. Create `RentalHubPage.tsx` — dedicated rental layout
2. Create `RentalCard.tsx` — property card (image, price/night, rating, location, amenities)
3. Create `RentalDetailPage.tsx` — full property page (gallery, description, amenities, calendar, booking widget)
4. Subtype pages: `/hub/rentals/stays`, `/hub/rentals/longterm`, `/hub/rentals/equipment`

### Phase 3: Tour Hub Rebuild (Airbnb Experiences-style)
1. Create `TourHubPage.tsx` — dedicated tour layout
2. Create `TourCard.tsx` — tour card (image, price/person, duration, rating, "spots left")
3. Create `TourDetailPage.tsx` — immersive tour page (80vh hero, date picker, guest selector, guide profile, reviews)
4. Subtype pages: `/hub/tours/land`, `/hub/tours/sea`, `/hub/tours/adventure`, `/hub/tours/charter`

### Phase 4: Food Hub Rebuild (UberEats-style)
1. Create `FoodHubPage.tsx` — dedicated food layout
2. Create `FoodStoreCard.tsx` — restaurant card (image, cuisine type, rating, delivery time, "Open/Closed")
3. Create `FoodStorePage.tsx` — menu page (menu categories, items with prices, add-to-cart, order summary sidebar)

### Phase 5: Product Hub Rebuild (Shopify-style)
1. Create `ProductHubPage.tsx` — dedicated product layout
2. Create `ProductCard.tsx` — product card (image, price, rating, "In stock", quick-add)
3. Create `ProductDetailPage.tsx` — product page (gallery, variants, reviews, shipping info)

### Phase 6: Service Hub Rebuild (Booksy-style)
1. Create `ServiceHubPage.tsx` — dedicated service layout
2. Create `ServiceProviderCard.tsx` — provider card (photo, specialty, rating, next available)
3. Create `ServiceDetailPage.tsx` — service page (service list, calendar booking, provider profile)

### Phase 7: Cleanup
1. Delete old generic `StoreCard.tsx` (or keep for backward compat)
2. Delete old `HubPage.tsx` category grid sections
3. Update all hub page routes to use new dedicated components
4. Update admin dashboard to manage subtype assignments

---

## Data Model Changes Needed

### Store/Listing Table
Current: `stores` table with `category` and `subtype` fields
Need: Ensure `subtype` is consistently populated for all listings

### New Tables Needed
1. `rental_properties` — property-specific data (bedrooms, bathrooms, amenities, check-in/out times)
2. `tour_listings` — tour-specific data (duration, group size, difficulty, includes, guide_id)
3. `food_menus` — menu items per store (name, price, description, category, prep_time)
4. `service_bookings` — service-specific data (duration, price, provider_id, availability)
5. `product_variants` — product variants (size, color, price, stock)

---

## Reference Sites to Study

### Rentals (Airbnb-style)
- Airbnb.com — property cards, detail pages, booking widget
- Vrbo.com — vacation rental focus
- Booking.com — hotel/property hybrid

### Tours (Airbnb Experiences-style)
- Airbnb.com/experiences — immersive hero, date picker, "What's included"
- Viator.com — tour cards, reviews, "spots left"
- GetYourGuide.com — tour detail pages

### Food (UberEats-style)
- UberEats.com — restaurant cards, menu pages, order flow
- DoorDash.com — similar food ordering
- Grubhub.com — menu-focused

### Products (Shopify-style)
- Etsy.com — artisan/handmade focus
- Shopify demo stores — product grids, variants
- Amazon.com — product detail pages

### Services (Booksy-style)
- Booksy.com — service booking, calendar
- StyleSeat.com — beauty services
- Thumbtack.com — professional services

---

## Key Design Principles

1. **Each hub feels like a dedicated app** — not a filtered view of the same page
2. **Subtype pages are first-class** — `/hub/rentals/stays` is a full page, not a filter
3. **Listing detail pages are type-specific** — rental detail ≠ tour detail ≠ food menu
4. **Conversion psychology on every page** — singular prices, total on CTA, scarcity, social proof
5. **Premium feel** — generous whitespace, high-quality imagery, smooth animations, OKLCH palette
6. **Mobile-first** — 70%+ of Caribbean users are mobile
7. **Fast** — no unnecessary data fetching, skeleton loaders, optimistic UI

---

## Files to Create

### New Components
- `components/hub/rentals/RentalHubPage.tsx`
- `components/hub/rentals/RentalCard.tsx`
- `components/hub/rentals/RentalDetailPage.tsx`
- `components/hub/tours/TourHubPage.tsx`
- `components/hub/tours/TourCard.tsx`
- `components/hub/tours/TourDetailPage.tsx`
- `components/hub/food/FoodHubPage.tsx`
- `components/hub/food/FoodStoreCard.tsx`
- `components/hub/food/FoodStorePage.tsx`
- `components/hub/products/ProductHubPage.tsx`
- `components/hub/products/ProductCard.tsx`
- `components/hub/products/ProductDetailPage.tsx`
- `components/hub/services/ServiceHubPage.tsx`
- `components/hub/services/ServiceProviderCard.tsx`
- `components/hub/services/ServiceDetailPage.tsx`

### New Routes
- `app/hub/[type]/[subtype]/page.tsx`
- `app/hub/[type]/[subtype]/[slug]/page.tsx`

### Modified Files
- `lib/hubConfigs.ts` — add subtype configs
- `components/hub/HubPage.tsx` — simplify to gateway only
- `components/hub/HubComponents.tsx` — remove old StoreCard, keep shared UI

---

## Estimated Effort

| Phase | Scope | Est. Time |
|-------|-------|-----------|
| Phase 1 | Routing + subtype pages | 2-3 hours |
| Phase 2 | Rental hub (Airbnb-style) | 4-6 hours |
| Phase 3 | Tour hub (Experiences-style) | 4-6 hours |
| Phase 4 | Food hub (UberEats-style) | 3-4 hours |
| Phase 5 | Product hub (Shopify-style) | 3-4 hours |
| Phase 6 | Service hub (Booksy-style) | 3-4 hours |
| Phase 7 | Cleanup + polish | 2-3 hours |
| **Total** | | **21-30 hours** |

---

## Immediate Next Steps

1. **Start with Phase 1** — routing + subtype pages (foundation for everything else)
2. **Then Phase 2 (Rentals)** — highest impact, Airbnb-style experience
3. **Then Phase 3 (Tours)** — second highest impact, immersive experience
4. **Then Phase 4-6** — food, products, services
5. **Phase 7** — cleanup

---

## Notes

- The existing `docs/store-service-experiences.md` has excellent UX specs — use as reference
- The existing `hubConfigs.ts` has good category/subtype definitions — extend it
- Don't delete old code until new code is working — parallel development
- Test each hub type independently before moving to the next
- User wants "premium experience" — invest in animations, transitions, micro-interactions
