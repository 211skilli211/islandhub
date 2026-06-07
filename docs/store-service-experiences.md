# Store & Service Experiences — UX/UI Design Spec

> Designed using: Conversion Psychology Framework, Unified Design System (Impeccable + Taste Skill + Perception-First), UI-UX-Pro-Max, Airbnb/Shopify/Booking.com reference patterns, OKLCH Caribbean palette, Segment Theming Engine.

---

## Current State Audit

### What Exists (IslandHub)
| Page | Path | Status | Issues |
|------|------|--------|--------|
| Store page | `/store/[slug]` | ✅ Basic | Layout type switching (food/service/rental/product/ibt), but barebones |
| Listing detail | `/listings/[id]` | ✅ Basic | Good SEO meta, but no booking flow, no trust signals |
| Cart | `/cart` | ✅ Basic | Functional but ugly empty state (bouncing emoji), no urgency cues |
| Checkout | `/checkout/*` | ✅ Basic | Multi-step, but no price transparency, no trust badges |
| Book | `/book` | ⚠️ Redirect | Just redirects to `/stores?category=service` |
| Tours | `/tours`, `/tour/[id]` | ✅ Basic | Date selection, hero image, framer-motion, but no booking widget |
| Services | `/services` | ✅ Basic | Category filter, store grid, but no booking flow |
| Transport | `/transport` | ⚠️ Minimal | Barely functional |
| Hub pages | `/hub/[type]` | ✅ Good | Segment theming, category cards, but no conversion optimization |

### Key Conversion Gaps (from Conversion Psychology audit)
1. **CTA buttons** — "Book Now", "Reserve", "Subscribe" → need light-commitment verbs + price transparency
2. **Pricing** — ranges like "$6-$12" → need singular values
3. **Dates** → need day-of-week + duration format
4. **Images** — small thumbnails → need hero-half spatial dominance
5. **Copy** — generic titles → need sensory narrative copy
6. **Trust** — no badges, no reviews, no verification signals on listing pages
7. **Cart** — no urgency cues, no scarcity, no social proof
8. **Checkout** — no fee transparency, no all-inclusive pricing
9. **Empty states** — bouncing emoji → need actionable CTAs
10. **Services** — no booking widget, no calendar, no availability display

---

## Experience Architecture

### Customer Journey by Hub Type

