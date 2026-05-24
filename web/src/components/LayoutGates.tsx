'use client';

import { usePathname } from 'next/navigation';

export function NavbarGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');
    const isDashboard = pathname?.startsWith('/dashboard');

    if (isAdmin || isDashboard) return null;
    return <>{children}</>;
}

export function FooterGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');
    const isDashboard = pathname?.startsWith('/dashboard');

    if (isAdmin || isDashboard) return null;
    return <>{children}</>;
}
