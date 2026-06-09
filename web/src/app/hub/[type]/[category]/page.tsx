'use client';

import { useParams } from 'next/navigation';

// Rentals
import StaysHubPage from '@/components/hub/rentals/StaysHubPage';
import CarsHubPage from '@/components/hub/rentals/CarsHubPage';
import SeaHubPage from '@/components/hub/rentals/SeaHubPage';
import ToolsHubPage from '@/components/hub/rentals/ToolsHubPage';
import LongTermHubPage from '@/components/hub/rentals/LongTermHubPage';
import RentalsGatewayPage from '@/components/hub/rentals/RentalsGatewayPage';

// Food
import RestaurantsHubPage from '@/components/hub/food/RestaurantsHubPage';

// Tours
import { LandToursHubPage } from '@/components/hub/tours/LandToursHubPage';

// Products
import { ShopsHubPage } from '@/components/hub/products/ShopsHubPage';

// Services
import { ProfessionalServicesHubPage } from '@/components/hub/services/ProfessionalServicesHubPage';

// Transport
import { RideHailingHubPage } from '@/components/hub/transport/RideHailingHubPage';

// Events
import CommunityEventsHubPage from '@/components/hub/events/CommunityEventsHubPage';
import { EnvironmentEventsHubPage, EducationEventsHubPage, HealthEventsHubPage } from '@/components/hub/events/OtherEventsHubPages';

// Campaigns
import { CommunityCampaignsHubPage } from '@/components/hub/campaigns/CommunityCampaignsHubPage';

// Community — all are named exports (export function)
import { CommunityDirectoryHubPage } from '@/components/hub/community/CommunityDirectoryHubPage';
import { CommunityHubEventsPage } from '@/components/hub/community/CommunityEventsHubPage';
import { CommunityStoriesHubPage } from '@/components/hub/community/CommunityStoriesHubPage';
import { CommunityGroupsHubPage } from '@/components/hub/community/CommunityGroupsHubPage';

export default function HubCategoryPage() {
  const params = useParams();
  const type = params?.type as string;
  const category = params?.category as string;

  // Rentals
  if (type === 'rentals') {
    switch (category) {
      case 'stays': return <StaysHubPage />;
      case 'cars': return <CarsHubPage />;
      case 'sea': return <SeaHubPage />;
      case 'tools': return <ToolsHubPage />;
      case 'longterm': return <LongTermHubPage />;
      default: return <RentalsGatewayPage />;
    }
  }

  // Food
  if (type === 'food') {
    switch (category) {
      case 'restaurants': return <RestaurantsHubPage />;
      case 'kitchens': case 'cafes': case 'grills': return <RestaurantsHubPage />;
      default: return <RestaurantsHubPage />;
    }
  }

  // Tours
  if (type === 'tours') {
    switch (category) {
      case 'land': return <LandToursHubPage />;
      case 'sea': case 'adventure': case 'charter': return <LandToursHubPage />;
      default: return <LandToursHubPage />;
    }
  }

  // Products
  if (type === 'products') {
    switch (category) {
      case 'shops': return <ShopsHubPage />;
      case 'specialty': case 'fashion': case 'health': return <ShopsHubPage />;
      default: return <ShopsHubPage />;
    }
  }

  // Services
  if (type === 'services') {
    switch (category) {
      case 'professional': return <ProfessionalServicesHubPage />;
      case 'automotive': case 'health': case 'beauty': case 'marine': case 'events': case 'event': return <ProfessionalServicesHubPage />;
      default: return <ProfessionalServicesHubPage />;
    }
  }

  // Transport
  if (type === 'transport') {
    switch (category) {
      case 'ride': case 'rides': case 'taxi': return <RideHailingHubPage />;
      case 'delivery': case 'boat': case 'ferry': case 'moving': return <RideHailingHubPage />;
      default: return <RideHailingHubPage />;
    }
  }

  // Events
  if (type === 'events') {
    switch (category) {
      case 'environment': return <EnvironmentEventsHubPage />;
      case 'education': return <EducationEventsHubPage />;
      case 'health': return <HealthEventsHubPage />;
      default: return <CommunityEventsHubPage />;
    }
  }

  // Campaigns
  if (type === 'campaigns') {
    switch (category) {
      case 'environment': case 'education': case 'health': return <CommunityCampaignsHubPage />;
      default: return <CommunityCampaignsHubPage />;
    }
  }

  // Community
  if (type === 'community') {
    switch (category) {
      case 'events': return <CommunityHubEventsPage />;
      case 'stories': return <CommunityStoriesHubPage />;
      case 'groups': return <CommunityGroupsHubPage />;
      default: return <CommunityDirectoryHubPage />;
    }
  }

  // Fallback
  return <RentalsGatewayPage />;
}
