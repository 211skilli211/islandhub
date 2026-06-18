'use client';

import { usePathname } from 'next/navigation';

// Only hide navbar on admin and dashboard — they have their own full-screen layouts
const HIDE_NAVBAR_PATHS = ['/admin', '/dashboard'];

function shouldHideNavbar(pathname: string | null): boolean {
    if (!pathname) return false;
    return HIDE_NAVBAR_PATHS.some(p => pathname.startsWith(p));
}

export function NavbarGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    if (shouldHideNavbar(pathname)) return null;
    return <>{children}</>;
}

export function FooterGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    if (shouldHideNavbar(pathname)) return null;
    return <>{children}</>;
}

export function SidebarGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    if (shouldHideNavbar(pathname)) return <>{children}</>;
    return null;
}