```
┌─────────────────────────────────────────────────────────────┐
│                    HUB ENTRY POINTS                          │
│  /hub/food  |  /hub/products  |  /hub/services  |  /hub/tours  |  /hub/transport  |  /hub/rentals  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 LISTING DETAIL PAGE                          │
│  (Different layout per type — see below)                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ HERO (60vh immersive image)                          │   │
│  │ • Large hero image/video                             │   │
│  │ • Title + Vendor name + Rating                       │   │
│  │ • Quick stats (duration, group size, location)       │   │
│  │ • Segment-themed accent color                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────┬──────────────────────────┐   │
│  │ LEFT (content)           │ RIGHT (booking widget)   │   │
│  │                          │                          │   │
│  │ • Description            │ • Price (singular)       │   │
│  │ • What's included        │ • Date/time picker       │   │
│  │ • Highlights             │ • Guest selector         │   │
│  │ • Reviews                │ • Total on CTA           │   │
│  │ • Vendor info            │ • Trust badges           │   │
│  │ • Similar listings       │ • Free cancellation      │   │
│  │                          │ • Add to cart / Book     │   │
│  └──────────────────────────┴──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      CART                                    │
│  • Item cards with images                                   │
│  • Quantity controls                                        │
│  • Subtotal visible                                         │
│  • Urgency cues (scarcity, time-limited)                    │
│  • Social proof ("12 people viewing this")                  │
│  • Secure checkout badge                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CHECKOUT                                  │
│  Step 1: Order summary (all-inclusive pricing)              │
│  Step 2: Payment method (Fygaro/card/crypto)               │
│  Step 3: Confirmation (order #, timeline, contact)          │
│                                                             │
│  • Fee transparency (show all fees upfront)                 │
│  • Free cancellation policy visible                         │
│  • Trust badges (secure payment, verified vendor)           │
│  • Total on every CTA: "Pay • $185 Total"                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Product Store Experience (Food)

### Food Listing Page
```
┌──────────────────────────────────────────────────────────────┐
│ 🍽️ Frigate Bay Kitchen                  ● Open · Closes 9PM │
│ 📍 Frigate Bay, St. Kitts                                    │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [Hero Image — food photography, warm lighting]           │ │
│ │                                                          │ │
│ │  🍳 Caribbean Cuisine │ 🌿 Local Ingredients            │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
├──────────────────────────────┬───────────────────────────────┤
│                              │                               │
│ Menu                         │ Order Summary                 │
│                              │                               │
│ ┌──────────────────────────┐ │ ┌─────────────────────────┐  │
│ │ 🔥 Popular               │ │ │ Delivery to:            │  │
│ │                          │ │ │ [Frigate Bay ▾]         │  │
│ │ Jerk Chicken Plate    $18│ │ │                         │  │
│ │ ★★★★★ (234) · 30 min    │ │ │ ☐ Jerk Chicken × 1 $18  │  │
│ │ [+ Add]                  │ │ │ ☐ Rice & Peas    × 1 $8 │  │
│ │                          │ │ │ ─────────────────────── │  │
│ │ Fresh Catch of the Day $24│ │ │ Subtotal:          $26  │  │
│ │ ★★★★★ (189) · 25 min    │ │ │ Delivery:           $0  │  │
│ │ [+ Add]                  │ │ │ ─────────────────────── │  │
│ │                          │ │ │ Total:              $26  │  │
│ │ 🥗 Sides                 │ │ │                         │  │
│ │                          │ │ │ [Checkout • $26 Total]  │  │
│ │ Rice & Peas          $8  │ │ │                         │  │
│ │ ★★★★★ (456)             │ │ │ 🔒 Secure checkout      │  │
│ │ [+ Add]                  │ │ │ 🚕 Driver 4 mins away   │  │
│ │                          │ │ │ ⏱ Ready in 25-35 mins   │  │
│ │ Plantain Chips       $6  │ │ └─────────────────────────┘  │
│ │ ★★★★☆ (123)             │ │                               │
│ │ [+ Add]                  │ │                               │
│ └──────────────────────────┘ │                               │
│                              │                               │
│ 💡 "Free delivery on orders over $40"                        │
└──────────────────────────────┴───────────────────────────────┘
```

### Food Conversion Psychology Applied
- **Singular price**: `$18` not `$15-$22`
- **Time estimate**: `Ready in 25-35 mins` not `20-40 mins`
- **Driver proximity**: `Driver 4 mins away` not `20-40 mins`
- **CTA with total**: `Checkout • $26 Total` not `Checkout`
- **Urgency**: `● Open · Closes 9PM` — real-time status
- **Social proof**: `★★★★★ (234)` on each item
- **Free delivery threshold**: `Free delivery on orders over $40` — encourages upsell

---

## 2. Product Store Experience (Products)

### Product Listing Page
```
┌──────────────────────────────────────────────────────────────┐
│ 🛍️ Island Spice Box                                          │
│ 📍 Basseterre, St. Kitts │ ★★★★★ 4.8 (156 reviews)          │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [Product Image Gallery — carousel with thumbnails]       │ │
│ │                                                          │ │
│ │  [1] [2] [3] [4] [5]  ← thumbnail strip                 │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
├──────────────────────────────┬───────────────────────────────┤
│                              │                               │
│ Spice Box Collection         │                               │
│ Handcrafted in St. Kitts    │ $24.99                         │
│                              │ In stock · Ships today         │
│ Our signature spice blend    │                                │
│ made from locally sourced    │ Qty: [1 ▾]                     │
│ island herbs. Each box       │                                │
│ contains 6 reusable jars     │ ┌─────────────────────────┐   │
│ with hand-written labels.    │ │ [Add to Cart • $24.99]  │   │
│                              │ └─────────────────────────┘   │
│ ✅ Free shipping over $50    │                                │
│ ✅ 30-day returns            │ [Buy Now • $24.99]            │
│ ✅ Handmade guarantee        │                                │
│                              │ ─────────────────────────     │
│ What's included:             │                                │
│ • 6 spice jars               │ 🚚 Free delivery by Thu       │
│ • Hand-written labels        │ 🔒 Secure checkout            │
│ • Recipe card                │ ↩️ Free returns · 30 days     │
│ • Gift box packaging         │ ✓ Verified Caribbean product  │
│                              │                                │
│ ─────────────────────────────│                                │
│                              │                                │
│ Customer Reviews (156)       │ Similar products              │
│ ┌──────────────────────────┐ │ ┌─────────────────────────┐   │
│ │ ★★★★★ "Amazing quality!  │ │ │ [Img] Hot Sauce Kit $18 │   │
│ │ The flavors are incredible│ │ │ ★★★★☆ (89)             │   │
│ │ and the packaging is     │ │ └─────────────────────────┘   │
│ │ beautiful." — Sarah M.  │ │ ┌─────────────────────────┐   │
│ │                          │ │ │ [Img] Coconut Oil $12   │   │
│ │ ★★★★★ "Perfect gift!    │ │ │ ★★★★★ (234)            │   │
│ │ Arrived quickly and     │ │ └─────────────────────────┘   │
│ │ beautifully wrapped."   │ │                               │
│ │ — John D.               │ │                               │
│ └──────────────────────────┘ │                               │
└──────────────────────────────┴───────────────────────────────┘
```

### Product Conversion Psychology Applied
- **Singular price**: `$24.99` not `$20-$30`
- **CTA with total**: `Add to Cart • $24.99` not `Add to Cart`
- **Trust signals**: ✅ Free shipping, ✅ 30-day returns, ✅ Handmade guarantee
- **Delivery timeline**: `Free delivery by Thu` not `Ships in 3-5 days`
- **Verification**: `✓ Verified Caribbean product`
- **Reviews**: Star count + review count + actual quotes
- **Urgency**: `In stock · Ships today`
- **Cross-sell**: Similar products below reviews

---

## 3. Tour Experience

### Tour Listing Page (Immersive)
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [Hero Image — 80vh immersive, parallax on scroll]        │ │
│ │                                                          │ │
│ │  🥾 Frigate Bay Beach Tour                               │ │
│ │  St. Kitts │ ★★★★★ 4.9 (342 reviews)                     │ │
│ │                                                          │ │
│ │  3 hours │ Max 8 people │ All ages welcome               │ │
│ │                                                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
├──────────────────────────────┬───────────────────────────────┤
│                              │                               │
│ About This Adventure         │ ┌─────────────────────────┐   │
│                              │ │  $65 per person         │   │
│ Discover the pristine        │ │                         │   │
│ coastline of Frigate Bay     │ │  📅 Select Date         │   │
│ with our expert local guide. │ │  [Jun 12 ▾]            │   │
│ This 3-hour walking tour     │ │                         │   │
│ takes you through hidden     │ │  👥 Guests              │   │
│ coves, historic lookout     │ │  [2 ▾]                  │   │
│ points, and the best         │ │                         │   │
│ snorkeling spots.            │ │  ─────────────────────  │   │
│                              │ │  Subtotal:       $130   │   │
│ 🌊 Snorkeling included       │ │  Tax:             $0    │   │
│ 📸 Professional photos       │ │  ─────────────────────  │   │
│ 🧊 Refreshments provided     │ │  Total:           $130  │   │
│ 🅿️ Free parking              │ │                         │   │
│                              │ │  [Book Now • $130 Total]│   │
│ What's included:             │ │                         │   │
│ ┌──────────────────────────┐ │  │  🔒 Free cancellation  │   │
│ │ ✅ Expert local guide    │ │  │     until Jun 10       │   │
│ │ ✅ Snorkeling equipment  │ │  │                         │   │
│ │ ✅ Professional photos   │ │  │  👥 3 spots left for   │   │
│ │ ✅ Refreshments          │ │  │     Jun 12             │   │
│ │ ✅ Hotel pickup          │ │  │  ⏱ Response within 1hr │   │
│ └──────────────────────────┘ │  └─────────────────────────┘   │
│                              │                               │
│ ─────────────────────────────│                               │
│                              │                               │
│ Meet Your Guide              │                               │
│ ┌──────────────────────────┐ │                               │
│ │ [Photo] Marcus Thompson  │ │                               │
│ │ ★★★★★ 4.9 · 342 tours    │ │                               │
│ │ "I've been guiding tours │ │                               │
│ │ on St. Kitts for 12 years│ │                               │
│ │ and I love sharing the   │ │                               │
│ │ island's hidden gems."   │ │                               │
│ └──────────────────────────┘ │                               │
│                              │                               │
│ ─────────────────────────────│                               │
│                              │                               │
│ What Travelers Say (342)     │                               │
│ ┌──────────────────────────┐ │                               │
│ │ ★★★★★ "Best tour of our  │ │                               │
│ │ entire trip! Marcus was  │ │                               │
│ │ knowledgeable and fun."  │ │                               │
│ │ — Sarah & John, USA      │ │                               │
│ │                          │ │                               │
│ │ ★★★★★ "The snorkeling   │ │                               │
│ │ was incredible. We saw  │ │                               │
│ │ turtles and rays!"      │ │                               │
│ │ — Emma, UK              │ │                               │
│ └──────────────────────────┘ │                               │
│                              │                               │
│ ─────────────────────────────│                               │
│                              │                               │
│ Similar Adventures           │                               │
│ ┌──────┐ ┌──────┐ ┌──────┐ │                               │
│ │[Img] │ │[Img] │ │[Img] │ │                               │
│ │Brim- │ │Island│ │Sunset│ │                               │
│ │stone │ │Hop   │ │Sail  │ │                               │
│ │$65   │ │$145  │ │$89   │ │                               │
│ │4.8 ★ │ │4.7 ★ │ │4.9 ★ │ │                               │
│ └──────┘ └──────┘ └──────┘ │                               │
└──────────────────────────────┴───────────────────────────────┘
```

