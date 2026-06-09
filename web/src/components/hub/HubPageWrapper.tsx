'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import FeaturedMarquee from './FeaturedMarquee';
import api from '@/lib/api';

interface HubPageWrapperProps {
  type: string;
  subtype?: string;
  children: ReactNode;
}

/**
 * Wraps hub page content with a featured providers marquee.
 * Fetches featured providers from /api/search/featured and renders
 * an infinite-scroll marquee above the page content.
 */
export default function HubPageWrapper({ type, subtype, children }: HubPageWrapperProps) {
  const [featuredProviders, setFeaturedProviders] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get(`/search/featured?type=${type}${subtype ? `&subtype=${subtype}` : ''}&limit=10`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          setFeaturedProviders(res.data);
        }
      } catch (error) {
        // Silently fail — marquee is decorative
      }
    };
    fetchFeatured();
  }, [type, subtype]);

  return (
    <>
      <FeaturedMarquee providers={featuredProviders} hubType={type} />
      {children}
    </>
  );
}
