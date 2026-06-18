# IBT Solutions & IslandHub - Design System

Inspired by Google Stitch DESIGN.md format. A custom Caribbean-inspired design system for building consistent UI across IBT Solutions and IslandHub platforms.

---

## Visual Theme & Atmosphere

**Philosophy**: Tropical Premium meets Technical Precision

The design draws from Caribbean geography and culture while maintaining the professional feel of top tech platforms. Ocean blues blend with sunset oranges, creating a warm yet professional aesthetic. The system balances warmth (Caribbean hospitality) with precision (modern tech platforms).

**Density**: Medium - comfortable spacing with clear visual hierarchy

**Motion**: Subtle, purposeful animations. No excessive movement. Respect 200ms minimum transition times.

---

## Color Palette

### Core Colors

| Token | Hex | Role | Usage |
|-------|-----|------|-------|
| `--ocean-900` | `#0A1628` | Primary Dark | Main backgrounds, headers |
| `--ocean-800` | `#0F2744` | Dark | Cards, elevated surfaces |
| `--ocean-700` | `#1A3A5C` | Medium Dark | Borders, dividers |
| `--ocean-600` | `#264D73` | Medium | Secondary elements |
| `--ocean-500` | `#0066CC` | Primary | Primary actions, links |
| `--ocean-400` | `#3388E0` | Primary Light | Hover states |
| `--ocean-300` | `#80B3E8` | Light | Secondary text, icons |

### Accent Colors

| Token | Hex | Role | Usage |
|-------|-----|------|-------|
| `--sunset-600` | `#D94E1F` | Bold Accent | Urgent, important |
| `--sunset-500` | `#FF6B35` | Primary Accent | CTAs, highlights |
| `--sunset-400` | `#FF8A5C` | Accent Light | Hover, secondary actions |
| `--coral-500` | `#FF6B6B` | Soft Accent | Alerts, notifications |
| `--turquoise-500` | `#40E0D0` | Success | Success states, positive |

### Neutral Colors

| Token | Hex | Role | Usage |
|-------|-----|------|-------|
| `--sand-50` | `#FDFBF7` | Lightest | Light backgrounds |
| `--sand-100` | `#F5EFE6` | Light | Card backgrounds |
| `--sand-200` | `#E8DFD0` | Light Border | Borders |
| `--sand-300` | `#C9BBA8` | Muted | Placeholder text |
| `--slate-500` | `#64748B` | Secondary | Body text |
| `--slate-700` | `#334155` | Primary Text | Headings |
| `--slate-900` | `#0F172A` | Dark Text | Primary content |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#10B981` | Success states |
| `--warning` | `#F59E0B` | Warnings |
| `--error` | `#EF4444` | Errors |
| `--info` | `#3B82F6` | Informational |

---

## Light Mode Palette

| Token | Hex | Role |
|-------|-----|------|
| `--bg-primary` | `#FFFFFF` | Main background |
| `--bg-secondary` | `#F8FAFC` | Secondary surfaces |
| `--bg-tertiary` | `#F1F5F9` | Tertiary surfaces |
| `--text-primary` | `#0F172A` | Primary text |
| `--text-secondary` | `#475569` | Secondary text |
| `--text-muted` | `#94A3B8` | Muted text |
| `--border` | `#E2E8F0` | Borders |

---

## Dark Mode Palette

| Token | Hex | Role |
|-------|-----|------|
| `--bg-primary` | `#0A1628` | Main background |
| `--bg-secondary` | `#0F2744` | Secondary surfaces |
| `--bg-tertiary` | `#1A3A5C` | Tertiary surfaces |
| `--text-primary` | `#F8FAFC` | Primary text |
| `--text-secondary` | `#CBD5E1` | Secondary text |
| `--text-muted` | `#64748B` | Muted text |
| `--border` | `#264D73` | Borders |

---

## Theme Modes (Beyond Dark/Light)

### Ocean Theme
- Primary: Ocean blues
- Background: Deep sea dark / bright horizon
- Best for: Professional services, B2B

### Sunset Theme
- Primary: Orange/coral accents
- Background: Warm tones
- Best for: Tourism, lifestyle, hospitality

### Emerald Theme
- Primary: Palm greens
- Background: Deep jungle / fresh green
- Best for: Environment, eco-tourism, nature

### Coral Reef Theme
- Primary: Coral and turquoise
- Background: Underwater blues
- Best for: Marine, beach, water sports

---

## Typography

### Font Families