### Tour Conversion Psychology Applied
- **Price**: `$65 per person` (singular, explicit — not `$50-$80`)
- **CTA**: `Book Now • $130 Total` (total for 2 guests visible on button)
- **Day-of-week**: Dates shown as `Thursday, Jun 12` not `06/12`
- **Scarcity**: `👥 3 spots left for Jun 12` — urgency
- **Social proof**: `342 tours`, star rating, review quotes
- **Trust**: Guide profile with bio and photo
- **Free cancellation**: `🔒 Free cancellation until Jun 10` — reduces commitment fear
- **Response time**: `⏱ Response within 1hr` — sets expectation
- **Duration**: `3 hours` prominently displayed
- **Group size**: `Max 8 people` — manages expectations
- **Includes checklist**: ✅ icons for each included item
- **Cross-sell**: Similar adventures at bottom

---

## 4. Service Experience

### Service Listing Page
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [Service Hero — professional, clean, trust-focused]      │ │
│ │                                                          │ │
│ │  💆 Island Spa & Wellness                                │ │
│ │  Basseterre, St. Kitts │ ★★★★★ 4.9 (234 reviews)         │ │
│ │                                                          │ │
│ │  Massage │ Facial │ Body Treatment │ Couples             │ │
│ │                                                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
├──────────────────────────┬───────────────────────────────────┤
│                          │                                   │
│ Our Services             │ ┌─────────────────────────────┐   │
│                          │ │ Book an Appointment         │   │
│ ┌──────────────────────┐ │ │                             │   │
│ │ 💆 Deep Tissue Massage│ │ │ Service:                    │   │
│ │    $85 · 60 min      │ │ │ [Deep Tissue Massage ▾]    │   │
│ │    ★★★★★ (156)       │ │ │                             │   │
│ │    [Book • $85]      │ │ │ Date:                       │   │
│ └──────────────────────┘ │ │ [Thursday, Jun 14 ▾]       │   │
│                          │ │                             │   │
│ ┌──────────────────────┐ │ │ Time:                       │   │
│ │ 🧖 Hot Stone Therapy  │ │ │ [10:00 AM ▾]               │   │
│ │    $95 · 75 min      │ │ │                             │   │
│ │    ★★★★★ (89)        │ │ │ ─────────────────────────── │   │
│ │    [Book • $95]      │ │ │ Total: $85                  │   │
│ └──────────────────────┘ │ │                             │   │
│                          │ │ [Book Now • $85 Total]      │   │
│ ┌──────────────────────┐ │ │                             │   │
│ │ ✨ Facial Treatment   │ │ │ 🔒 Free cancellation       │   │
│ │    $65 · 45 min      │ │ │    until Jun 13             │   │
│ │    ★★★★☆ (67)        │ │ │ 📞 Response within 30 min   │   │
│ │    [Book • $65]      │ │ └─────────────────────────────┘   │
│ └──────────────────────┘ │                                   │
│                          │                                   │
│ ┌──────────────────────┐ │                                   │
│ │ 👫 Couples Package    │ │                                   │
│ │    $160 · 90 min     │ │                                   │
│ │    ★★★★★ (45)        │ │                                   │
│ │    [Book • $160]     │ │                                   │
│ └──────────────────────┘ │                                   │
│                          │                                   │
│ ─────────────────────────│                                   │
│                          │                                   │
│ About the Therapist      │                                   │
│ ┌──────────────────────┐ │                                   │
│ │ [Photo] Lisa James   │ │                                   │
│ │ Licensed Massage     │ │                                   │
│ │ Therapist · 8 years  │ │                                   │
│ │ ★★★★★ 4.9 · 234 appts│ │                                   │
│ └──────────────────────┘ │                                   │
│                          │                                   │
│ ─────────────────────────│                                   │
│                          │                                   │
│ Reviews (234)            │                                   │
│ ┌──────────────────────┐ │                                   │
│ │ ★★★★★ "Lisa is       │ │                                   │
│ │ amazing! The deep    │ │                                   │
│ │ tissue massage was   │ │                                   │
│ │ exactly what I needed│ │                                   │
│ │ after my flight."    │ │                                   │
│ │ — Maria R.           │ │                                   │
│ └──────────────────────┘ │                                   │
└──────────────────────────┴───────────────────────────────────┘
```

### Service Conversion Psychology Applied
- **Singular price**: `$85` not `$70-$100`
- **Duration**: `60 min` alongside price
- **CTA per service**: `Book • $85` — each service has its own CTA
- **Calendar booking**: Date + time picker inline
- **Day-of-week**: `Thursday, Jun 14` not `06/14`
- **Scarcity**: Limited time slots shown
- **Free cancellation**: `Free cancellation until Jun 13`
- **Therapist profile**: Licensed, years of experience, appointment count
- **Review count**: `(234 reviews)` on service page

---

## 5. Transport Experience

### Transport Listing Page
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [Map Preview — showing driver locations]                 │ │
│ │                                                          │ │
│ │  🚕 Island Transport                                     │ │
│ │  St. Kitts │ 247 drivers available                       │ │
│ │                                                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
├──────────────────────────────┬───────────────────────────────┤
│                              │                               │
│ Request a Ride               │ ┌─────────────────────────┐   │
│                              │ │  📍 Pickup              │   │
│ ┌──────────────────────────┐ │ │  [Frigate Bay Beach]    │   │
│ │ 📍 Pickup                │ │ │                         │   │
│ │ [Frigate Bay Beach    ]  │ │ │  📍 Drop-off            │   │
│ │                          │ │ │  [Robert L. Bradshaw    │   │
│ │ 📍 Drop-off              │ │ │   Airport]              │   │
│ │ [Robert L. Bradshaw   ]  │ │ │                         │   │
│ │ [Airport               ]  │ │ │  ─────────────────────  │   │
│ │                          │ │ │                         │   │
│ │ 🚕 Vehicle Type          │ │ │  Distance: 8.2 km      │   │
│ │                          │ │ │  Est time: 15 min      │   │
│ │ ○ Standard    $24        │ │ │                         │   │
│ │ ● Premium     $36        │ │ │  🚕 Premium Selected    │   │
│ │ ○ SUV         $42        │ │ │                         │   │
│ │ ○ Luxury      $65        │ │ │  Total: $36            │   │
│ │                          │ │ │                         │   │
│ │ [Estimate Fare]          │ │ │  [Book Ride • $36 Total]│   │
│ └──────────────────────────┘ │ │                         │   │
│                              │ │  🔒 Free cancellation   │   │
│ Active Drivers Near You:     │ │     up to 5 min         │   │
│ ┌──────────────────────────┐ │ │  👤 Driver: Marcus T.   │   │
│ │ 🚕 Marcus T. · 4.9 ★    │ │ │     2 min away          │   │
│ │    2 min away · White    │ │ │  💳 Pay on arrival or   │   │
│ │    Toyota Corolla        │ │ │     prepay now          │   │
│ │                          │ │ └─────────────────────────┘   │
│ │ 🚕 Sarah K. · 4.8 ★     │ │                               │
│ │    4 min away · Silver   │ │                               │
│ │    Honda Civic           │ │                               │
│ └──────────────────────────┘ │                               │
│                              │                               │
│ ─────────────────────────────│                               │
│                              │                               │
│ Why Ride With Us             │                               │
│ ┌──────────────────────────┐ │                               │
│ │ ✅ Verified drivers      │ │                               │
│ │ ✅ Real-time tracking    │ │                               │
│ │ ✅ Upfront pricing       │ │                               │
│ │ ✅ 24/7 availability     │ │                               │
│ │ ✅ Local knowledge       │ │                               │
│ └──────────────────────────┘ │                               │
└──────────────────────────────┴───────────────────────────────┘
```

