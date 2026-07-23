'use client';

import { Providers } from './providers';
import { memo } from 'react';
import Navbar from '@/components/Navbar';
import TextMarquee from '@/components/TextMarquee';
import Footer from '@/components/Footer';
import Toaster from '@/components/Toaster';
import FloatingBanner from '@/components/FloatingBanner';
import UserSync from '@/components/UserSync';
import AdSpace from '@/components/advertising/AdSpace';
import FloatingHub from '@/components/FloatingHub';
import SessionMonitor from '@/components/SessionExpiryModal';
import PageTransition from '@/components/PageTransition';
import ClientParticles from '@/components/ClientParticles';
import MobileAnnouncement from '@/components/MobileAnnouncement';

const MemoizedNavbar = memo(Navbar);
const MemoizedTextMarquee = memo(TextMarquee);
const MemoizedFooter = memo(Footer);
const MemoizedFloatingBanner = memo(FloatingBanner);
const MemoizedUserSync = memo(UserSync);

export function ProvidersClient({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <MemoizedNavbar />
      <MemoizedUserSync />
      <MemoizedTextMarquee />
      <MemoizedFloatingBanner location="global" />
      <MobileAnnouncement />
      <PageTransition>{children}</PageTransition>
      <ClientParticles />
      <Toaster />
      <AdSpace spaceName="mobile_footer_ad" className="fixed bottom-0 left-0 right-0 z-50 lg:hidden" />
      <FloatingHub />
      <SessionMonitor />
      <MemoizedFooter />
    </Providers>
  );
}