'use client';

import { ThemeProvider } from '@/components/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { SegmentThemeProvider } from '@/components/SegmentThemeProvider';

// Combined provider - no memoization to avoid SSR hydration issues
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SegmentThemeProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </SegmentThemeProvider>
    </ThemeProvider>
  );
}