### Transport Conversion Psychology Applied
- **Singular price**: `$24` not `$20-$30`
- **Driver proximity**: `2 min away` not `5-15 mins`
- **Vehicle options**: Clear pricing per vehicle type
- **CTA**: `Book Ride • $36 Total` — total on button
- **Free cancellation**: `Free cancellation up to 5 min`
- **Driver preview**: Photo, rating, car model, arrival time
- **Trust badges**: Verified drivers, real-time tracking, upfront pricing
- **Payment flexibility**: `Pay on arrival or prepay now`

---

## 6. Checkout Experience (Universal)

### Checkout Flow
```
Step 1: Order Summary
┌──────────────────────────────────────────────────────────────┐
│ Checkout                                          Step 1 of 3│
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Order Summary                                             │ │
│ │                                                          │ │
│ │ [Img] Frigate Bay Beach Tour × 2 ........... $130.00     │ │
│ │ [Img] Local Spice Box × 1 .................. $24.99      │ │
│ │ ─────────────────────────────────────────────            │ │
│ │ Subtotal: .................................. $154.99     │ │
│ │ Delivery: .................................. $0.00       │ │
│ │ Tax: ...................................... $0.00       │ │
│ │ ─────────────────────────────────────────────            │ │
│ │ Total: .................................... $154.99     │ │
│ │                                                          │ │
│ │ 🔒 Free cancellation until Jun 10                        │ │
│ │ 📞 Contact vendor: +1 (869) 555-0123                     │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Delivery Address                                             │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [Frigate Bay Hotel                                    ]  │ │
│ │ [Frigate Bay, St. Kitts                              ]  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│                              [Continue to Payment →]         │
└──────────────────────────────────────────────────────────────┘

Step 2: Payment
┌──────────────────────────────────────────────────────────────┐
│ Payment                                          Step 2 of 3│
│                                                              │
│ Payment Method                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ● Credit/Debit Card                                      │ │
│ │   [Card number                                    ]      │ │
│ │   [MM/YY] [CVC]                                         │ │
│ │                                                          │ │
│ │ ○ Fygaro Pay (Pay on Arrival)                            │ │
│ │ ○ Crypto (BTC/USDT)                                      │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🔒 Secure payment powered by Fygaro                      │ │
│ │ ✓ Your payment information is encrypted                   │ │
│ │ ✓ We never store your card details                        │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│                           [Pay • $154.99 Total]              │
└──────────────────────────────────────────────────────────────┘

Step 3: Confirmation
┌──────────────────────────────────────────────────────────────┐
│ ✓ Confirmation                                               │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │                        ✓                                 │ │
│ │              Order Confirmed!                            │ │
│ │                                                          │ │
│ │  Order #IH-2026-8472                                     │ │
│ │  Total: $154.99                                          │ │
│ │                                                          │ │
│ │  📧 Confirmation sent to john@email.com                  │ │
│ │  📱 SMS updates enabled                                  │ │
│ │                                                          │ │
│ │  ─────────────────────────────────────────               │ │
│ │                                                          │ │
│ │  Next Steps:                                             │ │
│ │  1. Vendor will confirm within 1 hour                    │ │
│ │  2. You'll receive pickup/tour details via SMS           │ │
│ │  3. Track your order in My Account                       │ │
│ │                                                          │ │
│ │  ─────────────────────────────────────────               │ │
│ │                                                          │ │
│ │  [View Order] [Continue Shopping] [Track Order]          │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Booking Widget (Reusable Component)

The booking widget appears on the right side of all listing detail pages. It adapts per type:

```
┌─────────────────────────────────┐
│ PRICE & BOOKING                  │
│                                  │
│ PRODUCT:                         │
│ $24.99                           │
│ Qty: [1 ▾]                       │
│ [Add to Cart • $24.99]           │
│ [Buy Now • $24.99]              │
│                                  │
│ TOUR:                            │
│ $65 per person                   │
│ 📅 [Thu, Jun 12 ▾]             │
│ 👥 [2 ▾]                        │
│ ─────────────────                │
│ Subtotal: $130                   │
│ [Book Now • $130 Total]         │
│ 🔒 Free cancellation until Jun 10│
│                                  │
│ SERVICE:                         │
│ Deep Tissue Massage · $85       │
│ 📅 [Thu, Jun 14 ▾]             │
│ ⏰ [10:00 AM ▾]                │
│ ─────────────────                │
│ Total: $85                       │
│ [Book Now • $85 Total]          │
│ 🔒 Free cancellation until Jun 13│
│                                  │
│ TRANSPORT:                       │
│ 📍 [Pickup]                     │
│ 📍 [Drop-off]                   │
│ 🚕 Standard · $24               │
│ 🚕 Premium · $36                │
│ ─────────────────                │
│ 8.2 km · 15 min                 │
│ Total: $24                       │
│ [Book Ride • $24 Total]         │
│ 🔒 Free cancellation up to 5 min │
│                                  │
│ FOOD:                            │
│ Delivery to: [Frigate Bay ▾]    │
│ ─────────────────                │
│ Subtotal: $26                    │
│ Delivery: $0 (Free)             │
│ ─────────────────                │
│ Total: $26                       │
│ [Checkout • $26 Total]          │
│ 🚕 Driver 4 mins away           │
│ ⏱ Ready in 25-35 mins           │
└─────────────────────────────────┘

