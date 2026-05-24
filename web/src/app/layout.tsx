import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { memo } from 'react';
import Navbar from "@/components/Navbar";
import TextMarquee from "@/components/TextMarquee";
import Footer from "@/components/Footer";
import Toaster from "@/components/Toaster";
import { ThemeProvider } from "@/components/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import FloatingBanner from "@/components/FloatingBanner";
import UserSync from "@/components/UserSync";
import AdSpace from "@/components/advertising/AdSpace";
import FloatingHub from "@/components/FloatingHub";
import SessionMonitor from "@/components/SessionExpiryModal";
import MobileAnnouncement from "@/components/MobileAnnouncement";
import { NavbarGate, FooterGate } from "@/components/LayoutGates";

const MemoizedNavbar = memo(Navbar);
const MemoizedTextMarquee = memo(TextMarquee);
const MemoizedFooter = memo(Footer);
const MemoizedFloatingBanner = memo(FloatingBanner);
const MemoizedUserSync = memo(UserSync);

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IslandHub",
  description: "The premier marketplace for island living, campaigns, and rentals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <CartProvider>
            <NavbarGate>
              <MemoizedNavbar />
              <MemoizedUserSync />
              <MemoizedTextMarquee />
              <MemoizedFloatingBanner location="global" />
              <MobileAnnouncement />
            </NavbarGate>
            {children}
            <Toaster />
            <AdSpace spaceName="mobile_footer_ad" className="fixed bottom-0 left-0 right-0 z-50 lg:hidden" />
            <FloatingHub />
            <SessionMonitor />
            <FooterGate>
              <MemoizedFooter />
            </FooterGate>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