**Primary Font** (Headings & UI):
```
font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

**Monospace Font** (Code & Technical):
```
font-family: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace
```

### Type Scale

| Level | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| Display | 48px / 3rem | 1.1 | 800 | Hero headlines |
| H1 | 36px / 2.25rem | 1.2 | 700 | Page titles |
| H2 | 30px / 1.875rem | 1.25 | 700 | Section headers |
| H3 | 24px / 1.5rem | 1.3 | 600 | Subsection |
| H4 | 20px / 1.25rem | 1.4 | 600 | Card titles |
| Body Large | 18px / 1.125rem | 1.6 | 400 | Lead paragraphs |
| Body | 16px / 1rem | 1.6 | 400 | Standard text |
| Body Small | 14px / 0.875rem | 1.5 | 400 | Secondary text |
| Caption | 12px / 0.75rem | 1.4 | 500 | Labels, badges |
| Overline | 11px / 0.6875rem | 1.3 | 600 | Category labels |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Emphasis, UI labels |
| Semibold | 600 | Headings, buttons |
| Bold | 700 | Strong emphasis |
| Black | 800 | Display, hero |

---

## Component Styling

### Buttons

**Primary Button**:
```css
background: var(--ocean-500);
color: white;
border-radius: 12px;
padding: 12px 24px;
font-weight: 600;
transition: all 0.2s ease;
```
Hover: `background: var(--ocean-400)`

**Secondary Button**:
```css
background: transparent;
color: var(--ocean-500);
border: 2px solid var(--ocean-500);
border-radius: 12px;
padding: 12px 24px;
font-weight: 600;
```
Hover: `background: var(--ocean-500); color: white`

**Accent Button**:
```css
background: var(--sunset-500);
color: white;
border-radius: 12px;
padding: 12px 24px;
font-weight: 600;
```
Hover: `background: var(--sunset-400)`

**Ghost Button**:
```css
background: transparent;
color: var(--slate-500);
border-radius: 12px;
padding: 12px 24px;
font-weight: 500;
```
Hover: `background: var(--bg-tertiary); color: var(--text-primary)`

### Button Sizes

| Size | Padding | Font Size | Border Radius |
|------|---------|-----------|---------------|
| sm | 8px 16px | 14px | 8px |
| md | 12px 24px | 16px | 12px |
| lg | 16px 32px | 18px | 16px |
| xl | 20px 40px | 20px | 20px |

### Cards

```css
background: var(--bg-secondary);
border: 1px solid var(--border);
border-radius: 16px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0,0,0,0.05);
```

**Card Hover**:
```css
transform: translateY(-2px);
box-shadow: 0 8px 30px rgba(0,0,0,0.12);
border-color: var(--ocean-500);
```

### Form Inputs

```css
background: var(--bg-primary);
border: 1px solid var(--border);
border-radius: 12px;
padding: 12px 16px;
font-size: 16px;
color: var(--text-primary);
transition: all 0.2s ease;
```

**Input Focus**:
```css
border-color: var(--ocean-500);
box-shadow: 0 0 0 3px var(--ocean-500 / 0.2);
```

**Input Error**:
```css
border-color: var(--error);
box-shadow: 0 0 0 3px var(--error / 0.2);
```

### Navigation

**Top Nav**:
```css
background: var(--bg-primary / 0.8);
backdrop-filter: blur(12px);
border-bottom: 1px solid var(--border);
height: 64px;
padding: 0 24px;
```

**Sidebar**:
```css
background: var(--bg-secondary);
width: 280px;
border-right: 1px solid var(--border);
```

### Badges & Tags

```css
background: var(--ocean-500 / 0.1);
color: var(--ocean-500);
border-radius: 100px;
padding: 4px 12px;
font-size: 12px;
font-weight: 600;
```

**Status Badge Variants**:
- Success: `background: var(--success / 0.1); color: var(--success)`
- Warning: `background: var(--warning / 0.1); color: var(--warning)`
- Error: `background: var(--error / 0.1); color: var(--error)`
- Info: `background: var(--info / 0.1); color: var(--info)`

---

## Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing |
| `--space-2` | 8px | Component internal |
| `--space-3` | 12px | Related elements |
| `--space-4` | 16px | Standard padding |
| `--space-5` | 20px | Section padding |
| `--space-6` | 24px | Card padding |
| `--space-8` | 32px | Section gaps |
| `--space-10` | 40px | Major sections |
| `--space-12` | 48px | Hero spacing |
| `--space-16` | 64px | Page margins |
| `--space-20` | 80px | Large gaps |
| `--space-24` | 96px | Full sections |

### Grid System

**Container**:
```css
max-width: 1280px;
padding: 0 24px;
margin: 0 auto;
```

**Grid**:
```css
display: grid;
gap: 24px;
```

| Grid Type | Columns |
|-----------|---------|
| Mobile | 1 column |
| Tablet | 2 columns |
| Desktop | 3 columns |
| Wide | 4 columns |

### Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| xs | 480px | Large phones |
| sm | 640px | Tablets portrait |
| md | 768px | Tablets landscape |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Wide screens |

---

## Depth & Elevation

### Shadow Scale

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);
--shadow-glow: 0 0 40px rgba(0, 102, 204, 0.3);
```