Common elements:
• Sticky on scroll (follows user down the page)
• Always shows total on CTA button
• Free cancellation policy visible
• Trust badges below CTA
• Urgency signals where applicable
```

---

## 8. Trust & Verification System

### Trust Badges (appear on all listing pages)
```
┌─────────────────────────────────┐
│ 🔒 Secure Payment              │
│ ✓ Verified Vendor              │
│ 🔄 Free Cancellation           │
│ 💬 24/7 Support               │
│ ⭐ 30-Day Guarantee            │
│ 🚚 Insured Delivery            │
└─────────────────────────────────┘
```

### Vendor Verification Levels
```
🥉 Basic: Email verified
🥈 Verified: ID + Business registration checked  
🥇 Premium: All checks + Insurance + Background check
👑 Featured: Premium + Top performer + 100+ reviews
```

### Review Display Format
```
┌──────────────────────────────────────────────────────────────┐
│ ★★★★★ 4.9 · 342 reviews                                     │
│                                                              │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│ │ Cleanliness │ Accuracy    │ Value       │ Service     │   │
│ │ 4.9         │ 4.8         │ 4.7         │ 4.9         │   │
│ │ █████████   │ ████████    │ ████████    │ █████████   │   │
│ └─────────────┴─────────────┴─────────────┴─────────────┘   │
│                                                              │
│ Sarah M. · Jun 2026                                          │
│ ★★★★★ "Amazing experience! Marcus was knowledgeable and     │
│ fun. The snorkeling was incredible."                         │
│ [📷 3 photos]                                                │
│                                                              │
│ John D. · May 2026                                           │
│ ★★★★★ "Perfect for families. Kids loved it. Would           │
│ definitely book again."                                      │
│                                                              │
│ [Load More Reviews]                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Mobile Experience

