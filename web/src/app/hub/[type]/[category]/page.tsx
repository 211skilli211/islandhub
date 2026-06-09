'use client';

import { useParams } from 'next/navigation';
import ShopsHubPage from '@/components/hub/products/ShopsHubPage';
import SpecialtyHubPage from '@/components/hub/products/SpecialtyHubPage';
import FashionHubPage from '@/components/hub/products/FashionHubPage';
import HealthHubPage from '@/components/hub/products/HealthHubPage';

export default function ProductsCategoryPage() {
  const params = useParams();
  const category = params?.category as string;

  switch (category) {
    case 'shop': case 'shops': return <ShopsHubPage />;
    case 'specialty': return <SpecialtyHubPage />;
    case 'fashion': return <FashionHubPage />;
    case 'health': return <HealthHubPage />;
    default: return <ShopsHubPage />;
  }
}
