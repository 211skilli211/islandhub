'use client';

import { useParams } from 'next/navigation';
import StaysHubPage from '@/components/hub/rentals/StaysHubPage';
import CarsHubPage from '@/components/hub/rentals/CarsHubPage';
import SeaHubPage from '@/components/hub/rentals/SeaHubPage';
import ToolsHubPage from '@/components/hub/rentals/ToolsHubPage';
import LongTermHubPage from '@/components/hub/rentals/LongTermHubPage';
import RentalsGatewayPage from '@/components/hub/rentals/RentalsGatewayPage';
import { getCategoryLayout } from '@/lib/hubConfigs';

/**
 * /hub/rentals/[category] — Rental sub-hub pages
 * Each sub-hub has a completely different layout and card style.
 */
export default function RentalsCategoryPage() {
  const params = useParams();
  const category = params?.category as string;

  switch (category) {
    case 'stays':
      return <StaysHubPage />;
    case 'cars':
      return <CarsHubPage />;
    case 'sea':
      return <SeaHubPage />;
    case 'equipment':
    case 'tools':
      return <ToolsHubPage />;
    case 'longterm':
      return <LongTermHubPage />;
    default:
      return <RentalsGatewayPage />;
  }
}
