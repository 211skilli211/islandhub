'use client';

import { useParams } from 'next/navigation';
import RideHailingHubPage from '@/components/hub/transport/RideHailingHubPage';
import DeliveryHubPage from '@/components/hub/transport/DeliveryHubPage';
import BoatTransportHubPage from '@/components/hub/transport/BoatTransportHubPage';
import MovingHubPage from '@/components/hub/transport/MovingHubPage';

export default function TransportCategoryPage() {
  const params = useParams();
  const category = params?.category as string;

  switch (category) {
    case 'ride': case 'rides': case 'taxi': return <RideHailingHubPage />;
    case 'delivery': return <DeliveryHubPage />;
    case 'boat': case 'ferry': return <BoatTransportHubPage />;
    case 'moving': return <MovingHubPage />;
    default: return <RideHailingHubPage />;
  }
}
