'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TextMarquee from '@/components/TextMarquee';
import Footer from '@/components/Footer';
import FloatingBanner from '@/components/FloatingBanner';
import UserSync from '@/components/UserSync';
import AdSpace from '@/components/advertising/AdSpace';
import FloatingHub from '@/components/FloatingHub';

export default function PublicChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isAdmin = pathname?.startsWith('/admin');
    const isDashboard = pathname?.startsWith('/dashboard');
    const isAuth = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/forgot-password') || pathname?.startsWith('/reset-password');

    if (isAdmin || isDashboard) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <UserSync />
            <TextMarquee />
            <FloatingBanner location="global" />
            {children}
            <AdSpace spaceName="mobile_footer_ad" className="fixed bottom-0 left-0 right-0 z-50 lg:hidden" />
            <FloatingHub />
            <Footer />
        </>
    );
}
