'use client';

import dynamic from 'next/dynamic';

const VendorMapInner = dynamic(() => import('./VendorMapInner'), { ssr: false });

interface VendorMapProps {
  location?: string;
  businessName?: string;
}

export default function VendorMap({ location, businessName }: VendorMapProps) {
  return <VendorMapInner location={location} businessName={businessName} />;
}
