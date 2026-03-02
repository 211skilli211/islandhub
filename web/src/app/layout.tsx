import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { memo } from 'react';
import Navbar from "@/components/Navbar";
import TextMarquee from "@/components/TextMarquee";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import FloatingBanner from "@/components/FloatingBanner";
import UserSync from "@/components/UserSync";
import { Providers } from './providers';
import AdSpace from "@/components/advertising/AdSpace";

// Memoize static components that don't frequently re-render
const MemoizedNavbar = memo(Navbar);
const MemoizedTextMarquee = memo(TextMarquee);
const MemoizedFooter = memo(Footer);
const MemoizedFloatingBanner = memo(FloatingBanner);
const MemoizedUserSync = memo(UserSync);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IslandHub",
  description: "The premier marketplace for island living, campaigns, and rentals.",
};

import MobileAnnouncement from '@/components/MobileAnnouncement';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <MemoizedNavbar />
          <MemoizedUserSync />
          <MemoizedTextMarquee />
          <MemoizedFloatingBanner location="global" />
          <MobileAnnouncement />
          {children}
          <Toaster position="bottom-right" />
          <AdSpace spaceName="mobile_footer_ad" className="fixed bottom-0 left-0 right-0 z-50 lg:hidden" />
          <MemoizedFooter />
        </Providers>
      </body>
    </html>
  );
}
