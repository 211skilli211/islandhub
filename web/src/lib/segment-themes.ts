/**
 * Per-Segment Theme Token Overrides
 * 
 * Each segment maps to a psychological atmosphere per the Hub Overhaul Blueprint.
 * These overrides are applied as CSS custom properties on the segment wrapper,
 * cascading down to all children — no component-level prop drilling needed.
 */

export type SegmentKey = 'food' | 'products' | 'services' | 'tours' | 'transport' | 'rentals' | 'campaigns' | 'default';

export interface SegmentThemeTokens {
  /** Primary accent — CTAs, links, active states */
  accent: string;
  /** Secondary accent — hover states, secondary actions */
  accentHover: string;
  /** Muted accent — subtle highlights, badges */
  accentMuted: string;
  /** Hero gradient start */
  gradientFrom: string;
  /** Hero gradient end */
  gradientTo: string;
  /** Primary CTA background */
  ctaBg: string;
  /** Card ring/border accent */
  ring: string;
  /** Segment emoji/icon color hint */
  iconTint: string;
  /** Psychological mode — drives component variations */
  psychology: 'urgency' | 'trust' | 'discovery' | 'fomo' | 'convenience';
  /** Display name */
  label: string;
}

export const SEGMENT_THEMES: Record<SegmentKey, SegmentThemeTokens> = {
  food: {
    accent: '#f97316',        // orange-500
    accentHover: '#ea580c',   // orange-600
    accentMuted: '#fdba74',   // orange-300
    gradientFrom: '#f97316',
    gradientTo: '#ef4444',    // orange → red (warm hunger drive)
    ctaBg: '#f97316',
    ring: 'rgba(249, 115, 22, 0.25)',
    iconTint: '#fb923c',
    psychology: 'urgency',
    label: 'Island Flavors',
  },
  products: {
    accent: '#10b981',        // emerald-500
    accentHover: '#059669',   // emerald-600
    accentMuted: '#6ee7b7',   // emerald-300
    gradientFrom: '#10b981',
    gradientTo: '#14b8a6',    // emerald → teal (fresh, natural)
    ctaBg: '#10b981',
    ring: 'rgba(16, 185, 129, 0.25)',
    iconTint: '#34d399',
    psychology: 'discovery',
    label: 'Island Marketplace',
  },
  services: {
    accent: '#14b8a6',        // teal-500 (default brand)
    accentHover: '#0d9488',   // teal-600
    accentMuted: '#5eead4',   // teal-300
    gradientFrom: '#14b8a6',
    gradientTo: '#0f766e',    // teal deep (professional trust)
    ctaBg: '#14b8a6',
    ring: 'rgba(20, 184, 166, 0.25)',
    iconTint: '#2dd4bf',
    psychology: 'trust',
    label: 'Island Services',
  },
  tours: {
    accent: '#06b6d4',        // cyan-500
    accentHover: '#0891b2',   // cyan-600
    accentMuted: '#67e8f9',   // cyan-300
    gradientFrom: '#06b6d4',
    gradientTo: '#14b8a6',    // cyan → teal (oceanic exploration)
    ctaBg: '#06b6d4',
    ring: 'rgba(6, 182, 212, 0.25)',
    iconTint: '#22d3ee',
    psychology: 'discovery',
    label: 'Island Adventures',
  },
  transport: {
    accent: '#3b82f6',        // blue-500
    accentHover: '#2563eb',   // blue-600
    accentMuted: '#93c5fd',   // blue-300
    gradientFrom: '#3b82f6',
    gradientTo: '#1d4ed8',    // blue deep (reliable, logistic)
    ctaBg: '#3b82f6',
    ring: 'rgba(59, 130, 246, 0.25)',
    iconTint: '#60a5fa',
    psychology: 'trust',
    label: 'Island Transport',
  },
  rentals: {
    accent: '#8b5cf6',        // violet-500
    accentHover: '#7c3aed',   // violet-600
    accentMuted: '#c4b5fd',   // violet-300
    gradientFrom: '#8b5cf6',
    gradientTo: '#a855f7',    // violet → purple (luxury stays)
    ctaBg: '#8b5cf6',
    ring: 'rgba(139, 92, 246, 0.25)',
    iconTint: '#a78bfa',
    psychology: 'discovery',
    label: 'Island Stays',
  },
  campaigns: {
    accent: '#f43f5e',        // rose-500 (FOMO energy)
    accentHover: '#e11d48',   // rose-600
    accentMuted: '#fda4af',   // rose-300
    gradientFrom: '#f43f5e',
    gradientTo: '#f97316',    // rose → orange (urgent heat)
    ctaBg: '#f43f5e',
    ring: 'rgba(244, 63, 94, 0.3)',
    iconTint: '#fb7185',
    psychology: 'fomo',
    label: 'Campaigns & Events',
  },
  default: {
    accent: '#14b8a6',
    accentHover: '#0d9488',
    accentMuted: '#5eead4',
    gradientFrom: '#14b8a6',
    gradientTo: '#0f766e',
    ctaBg: '#14b8a6',
    ring: 'rgba(20, 184, 166, 0.25)',
    iconTint: '#2dd4bf',
    psychology: 'trust',
    label: 'IslandHub',
  },
};

/** Map a route segment string to a SegmentKey */
export function resolveSegment(pathname: string): SegmentKey {
  const match = pathname.match(/^\/hub\/([^/]+)/);
  if (match && match[1] in SEGMENT_THEMES) {
    return match[1] as SegmentKey;
  }
  // Also match top-level routes that map to segments
  if (pathname.startsWith('/food') || pathname.startsWith('/kitchen')) return 'food';
  if (pathname.startsWith('/tours')) return 'tours';
  if (pathname.startsWith('/transport') || pathname.startsWith('/ride')) return 'transport';
  if (pathname.startsWith('/rentals') || pathname.startsWith('/stays')) return 'rentals';
  if (pathname.startsWith('/campaigns') || pathname.startsWith('/events')) return 'campaigns';
  if (pathname.startsWith('/services')) return 'services';
  if (pathname.startsWith('/products') || pathname.startsWith('/marketplace')) return 'products';
  return 'default';
}

/** Generate CSS custom properties for a segment */
export function getSegmentCSSVars(segment: SegmentKey): Record<string, string> {
  const t = SEGMENT_THEMES[segment];
  return {
    '--segment-accent': t.accent,
    '--segment-accent-hover': t.accentHover,
    '--segment-accent-muted': t.accentMuted,
    '--segment-gradient-from': t.gradientFrom,
    '--segment-gradient-to': t.gradientTo,
    '--segment-cta-bg': t.ctaBg,
    '--segment-ring': t.ring,
    '--segment-icon-tint': t.iconTint,
    // Override the global accent when in a segment
    '--accent-primary': t.accent,
    '--accent-secondary': t.accentHover,
    '--accent-muted': t.accentMuted,
  };
}
