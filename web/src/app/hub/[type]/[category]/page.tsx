'use client';

import { useParams } from 'next/navigation';
import ProfessionalServicesHubPage from '@/components/hub/services/ProfessionalServicesHubPage';
import AutomotiveServicesHubPage from '@/components/hub/services/AutomotiveServicesHubPage';
import BeautyServicesHubPage from '@/components/hub/services/BeautyServicesHubPage';
import MarineServicesHubPage from '@/components/hub/services/MarineServicesHubPage';
import EventServicesHubPage from '@/components/hub/services/EventServicesHubPage';

export default function ServicesCategoryPage() {
  const params = useParams();
  const category = params?.category as string;

  switch (category) {
    case 'professional': return <ProfessionalServicesHubPage />;
    case 'automotive': return <AutomotiveServicesHubPage />;
    case 'health': case 'beauty': return <BeautyServicesHubPage />;
    case 'marine': return <MarineServicesHubPage />;
    case 'events': case 'event': return <EventServicesHubPage />;
    default: return <ProfessionalServicesHubPage />;
  }
}
