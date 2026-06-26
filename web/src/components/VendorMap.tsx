'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const VendorMap = dynamic(() => import('./VendorMapInner'), { ssr: false });

export default function VendorMapWrapper() {
  return <VendorMap />;
}
