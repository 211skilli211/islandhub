'use client';

import { useParams } from 'next/navigation';
import RentalsGatewayPage from '@/components/hub/rentals/RentalsGatewayPage';
import StaysHubPage from '@/components/hub/rentals/StaysHubPage';
import HubTypePage from '@/components/hub/HubPage';
import ProductsMarketplacePage from './products/page';

/**
 * /hub/[type] — Hub entry point
 * - /hub/rentals → Rental gateway (sub-hub cards)
 * - /hub/products → Product marketplace (listings grid)
 * - All other types → generic HubPage
 */
export default function HubTypeRouter() {
  const params = useParams();
  const type = params?.type as string;

  switch (type) {
    case 'products':
      return <ProductsMarketplacePage />;
    case 'rentals':
      return <RentalsGatewayPage />;
    case 'stays':
      return <StaysHubPage />;
    default:
      return <HubTypePage />;
  }
}