### Mobile Listing Page
```
┌──────────────────────────────┐
│ ← Frigate Bay Tour     [♡]  │
├──────────────────────────────┤
│                              │
│ [Full-width hero image]      │
│                              │
│ ◀ ● ● ● ▶                   │
│                              │
├──────────────────────────────┤
│ Frigate Bay Beach Tour       │
│ St. Kitts │ ★★★★★ 4.9 (342)  │
│ 3 hours │ Max 8 │ All ages  │
│                              │
│ From $65 per person          │
│                              │
│ [Book Now] ← sticky bottom   │
├──────────────────────────────┤
│ About                        │
│ ┌──────────────────────────┐ │
│ │ Discover the pristine... │ │
│ └──────────────────────────┘ │
│                              │
│ What's Included              │
│ ┌──────────────────────────┐ │
│ │ ✅ Expert guide          │ │
│ │ ✅ Snorkeling equipment  │ │
│ └──────────────────────────┘ │
│                              │
│ Your Guide                   │
│ ┌──────────────────────────┐ │
│ │ [Photo] Marcus T.        │ │
│ │ ★★★★★ 4.9 · 342 tours    │ │
│ └──────────────────────────┘ │
│                              │
│ Reviews (342)                │
│ ★★★★★ "Best tour!" — Sarah  │
│ ★★★★★ "Incredible!" — Emma  │
│ [See All]                    │
│                              │
├──────────────────────────────┤
│ $65 per person               │
│ 📅 Thu, Jun 12 · 2 guests   │
│ ─────────────────            │
│ Total: $130                  │
│ [Book Now • $130 Total]      │
│ 🔒 Free cancellation         │
└──────────────────────────────┘
```

