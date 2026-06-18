# IslandHub — Cleanup & Optimization Plan

## PHASE 1: Old Pages to Remove/Redirect

### Old marketplace pages (now replaced by /hub/* routes)
| Old Path | New Path | Action |
|----------|----------|--------|
| `/stores` | `/hub` | ✅ Already redirected in next.config.mjs |
| `/food` | `/hub/food` | ✅ Already redirected |
| `/products` | `/hub/products` | ✅ Already redirected |
| `/rentals` | `/hub/rentals` | ✅ Already redirected |
| `/tours` | `/hub/tours` | ✅ Already redirected |
| `/listings` | `/hub` | ✅ Already redirected |
| `/services` | `/hub/services` | ❌ MISSING — needs redirect |
| `/events` | `/hub/events` | ❌ MISSING — needs redirect |
| `/campaigns` | `/hub/campaigns` | ❌ MISSING — needs redirect |
| `/community` | `/hub/community` | ❌ MISSING — needs redirect |
| `/transport` | `/hub/transport` | ❌ MISSING — needs redirect |

### Old rental sub-pages (now in /hub/rentals/*)
| Old Path | New Path | Action |
|----------|----------|--------|
| `/rental-hub` | `/hub/rentals` | Delete |
| `/rental-hub/stays` | `/hub/rentals/stays` | Delete |
| `/rental-hub/vehicles` | `/hub/rentals/cars` | Delete |
| `/rental-hub/sea-rentals` | `/hub/rentals/sea` | Delete |
| `/rental-hub/equipment-tools` | `/hub/rentals/tools` | Delete |
| `/rental-hub/property` | `/hub/rentals/longterm` | Delete |
| `/rentals/[id]` | `/hub/rentals/stays/[slug]` | Delete |
| `/rentals/providers` | `/hub/rentals` | Delete |

### Old event pages (now in /hub/events/*)
| Old Path | New Path | Action |
|----------|----------|--------|
| `/events` | `/hub/events` | Delete |
| `/events/[id]` | `/hub/events/community/[slug]` | Delete |
| `/events/create` | `/hub/events/create` | Keep (creation page) |
| `/events/my-tickets` | `/hub/events/my-tickets` | Keep |
| `/events/verify` | `/hub/events/verify` | Keep |

### Old community pages (now in /hub/community/*)
| Old Path | New Path | Action |
|----------|----------|--------|
| `/community` | `/hub/community` | Delete page, keep redirect |
| `/community/events` | `/hub/community/events` | Delete |
| `/community/groups` | `/hub/community/groups` | Delete |
| `/community/stories` | `/hub/community/stories` | Delete |
| `/community/auctions` | TBD | Delete or keep |
| `/community/business` | TBD | Delete or keep |
| `/community/coops` | TBD | Delete or keep |
| `/community/jobs` | TBD | Delete or keep |
| `/community/map` | TBD | Delete or keep |
| `/community/marketplace` | TBD | Delete or keep |
| `/community/messages` | TBD | Delete or keep |

### Old IBT Solutions pages (standalone store pages)
| Path | Action |
|------|--------|
| `/store/ibt-solutions/coops` | Keep — IBT-specific |
| `/store/ibt-solutions/coops/[slug]` | Keep — IBT-specific |
| `/store/ibt-solutions/services/[slug]` | Keep — IBT-specific |

### Potentially unused standalone pages
| Path | Status | Action |
|------|--------|--------|
| `/about` | Legal/info | Keep |
| `/contact` | Support | Keep |
| `/faq` | Support | Keep |
| `/help` | Support | Keep |
| `/how-it-works` | Onboarding | Keep |
| `/pricing` | Info | Keep |
| `/privacy` | Legal | Keep |
| `/terms` | Legal | Keep |
| `/suspended` | Status | Keep |
| `/safety` | Info | Keep |
| `/start` | Onboarding | Review |
| `/create` | Listing creation | Keep |
| `/become-vendor` | Vendor onboarding | Keep |
| `/brands` | Brand directory | Review — duplicate? |
| `/browse` | Browse listings | Review — duplicate of /hub? |
| `/shop` | Shop page | Review — duplicate? |
| `/vendors` | Vendor list | Review — duplicate? |
| `/vendors/[id]` | Vendor detail | Review — duplicate? |
| `/dispatch` | Dispatch | Review |
| `/driver-hub` | Driver | Review — duplicate of /driver? |
| `/rent` | Rent | Review — duplicate? |
| `/fund` | Fund | Review |
| `/book` | Book | Review |

---

## PHASE 2: Old Components to Review

