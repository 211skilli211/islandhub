'use client';

import { useParams } from 'next/navigation';
import LandToursHubPage from '@/components/hub/tours/LandToursHubPage';
import SeaToursHubPage from '@/components/hub/tours/SeaToursHubPage';
import AdventureToursHubPage from '@/components/hub/tours/AdventureToursHubPage';
import CharterToursHubPage from '@/components/hub/tours/CharterToursHubPage';

export default function ToursCategoryPage() {
  const params = useParams();
  const category = params?.category as string;

  switch (category) {
    case 'land': return <LandToursHubPage />;
    case 'sea': return <SeaToursHubPage />;
    case 'adventure': return <AdventureToursHubPage />;
    case 'charter': case 'charters': return <CharterToursHubPage />;
    default: return <LandToursHubPage />;
  }
}