### Mobile-Specific Patterns
- **Sticky booking bar**: Price + CTA fixed at bottom of screen
- **Tap to expand**: Description, inclusions, reviews are collapsible sections
- **Swipe gallery**: Image carousel with swipe gestures
- **Bottom sheet**: Date picker, guest selector open as bottom sheets
- **Floating action button**: "Book Now" FAB when booking widget scrolls off screen

---

## 10. Conversion Optimization Checklist

Per listing type:

### Food ✅
- [ ] Singular prices on menu items
- [ ] Time estimates (not ranges) with driver proximity
- [ ] CTA with total: `Checkout • $26 Total`
- [ ] Live status: `● Open · Closes 9PM`
- [ ] Social proof per item: `★★★★★ (234)`
- [ ] Free delivery threshold visible
- [ ] Real-time availability: `⏱ Ready in 25-35 mins`

### Products ✅
- [ ] Singular prices: `$24.99` not `$20-$30`
- [ ] CTA with total: `Add to Cart • $24.99`
- [ ] Stock status: `In stock · Ships today`
- [ ] Delivery timeline: `Free delivery by Thu`
- [ ] Trust badges: Free shipping, 30-day returns, handmade guarantee
- [ ] Review display: Star count + review count + quotes
- [ ] Visual: Hero image (not thumbnail)
- [ ] Cross-sell: Similar products

