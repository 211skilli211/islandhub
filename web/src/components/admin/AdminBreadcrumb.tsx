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
    
    const findNavItem = (path: string): BreadcrumbItem | null => {
        const allItems = flattenNavItems(adminNavItems);
        const item = allItems.find(i => i.href === path);
        return item ? { label: item.title, href: item.href } : null;
    };

    const buildBreadcrumbs = (): BreadcrumbItem[] => {
        const crumbs: BreadcrumbItem[] = [
            { label: 'Admin', href: '/admin' }
        ];

        const current = findNavItem(pathname);
        if (current && current.href !== '/admin') {
            crumbs.push(current);
        }

        return crumbs;
    };

    const breadcrumbs = buildBreadcrumbs();

    return (
        <nav className="flex items-center gap-1 text-sm">
            <Link 
                href="/admin" 
                className="flex items-center gap-1 text-slate-500 hover:text-teal-600 transition-colors"
            >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
            </Link>
            {breadcrumbs.slice(1).map((crumb, index) => (
                <div key={index} className="flex items-center gap-1">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    {crumb.href ? (
                        <Link 
                            href={crumb.href}
                            className="text-slate-500 hover:text-teal-600 transition-colors font-medium"
                        >
                            {crumb.label}
                        </Link>
                    ) : (
                        <span className="text-slate-900 dark:text-white font-bold">{crumb.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
}