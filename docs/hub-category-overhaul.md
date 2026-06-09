# Hub Category Overhaul — Implementation Plan

> 2026-06-06 — Based on user feedback

## Core Principle
Each hub category gets a **distinct, purpose-built experience**. No generic template. Airbnb is only the reference for rentals — every other category has its own reference design.

---

## Hub-by-Hub Design

### 1. 🏠 RENTALS — Multi-Hub (SPECIAL ATTENTION)

**Reference:** Airbnb (stays), Turo/Hertz (car rentals), Fat Llama (tools), GetMyBoat (sea rentals)

**Rental is NOT one category — it's a collection of sub-hubs:**

```
/hub/rentals                    → Rental gateway (sub-hub cards)
/hub/rentals/stays              → Vacation homes, villas, beach houses
/hub/rentals/stays/[slug]       → Property detail (Airbnb-style)
/hub/rentals/cars               → Car rentals (Turo-style)
/hub/rentals/cars/[slug]        → Car detail + booking
/hub/rentals/sea                → Boat/yacht/sea rentals (GetMyBoat-style)
/hub/rentals/sea/[slug]        → Boat detail + booking
/hub/rentals/tools              → Equipment/tools (Fat Llama-style)
/hub/rentals/tools/[slug]       → Tool detail + rental period picker
/hub/rentals/longterm           → Monthly/annual leases
/hub/rentals/longterm/[slug]    → Long-term listing detail
```

**Stays Detail Page (Airbnb-style):**
- Full-width image gallery (5+ photos, swipeable)
- Left: description, amenities grid, house rules, reviews
- Right: sticky booking card (price/night, date range picker, guest count, total, "Reserve" CTA)
- Map showing location
- Host profile
- Similar properties below

**Car Rental Detail (Turo-style):**
- Car image gallery
- Specs: make/model/year, transmission, seats, fuel type
- Left: description, features, delivery options
- Right: price/day, date range, pickup/dropoff location, total, "Book this Car"
- Owner profile
- Rating + trip count

**Sea Rental Detail (GetMyBoat-style):**
- Boat image gallery
- Specs: boat type, capacity, captain included?, half/full day pricing
- Left: description, what's included, meeting point
- Right: date picker, time slot, passenger count, total, "Book this Boat"

**Tools Detail (Fat Llama-style):**
- Tool image
- Specs: category, brand, condition
- Left: description, availability calendar
- Right: price/day or price/week, rental period, delivery option, total, "Rent this"

---

### 2. 🍽️ FOOD — Menu-First Experience

**Reference:** UberEats, DoorDash, Grubhub

```
/hub/food                       → Food hub (restaurant cards)
/hub/food/restaurants           → Full-service restaurants
/hub/food/restaurants/[slug]    → Restaurant menu page
/hub/food/kitchens              → Cloud/home kitchens
/hub/food/kitchens/[slug]      → Kitchen menu page
/hub/food/cafes                 → Cafés & bakeries
/hub/food/cafes/[slug]         → Café menu page
/hub/food/grills                → BBQ, grills & bars
/hub/food/grills/[slug]        → Grill menu page
```

**Food Store Page (UberEats-style):**
- Hero: restaurant image + name + cuisine type + rating + "Open/Closed" badge
- Left: menu categories (appetizers, mains, sides, drinks) with items
- Each item: name, description, price, photo, "+ Add" button + quantity control
- Right: sticky order summary (selected items, subtotal, delivery fee, total, "Checkout" CTA with total)
- Restaurant info: delivery area, hours, rating summary

---

### 3. 🗺️ TOURS — Dynamic Category Pages

**Reference:** Airbnb Experiences, Viator, GetYourGuide

```
/hub/tours                      → Tour hub (dynamic, shows all tour types)
/hub/tours/[category]           → Dynamic: land, sea, adventure, charter
/hub/tours/[category]/[slug]    → Tour detail (immersive)
```

**Why dynamic for tours?** Tour categories share the SAME layout pattern (hero + booking widget) but with category-specific theming. One `TourCategoryPage` component handles all subtypes via config.

**Tour Detail Page (Airbnb Experiences-style):**
- Full-bleed hero image (70vh, parallax)
- Category badge ("Land Tour" / "Sea Adventure" etc.)
- Title, location, rating, review count, duration, group size, "spots left"
- Left: about, what's included, itinerary, guide profile, reviews
- Right: sticky booking card (date picker, time slot, guest count, per-person price, total, "Book Now" CTA)
- Free cancellation policy
- Similar tours below

