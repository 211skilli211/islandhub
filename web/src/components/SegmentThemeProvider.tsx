'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  SegmentKey,
  SegmentThemeTokens,
  SEGMENT_THEMES,
  resolveSegment,
  getSegmentCSSVars,
} from '@/lib/segment-themes';

interface SegmentContextType {
  segment: SegmentKey;
  theme: SegmentThemeTokens;
  cssVars: Record<string, string>;
}

const SegmentContext = createContext<SegmentContextType>({
  segment: 'default',
  theme: SEGMENT_THEMES.default,
  cssVars: {},
});

export function useSegmentTheme(): SegmentContextType {
  return useContext(SegmentContext);
}

export function SegmentThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const value = useMemo(() => {
    const segment = resolveSegment(pathname);
    const theme = SEGMENT_THEMES[segment];
    const cssVars = getSegmentCSSVars(segment);
    return { segment, theme, cssVars };
  }, [pathname]);

  return (
    <SegmentContext.Provider value={value}>
      <div style={value.cssVars as React.CSSProperties}>
        {children}
      </div>
    </SegmentContext.Provider>
  );
}
