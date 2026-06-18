'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { adminNavItems, flattenNavItems } from '@/lib/admin-nav';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export default function AdminBreadcrumb() {
    const pathname = usePathname();

    // Don't render breadcrumb on overview page — it IS the home
    if (pathname === '/admin/overview' || pathname === '/admin') return null;

    const findNavItem = (path: string): BreadcrumbItem | null => {
        const allItems = flattenNavItems(adminNavItems);
        const item = allItems.find(i => i.href === path);
        return item ? { label: item.title, href: item.href } : null;
    };

    const buildBreadcrumbs = (): BreadcrumbItem[] => {
        const crumbs: BreadcrumbItem[] = [
            { label: 'Admin', href: '/admin/overview' }
        ];

        const current = findNavItem(pathname);
        if (current && current.href !== '/admin' && current.href !== '/admin/overview') {
            crumbs.push(current);
        }

        return crumbs;
    };

    const breadcrumbs = buildBreadcrumbs();

    // If no crumbs beyond Admin, don't render
    if (breadcrumbs.length <= 1) return null;

    return (
        <nav className="hidden lg:flex items-center gap-1 text-sm px-4 md:px-6 lg:px-8 py-2 border-b border-border-primary bg-surface-primary/50">
            <Link
                href="/admin/overview"
                className="flex items-center gap-1 text-ink-tertiary hover:text-accent-400 transition-colors"
            >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
            </Link>
            {breadcrumbs.slice(1).map((crumb, index) => (
                <div key={index} className="flex items-center gap-1">
                    <ChevronRight className="w-4 h-4 text-ink-tertiary" />
                    {crumb.href ? (
                        <Link
                            href={crumb.href}
                            className="text-ink-tertiary hover:text-accent-400 transition-colors font-medium"
                        >
                            {crumb.label}
                        </Link>
                    ) : (
                        <span className="text-ink-primary font-bold">{crumb.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
}