---

### 4. 🛍️ PRODUCTS — Shop-First Experience

**Reference:** Etsy, Shopify stores, Amazon

```
/hub/products                   → Product hub (shop grid)
/hub/products/shops             → General retail stores
/hub/products/shops/[slug]      → Shop page with product listings
/hub/products/specialty         → Artisan & specialty goods
/hub/products/fashion           → Clothing & accessories
/hub/products/[category]/[id]   → Individual product detail
```

**Product Detail Page:**
- Image gallery (zoom on hover, thumbnail strip)
- Left: title, price, rating, description, variants (size/color), quantity
- Right: "Add to Cart" + "Buy Now" CTAs with total, shipping estimate, return policy
- Reviews section
- Similar products

---

### 5. 🛠️ SERVICES — Booking Calendar Experience

**Reference:** Booksy, StyleSeat, Thumbtack

```
/hub/services                   → Service hub (provider cards)
/hub/services/[category]        → professional, automotive, health, marine, events
/hub/services/[category]/[slug] → Provider detail + booking
```

**Service Provider Page:**
- Provider photo, name, specialty, rating, "Next available: Today"
- Left: service list (each with price, duration, "Book" button)
- Right: booking calendar (date picker, available time slots, selected service, total, "Book Appointment" CTA)
- About the provider, reviews
- Similar providers

---

### 6. 🚕 TRANSPORT — Ride/Move Experience

**Reference:** Uber, Lyft, Lugg (moving)

```
/hub/transport                  → Transport hub
/hub/transport/[category]       → ride, delivery, boat, moving
/hub/transport/[category]/[id]  → Booking flow
```

**Transport Booking (Uber-style):**
- Map-centric layout (pickup/dropoff markers + route)
- Left: ride type selection, vehicle type, fare estimate
- Right: pickup input, dropoff input, "Book Ride" CTA with total
- For delivery: package size, sender/receiver info
- For moving: home size, inventory checklist

---

### 7. 🎫 EVENTS — Ticket Experience

**Reference:** Eventbrite, Ticketmaster

```
/hub/events                     → Events hub
/hub/events/[slug]              → Event detail + ticket selection
```

**Event Detail:**
- Hero image with event title, date, venue, organizer
- Left: description, schedule, venue info, organizer profile
- Right: ticket type selector (GA, VIP, Early Bird), quantity, total, "Get Tickets" CTA
- "Only 12 tickets left" urgency
- Map to venue

---

### 8. ❤️ CAMPAIGNS — Fundraiser Experience

**Reference:** GoFundMe, Kickstarter

```
/hub/campaigns                  → Campaigns hub
/hub/campaigns/[category]       → community, environment, education, health
/hub/campaigns/[category]/[slug] → Campaign detail
```

**Campaign Detail:**
- Hero image with campaign title, goal bar (% raised)
- Left: story, updates, backer list
- Right: donation amount selector, "Contribute" CTA
- Urgency: "7 days left", "$2,340 of $5,000 goal"

---

### 9. 🌴 COMMUNITY — Social Feed Experience

**Reference:** Facebook Groups, Nextdoor

```
/hub/community                  → Community hub
/hub/community/[category]       → events, stories, groups
```

---

## Implementation Priority

### Phase 1: Mobile Fix + Foundation ✅
- [x] Fix mobile menu overlay opacity/blur
- [ ] Create subtype route structure: `/hub/[type]/[subtype]/page.tsx`
- [ ] Create dynamic listing route: `/hub/[type]/[subtype]/[slug]/page.tsx`
- [ ] Update hubConfigs.ts with subtype configs

### Phase 2: Rentals (Multi-Hub) — MOST COMPLEX
- [ ] Rental gateway page (`/hub/rentals`) with sub-hub cards
- [ ] Stays hub page (Airbnb-style property cards)
- [ ] Stays detail page (full Airbnb clone: gallery, amenities, calendar booking)
- [ ] Cars hub + detail (Turo-style)
- [ ] Sea hub + detail (GetMyBoat-style)
- [ ] Tools hub + detail (Fat Llama-style)
- [ ] Long-term hub + detail
- [ ] Shared: rental booking widget (date range picker, price calculator, "Reserve")
- [ ] DB: `rental_properties` table (property_type, bedrooms, bathrooms, amenities_json, etc.)

