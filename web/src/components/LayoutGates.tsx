'use client';

import { usePathname } from 'next/navigation';

const HIDE_NAVBAR_PATHS = ['/admin', '/dashboard', '/community'];

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
