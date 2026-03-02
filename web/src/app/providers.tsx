'use client';

import { ThemeProvider } from '@/components/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';

// Combined provider - no memoization to avoid SSR hydration issues
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </ThemeProvider>
  );
}