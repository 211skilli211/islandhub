'use client';

import { useParams } from 'next/navigation';
import RentalsGatewayPage from '@/components/hub/rentals/RentalsGatewayPage';
import StaysHubPage from '@/components/hub/rentals/StaysHubPage';
import HubTypePage from '@/components/hub/HubPage';

/**
 * /hub/[type] — Hub entry point
 * - /hub/rentals → Rental gateway (sub-hub cards)
 * - All other types → generic HubPage (until dedicated pages are built)
 */
export default function HubTypeRouter() {
  const params = useParams();
  const type = params?.type as string;

  switch (type) {
    case 'rentals':
      return <RentalsGatewayPage />;
    case 'stays':
      // Direct access to stays (without /rentals/ prefix)
      return <StaysHubPage />;
    default:
      return <HubTypePage />;
  }
}