### Potentially unused/duplicate components
| Component | Location | Status |
|-----------|----------|--------|
| `BrandMarquee` | components/BrandMarquee.tsx | Used in HubPage, homepage — KEEP |
| `HeroBackground` | components/HeroBackground.tsx | Used in homepage, hub pages — KEEP |
| `ParticleHero` | components/ParticleHero.tsx | Used? Review |
| `ShaderHero` | components/ShaderHero.tsx | Used? Review |
| `ListingCard` | components/ListingCard.tsx | Used in homepage, hub pages — KEEP |
| `ListingCard3D` | components/ListingCard3D.tsx | Used? Review |
| `ListingClient` | components/ListingClient.tsx | Used? Review |
| `ListingFilters` | components/ListingFilters.tsx | Used? Review |
| `RequestServicesSection` | components/RequestServicesSection.tsx | Used in homepage — KEEP |
| `IslandPulse` | components/IslandPulse.tsx | Used in homepage — KEEP |
| `VendorSpotlight` | components/marketplace/VendorSpotlight.tsx | Used in homepage — KEEP |
| `SmartSearch` | components/search/SmartSearch.tsx | Used in homepage — KEEP |
| `RecommendedForYou` | components/recommendations/RecommendedForYou.tsx | Used in homepage — KEEP |
| `IBTSolutionsLayout` | components/marketplace/IBTSolutionsLayout.tsx | Used? Review |
| `StoreLayouts` | components/marketplace/StoreLayouts.tsx | Used? Review |
| `ProductLayout` | components/marketplace/layouts/ProductLayout.tsx | Used? Review |
| `RentalLayout` | components/marketplace/layouts/RentalLayout.tsx | Used? Review |
| `ServiceLayout` | components/marketplace/layouts/ServiceLayout.tsx | Used? Review |
| `FoodShopLayout` | components/marketplace/layouts/FoodShopLayout.tsx | Used? Review |
| `MarketplaceHero` | components/marketplace/MarketplaceHero.tsx | Used? Review |
| `MarketplaceTopBar` | components/marketplace/MarketplaceTopBar.tsx | Used? Review |
| `SponsorSection` | components/marketplace/SponsorSection.tsx | Used? Review |
| `BadgeSelector` | components/marketplace/BadgeSelector.tsx | Used? Review |
| `CategorySection` | components/marketplace/CategorySection.tsx | Used? Review |
| `DynamicForm` | components/marketplace/DynamicForm.tsx | Used? Review |
| `DynamicProductForm` | components/marketplace/DynamicProductForm.tsx | Used? Review |
| `ServiceBookingModal` | components/marketplace/ServiceBookingModal.tsx | Used? Review |
| `FoodSelectionModal` | components/marketplace/FoodSelectionModal.tsx | Used? Review |
| `GuestWelcomeModal` | components/marketplace/GuestWelcomeModal.tsx | Used? Review |
| `KitchenSidebar` | components/marketplace/KitchenSidebar.tsx | Used? Review |
| `ProductListing` | components/listings/ProductListing.tsx | Used? Review |
| `AgentChat` | components/AgentChat.tsx | Used? Review |
| `ChatWindow` | components/ChatWindow.tsx | Used? Review |
| `DeliveryChat` | components/DeliveryChat.tsx | Used? Review |
| `WiPayButton` | components/WiPayButton.tsx | Used? Review |
| `PayPalButton` | components/PayPalButton.tsx | Used? Review |
| `CryptoPayment` | components/CryptoPayment.tsx | Used in checkout — KEEP |
| `AvailabilityCalendar` | components/AvailabilityCalendar.tsx | Used? Review |
| `RatingModal` | components/RatingModal.tsx | Used? Review |
| `ReviewSection` | components/ReviewSection.tsx | Used? Review |
| `ShareButtons` | components/ShareButtons.tsx | Used? Review |
| `TypeBadge` | components/TypeBadge.tsx | Used? Review |
| `MobileConnect` | components/MobileConnect.tsx | Used? Review |
| `CommunityTopBar` | components/CommunityTopBar.tsx | Used? Review |
| `CreateListingModal` | components/CreateListingModal.tsx | Used? Review |
| `FounderPhoto` | components/FounderPhoto.tsx | Used? Review |
| `ImageUpload` | components/ImageUpload.tsx | Used in create — KEEP |
| `RoleSwitcher` | components/RoleSwitcher.tsx | Used? Review |
| `LayoutGates` | components/LayoutGates.tsx | Used? Review |
| `NaturalLanguageSearch` | components/NaturalLanguageSearch.tsx | Used? Review |

---

## PHASE 3: Homepage Sections to Optimize

### Current homepage structure (in order):
1. **HeroBackground** — full-screen hero with gradient, title, subtitle, search bar, CTA buttons
2. **RequestServicesSection** — quick service links (taxi, food, delivery)
3. **Interstitial Ad** — banner ad space
4. **Marketplace Section** — large 2-column layout with category count cards (links to old /food, /products, /rentals, /services)
5. **IBT Solutions Section** — business solutions promo (links to old /store/ibt-solutions)
6. **Featured Campaigns** — 3 campaign cards in 1-col mobile, 3-col desktop
7. **Signature Experiences (Tours)** — 3 tour cards
8. **Brand Marquee** — scrolling brand logos
9. **Island Rentals** — 3 rental cards with large images
10. **Vendor Spotlight** — featured vendors
11. **Subscription Teaser** — membership upsell
12. **RecommendedForYou** — personalized recommendations
13. **RecentlyViewedSection** — recently viewed listings
14. **Footer** — site footer

### Required optimizations:
1. **Hero** → Replace with Best Buy-style HeroSlider (manual carousel, pagination dots)
2. **Marketplace section** → Links point to old paths (/food, /products, /rentals, /services) — update to /hub/*
3. **Category count cards** → Optimize for mobile (2-col grid, smaller cards)
4. **Featured Campaigns** → Change from 1-col mobile to 2-col Amazon-style grid
5. **Tours/Rentals sections** → Change from 1-col mobile to 2-col Amazon-style grid
6. **IBT Section** — Update links from /store/ibt-solutions to /hub/services
7. **Add CarouselSection** — Add "Trending Now" horizontal scroll section
8. **Add DealCard grid** — "Hot Deals" 2-col section with deal cards
9. **Add CategoryTiles** — "Shop by Category" 3-col tile grid
10. **Spacing** — Reduce py-16/py-24 to py-8/py-12 on mobile
11. **Section headers** — Reduce text-4xl/text-6xl to text-2xl/text-3xl on mobile