### Layer Hierarchy

| Layer | Elevation | Usage |
|-------|-----------|-------|
| Base | 0 | Page background |
| Card | 1 | Content cards |
| Dropdown | 2 | Menus, popovers |
| Sticky | 3 | Navigation |
| Modal | 4 | Dialogs, modals |
| Toast | 5 | Notifications |

### Gradients

**Hero Gradient**:
```css
background: linear-gradient(135deg, var(--ocean-900) 0%, var(--ocean-800) 50%, var(--sunset-600) 100%);
```

**Card Gradient**:
```css
background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
```

**Accent Glow**:
```css
background: radial-gradient(circle at center, var(--ocean-500 / 0.2) 0%, transparent 70%);
```

---

## Do's and Don'ts

### Do
✅ Use semantic color tokens for consistent meaning
✅ Maintain 16px minimum touch targets on mobile
✅ Use clear visual hierarchy (size, weight, color)
✅ Include adequate whitespace (minimum 24px between sections)
✅ Use icons consistently with the platform style
✅ Support both dark and light modes
✅ Follow the spacing scale exactly

### Don't
❌ Use arbitrary colors outside the palette
❌ Create custom font sizes outside the type scale
❌ Use shadows for non-interactive elements
❌ Mix different border radius values on the same page
❌ Use more than 3 font weights on a single page
❌ Create custom spacing values not in the spacing scale
❌ Use pure black (#000000) or pure white (#FFFFFF)

---

## Responsive Behavior

### Mobile-First Approach
- Design mobile first, then expand
- Use the spacing scale to maintain consistency
- Stack grids to single column on mobile
- Touch targets minimum 44x44px

### Collapsing Strategy
- Navigation: Hamburger menu on mobile
- Cards: Reduce padding on mobile (16px vs 24px)
- Hero: Reduce text size, stack content
- Forms: Full width inputs

### Touch Optimization
- Minimum 44x44px touch targets
- 8px minimum spacing between targets
- Avoid hover-only interactions
- Support swipe gestures where appropriate

---

## IslandHub Section Variations

### Marketplace (Amazon/eBay inspired)
- Use standard palette
- Product cards with clear pricing
- Search-focused header

### Rentals (Airbnb inspired)
- More imagery, larger cards
- Calendar date picker integration
- Map integration prominent

### Transport (Uber inspired)
- Map-centric interface
- Quick action buttons
- Status tracking UI

### Auctions (WhatNot inspired)
- Countdown timers prominent
- Bid history display
- Live indicator styling
- Urgency color accents (sunset)

### Community (Instagram/Facebook inspired)
- Feed-centric layout
- Avatar-focused
- Like/comment interaction buttons
- Story format at top

### Stores (Shopify inspired)
- Store header with branding
- Product grid layout
- Clear CTA buttons

---

## Agent Prompt Guide

When using this design system in an AI agent, use these prompts:

**For a landing page:**
```
Create a landing page using DESIGN.md as the visual reference. 
Include a hero section with gradient background, services grid with image cards, 
partner ecosystem section, and footer. Use the ocean theme with sunset accents.
```

**For a dashboard:**
```
Build a dashboard layout with sidebar navigation, top header with user menu, 
and main content area. Use card components for data display. 
Follow the dark mode palette.
```

**For a mobile-first component:**
```
Create a mobile-responsive card component that works on all breakpoints. 
Use the spacing scale for padding. Include touch-friendly interactions (44px targets).
```

---

## Preview Files

See companion preview files for visual reference:
- `preview.html` - Light mode preview
- `preview-dark.html` - Dark mode preview

---

*This design system is custom-created for IBT Solutions and IslandHub. 
Not affiliated with any mentioned brands. Design inspiration only.*