'use client';

import { useParams } from 'next/navigation';
import RestaurantsHubPage from '@/components/hub/food/RestaurantsHubPage';
import KitchensHubPage from '@/components/hub/food/KitchensHubPage';
import CafesHubPage from '@/components/hub/food/CafesHubPage';
import GrillsHubPage from '@/components/hub/food/GrillsHubPage';

/**
 * /hub/food/[category] — Food sub-hub pages
 * Each category has a distinct card style and layout.
 */
export default function FoodCategoryPage() {
  const params = useParams();
  const category = params?.category as string;

  switch (category) {
    case 'restaurant':
    case 'restaurants':
      return <RestaurantsHubPage />;
    case 'kitchen':
    case 'kitchens':
      return <KitchensHubPage />;
    case 'cafe':
    case 'cafes':
      return <CafesHubPage />;
    case 'grill':
    case 'grills':
      return <GrillsHubPage />;
    default:
      // Fallback to restaurants
      return <RestaurantsHubPage />;
  }
}
