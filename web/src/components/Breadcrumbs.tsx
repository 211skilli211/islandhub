'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbsProps {
    items?: { label: string; href?: string }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    const pathname = usePathname();

    // Auto-generate if not provided
    const defaultItems = items || pathname.split('/')
        .filter(p => p)
        .map((part, index, arr) => {
            const href = '/' + arr.slice(0, index + 1).join('/');
            const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
            return { label, href };
        });

    return (
        <nav className="flex mb-4 text-xs font-bold uppercase tracking-widest overflow-x-auto whitespace-nowrap scrollbar-hide" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                <li>
                    <Link href="/" className="text-slate-400 hover:text-teal-600 transition-colors">
                        Home
                    </Link>
                </li>

                {defaultItems.map((item, index) => (
                    <li key={index} className="flex items-center space-x-2">
                        <span className="text-slate-300">/</span>
                        {item.href && index < defaultItems.length - 1 ? (
                            <Link href={item.href} className="text-slate-400 hover:text-teal-600 transition-colors">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-teal-600">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