### Phase 3: Tours (Dynamic)
- [ ] Tour category page component (handles all subtypes via config)
- [ ] Tour detail page (immersive hero, booking widget, guide profile)
- [ ] Shared: tour booking widget (date, time, guest count, "spots left")
- [ ] DB: `tour_listings` table (tour_type, duration, max_guides, includes_json, guide_id)

### Phase 4: Food (Menu-First)
- [ ] Food hub with restaurant cards (cuisine type, "Open/Closed", delivery time)
- [ ] Restaurant detail page (menu + order sidebar)
- [ ] Shared: menu item component, order summary sidebar
- [ ] DB: `food_menus` table (store_id, items_json or normalized)

### Phase 5: Products (Shop)
- [ ] Product hub with shop cards
- [ ] Shop detail page (product listings)
- [ ] Product detail page (gallery, variants, reviews)
- [ ] Product card component (price, rating, quick-add)

### Phase 6: Services + Transport + Events + Campaigns + Community
- [ ] Service provider cards + booking calendar
- [ ] Transport booking flow
- [ ] Event detail + ticket selection
- [ ] Campaign detail + donation
- [ ] Community feed

### Phase 7: Cleanup
- [ ] Remove old generic StoreCard where no longer needed
- [ ] Update all nav links to point to new routes
- [ ] Add new routes to sitemap
- [ ] Performance audit (image lazy loading, code splitting)

---

## Key Subtype Config Extensions

Each hub config in `hubConfigs.ts` needs:

```typescript
subtypes: {
  [subtypeId: string]: {
    title: string
    emoji: string
    description: string
    theme: HubTheme
    layout: 'grid' | 'list' | 'map' | 'immersive'
    cardComponent: string  // Which card component to use
    detailPage: string     // Which detail page component
    filters: string[]      // Filter options specific to this subtype
  }
}
```

---

## DB Schema Additions

```sql
-- Rental properties (extends stores)
CREATE TABLE rental_properties (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id),
  property_type VARCHAR(30),  -- 'stay', 'car', 'boat', 'tool', 'longterm'
  bedrooms INTEGER,
  bathrooms INTEGER,
  max_guests INTEGER,
  amenities JSONB,
  price_per_night DECIMAL(10,2),
  price_per_day DECIMAL(10,2),
  price_per_week DECIMAL(10,2),
  location_lat DECIMAL(10,6),
  location_lng DECIMAL(10,6),
  booking_settings JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tour listings (extends stores)
CREATE TABLE tour_listings (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id),
  tour_type VARCHAR(30),  -- 'land', 'sea', 'adventure', 'charter'
  duration_minutes INTEGER,
  max_guests INTEGER,
  difficulty VARCHAR(20),
  includes JSONB,
  price_per_person DECIMAL(10,2),
  guide_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Food menus
CREATE TABLE food_menus (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id),
  item_name VARCHAR(200),
  description TEXT,
  price DECIMAL(10,2),
  category VARCHAR(50),  -- 'appetizer', 'main', 'side', 'drink'
  prep_time_minutes INTEGER,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Shared Components Needed

1. `BookingWidget` — configurable booking sidebar (date picker, guest/quantity, price breakdown, CTA)
2. `ImageGallery` — swipeable image gallery with thumbnails
3. `PriceTag` — price display (per night, per person, per day, "from $X")
4. `RatingBadge` — star count + review count
5. `AvailabilityBadge` — "Open/Closed", "3 spots left", "Available now"
6. `UrgencyCue` — "Only 2 left", "Booked 12 times today", "Ends in 3h"
7. `FilterBar` — dynamic filter chips
8. `MapPreview` — Leaflet map for location display

---

## Estimated Effort

| Phase | Scope | Est. Tool Calls |
|-------|-------|----------------|
| 1 | Foundation + routing | ~15 patches |
| 2 | Rentals (multi-hub) | ~40 patches |
| 3 | Tours (dynamic) | ~20 patches |
| 4 | Food (menu) | ~20 patches |
| 5 | Products (shop) | ~15 patches |
| 6 | Services + rest | ~25 patches |
| 7 | Cleanup | ~10 patches |
| **Total** | | **~145 patches** |
