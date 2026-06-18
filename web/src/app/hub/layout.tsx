'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HUB_CONFIGS } from '@/lib/hubConfigs';

function Breadcrumbs({ segments }: { segments: string[] }) {
  const crumbs: { label: string; href: string }[] = [
    { label: 'Hub', href: '/hub' },
  ];

  if (segments[0]) {
    const cfg = HUB_CONFIGS[segments[0]];
    crumbs.push({
      label: cfg?.fallbackTitle || segments[0],
      href: `/hub/${segments[0]}`,
    });
  }

  if (segments[1]) {
    crumbs.push({
      label: decodeURIComponent(segments[1]),
      href: `/hub/${segments[0]}/${segments[1]}`,
    });
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-text-secondary py-3 px-4">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-2">
          {i > 0 && <span className="text-text-tertiary">/</span>}
          {i === crumbs.length - 1 ? (
            <span className="text-text-primary font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-text-primary transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export default function HubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname
    .replace('/hub/', '')
    .split('/')
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-7xl mx-auto">
        {segments.length > 0 && <Breadcrumbs segments={segments} />}
        {children}
      </div>
    </div>
  );
}
