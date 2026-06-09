'use client';

import { useParams } from 'next/navigation';

// Rentals
import StaysHubPage from '@/components/hub/rentals/StaysHubPage';
import CarsHubPage from '@/components/hub/rentals/CarsHubPage';
import SeaHubPage from '@/components/hub/rentals/SeaHubPage';
import ToolsHubPage from '@/components/hub/rentals/ToolsHubPage';
import LongTermHubPage from '@/components/hub/rentals/LongTermHubPage';
import RentalsGatewayPage from '@/components/hub/rentals/RentalsGatewayPage';

// Food — RestaurantsHubPage.tsx exports default RestaurantsHubPage + named KitchensHubPage, CafesHubPage, GrillsHubPage
import RestaurantsHubPage, { KitchensHubPage, CafesHubPage, GrillsHubPage } from '@/components/hub/food/RestaurantsHubPage';

// Tours — LandToursHubPage.tsx exports all 4 as named
import { LandToursHubPage, SeaToursHubPage, AdventureToursHubPage, CharterToursHubPage } from '@/components/hub/tours/LandToursHubPage';

// Products — ShopsHubPage.tsx exports all 4 as named
import { ShopsHubPage, SpecialtyHubPage, FashionHubPage, HealthHubPage } from '@/components/hub/products/ShopsHubPage';

// Services — ProfessionalServicesHubPage.tsx exports all 5 as named
import { ProfessionalServicesHubPage, AutomotiveServicesHubPage, BeautyServicesHubPage, MarineServicesHubPage, EventServicesHubPage } from '@/components/hub/services/ProfessionalServicesHubPage';

// Transport — RideHailingHubPage.tsx exports all 4 as named
import { RideHailingHubPage, DeliveryHubPage, BoatTransportHubPage, MovingHubPage } from '@/components/hub/transport/RideHailingHubPage';

// Events — CommunityEventsHubPage.tsx exports default + EventsHubPage factory; OtherEventsHubPages.tsx exports 3 named
import CommunityEventsHubPage from '@/components/hub/events/CommunityEventsHubPage';
import { EnvironmentEventsHubPage, EducationEventsHubPage, HealthEventsHubPage } from '@/components/hub/events/OtherEventsHubPages';

// Campaigns — CommunityCampaignsHubPage.tsx exports all 4 as named
import { CommunityCampaignsHubPage, EnvironmentCampaignsHubPage, EducationCampaignsHubPage, HealthCampaignsHubPage } from '@/components/hub/campaigns/CommunityCampaignsHubPage';

// Community — all 4 are named exports
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
      case 'kitchens': return <KitchensHubPage />;
      case 'cafes': return <CafesHubPage />;
      case 'grills': return <GrillsHubPage />;
      default: return <RestaurantsHubPage />;
    }
  }

  // Tours
  if (type === 'tours') {
    switch (category) {
      case 'land': return <LandToursHubPage />;
      case 'sea': return <SeaToursHubPage />;
      case 'adventure': return <AdventureToursHubPage />;
      case 'charter': return <CharterToursHubPage />;
      default: return <LandToursHubPage />;
    }
  }

  // Products
  if (type === 'products') {
    switch (category) {
      case 'shops': return <ShopsHubPage />;
      case 'specialty': return <SpecialtyHubPage />;
      case 'fashion': return <FashionHubPage />;
      case 'health': return <HealthHubPage />;
      default: return <ShopsHubPage />;
    }
  }

  // Services
  if (type === 'services') {
    switch (category) {
      case 'professional': return <ProfessionalServicesHubPage />;
      case 'automotive': return <AutomotiveServicesHubPage />;
      case 'health': case 'beauty': return <BeautyServicesHubPage />;
      case 'marine': return <MarineServicesHubPage />;
      case 'events': case 'event': return <EventServicesHubPage />;
      default: return <ProfessionalServicesHubPage />;
    }
  }

  // Transport
  if (type === 'transport') {
    switch (category) {
      case 'ride': case 'rides': case 'taxi': return <RideHailingHubPage />;
      case 'delivery': return <DeliveryHubPage />;
      case 'boat': case 'ferry': return <BoatTransportHubPage />;
      case 'moving': return <MovingHubPage />;
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
      case 'environment': return <EnvironmentCampaignsHubPage />;
      case 'education': return <EducationCampaignsHubPage />;
      case 'health': return <HealthCampaignsHubPage />;
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
