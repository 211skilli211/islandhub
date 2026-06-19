/**
 * Central icon mapping for IslandHub.
 * Maps emoji/lucide icon names to their Lucide icon equivalents.
 * All icons should use AnimatedIcon wrapper for consistent animation.
 */
import {
    // Food & Dining
    UtensilsCrossed, Coffee, Flame, Beer,
    // Shopping & Products
    ShoppingBag, Store, Palette, Shirt, Pill,
    // Services
    Wrench, Briefcase, Car, Sparkles, Anchor, PartyPopper,
    // Tours & Travel
    Map, Mountain, Waves, Sailboat, Gem,
    // Transport
    Taxi, Package, Ship, Truck,
    // General
    Heart, Star, Home, Search, Globe, Leaf, Eye,
    TreePine, Building2, Zap, Gift, Info, CheckCircle,
    // Social & Community
    Users, MessageCircle, ThumbsUp, Award,
} from 'lucide-react';

export const ICONS = {
    // Food & Dining
    food: UtensilsCrossed,
    kitchen: Flame,
    restaurant: UtensilsCrossed,
    cafe: Coffee,
    grill: Beer,

    // Shopping & Products
    products: ShoppingBag,
    shop: Store,
    specialty: Palette,
    fashion: Shirt,
    health: Pill,

    // Services
    services: Wrench,
    professional: Briefcase,
    automotive: Car,
    beauty: Sparkles,
    marine: Anchor,
    events: PartyPopper,

    // Tours & Travel
    tours: Map,
    land: Mountain,
    sea: Waves,
    adventure: Gem,
    charter: Sailboat,

    // Transport
    transport: Taxi,
    ride: Taxi,
    delivery: Package,
    boat: Ship,
    moving: Truck,

    // General
    community: Heart,
    island: TreePine,
    home: Home,
    search: Search,
    globe: Globe,
    leaf: Leaf,
    eye: Eye,
    star: Star,
    building: Building2,
    zap: Zap,
    gift: Gift,
    info: Info,
    check: CheckCircle,

    // Social
    users: Users,
    message: MessageCircle,
    thumbsUp: ThumbsUp,
    award: Award,
} as const;

export type IconName = keyof typeof ICONS;