### Tours ✅
- [ ] Price per person: `$65 per person`
- [ ] Day-of-week dates: `Thu, Jun 12` not `06/12`
- [ ] Duration: `3 hours` prominently
- [ ] Group size: `Max 8 people`
- [ ] CTA with total: `Book Now • $130 Total`
- [ ] Scarcity: `3 spots left`
- [ ] Free cancellation: Visible until date
- [ ] Guide profile: Photo, name, bio, tour count
- [ ] Includes checklist: ✅ icons
- [ ] Reviews: Star count + quotes

### Services ✅
- [ ] Singular prices per service
- [ ] Duration per service: `60 min`
- [ ] Inline date/time picker
- [ ] Day-of-week dates
- [ ] CTA with total: `Book Now • $85 Total`
- [ ] Therapist profile: Licensed, years, appointment count
- [ ] Free cancellation until date
- [ ] Response time: `Response within 30 min`

### Transport ✅
- [ ] Singular prices per vehicle type
- [ ] Driver proximity: `2 min away`
- [ ] Vehicle options with clear pricing
- [ ] Distance + estimated time
- [ ] CTA with total: `Book Ride • $24 Total`
- [ ] Free cancellation: `Up to 5 min`
- [ ] Driver preview: Photo, rating, car model
- [ ] Trust badges: Verified, upfront pricing, real-time tracking

### Checkout (Universal) ✅
- [ ] All-inclusive pricing (tax, fees shown upfront)
- [ ] Free cancellation policy visible
- [ ] Total on every CTA: `Pay • $154.99 Total`
- [ ] Trust badges: Secure payment, encrypted
- [ ] Multiple payment methods: Card, Fygaro, Crypto
- [ ] Order confirmation with next steps
- [ ] SMS + Email confirmation

---

## Segment-Specific Theming for Experiences

| Hub | Psychology | Visual Treatment | CTA Style |
|-----|------------|-----------------|-----------|
| **Food** | Urgency | Warm orange→red, high-saturation imagery, real-time tickers | `Order Now • $X` with time estimate |
| **Products** | Discovery | Emerald/teal, exploratory layout, rich imagery | `Add to Cart • $X` with stock status |
| **Services** | Trust | Blue, clean grids, transparent pricing | `Book Now • $X` with duration |
| **Tours** | Discovery | Emerald/cyan, immersive hero, curiosity-driven | `Book Now • $X` with spots left |
| **Transport** | Trust | Sky blue, crisp UI, insurance badges | `Book Ride • $X` with driver ETA |
| **Rentals** | Trust | Blue/teal, insurance badges, clear logistics | `Reserve • $X` with free cancellation |
| **Campaigns** | FOMO | Rose→orange, countdown timers, high contrast | `Get Tickets • $X` with urgency |

---

## Files to Create/Update

### Listing Pages (Customer-Facing)
- `islandhub/web/src/app/listings/[id]/page.tsx` — Enhance with booking widget, trust badges, reviews
- `islandhub/web/src/app/food/[slug]/page.tsx` — Food-specific store + menu page
- `islandhub/web/src/app/tour/[id]/page.tsx` — Enhance with booking widget, guide profile, reviews
- `islandhub/web/src/app/services/[slug]/page.tsx` — Service booking page with calendar

### Booking Widget (Reusable)
- `islandhub/web/src/components/booking/BookingWidget.tsx` — Universal booking widget
- `islandhub/web/src/components/booking/DatePicker.tsx` — Day-of-week date picker
- `islandhub/web/src/components/booking/GuestSelector.tsx` — Guest count selector
- `islandhub/web/src/components/booking/PriceDisplay.tsx` — Singular price + total
- `islandhub/web/src/components/booking/TrustBadges.tsx` — Universal trust badge strip

### Trust & Social Proof
- `islandhub/web/src/components/trust/ReviewCard.tsx` — Review display card
- `islandhub/web/src/components/trust/ReviewSummary.tsx` — Star breakdown
- `islandhub/web/src/components/trust/VerificationBadge.tsx` — Vendor verification level
- `islandhub/web/src/components/trust/ScarcityIndicator.tsx` — "X spots left" urgency

### Cart & Checkout
- `islandhub/web/src/components/cart/CartItem.tsx` — Enhanced cart item
- `islandhub/web/src/components/cart/CartSummary.tsx` — Price breakdown
- `islandhub/web/src/components/checkout/CheckoutFlow.tsx` — Multi-step checkout
- `islandhub/web/src/components/checkout/PaymentMethod.tsx` — Fygaro/crypto/card
- `islandhub/web/src/components/checkout/OrderConfirmation.tsx` — Confirmation page
