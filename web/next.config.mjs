/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'framer-motion'],
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async redirects() {
    return [
      // Old marketplace pages → new hub routes
      { source: '/stores', destination: '/hub', permanent: true },
      { source: '/food', destination: '/hub/food', permanent: true },
      { source: '/products', destination: '/hub/products', permanent: true },
      { source: '/rentals', destination: '/hub/rentals', permanent: true },
      { source: '/tours', destination: '/hub/tours', permanent: true },
      { source: '/listings', destination: '/hub', permanent: true },
      { source: '/services', destination: '/hub/services', permanent: true },
      { source: '/events', destination: '/hub/events', permanent: true },
      { source: '/campaigns', destination: '/hub/campaigns', permanent: true },
      { source: '/community', destination: '/hub/community', permanent: true },
      { source: '/transport', destination: '/hub/transport', permanent: true },
      // Old rental sub-pages
      { source: '/rental-hub', destination: '/hub/rentals', permanent: true },
      { source: '/rental-hub/stays', destination: '/hub/rentals/stays', permanent: true },
      { source: '/rental-hub/vehicles', destination: '/hub/rentals/cars', permanent: true },
      { source: '/rental-hub/sea-rentals', destination: '/hub/rentals/sea', permanent: true },
      { source: '/rental-hub/equipment-tools', destination: '/hub/rentals/tools', permanent: true },
      { source: '/rental-hub/property', destination: '/hub/rentals/longterm', permanent: true },
      // Old community sub-pages
      { source: '/community/events', destination: '/hub/community/events', permanent: true },
      { source: '/community/groups', destination: '/hub/community/groups', permanent: true },
      { source: '/community/stories', destination: '/hub/community/stories', permanent: true },
      // Old standalone pages → hub
      { source: '/rent', destination: '/hub/rentals', permanent: true },
      { source: '/book', destination: '/hub/services', permanent: true },
      { source: '/vendors', destination: '/hub', permanent: true },
      { source: '/brands', destination: '/hub', permanent: true },
      { source: '/browse', destination: '/hub', permanent: true },
      { source: '/shop', destination: '/hub/products', permanent: true },
      { source: '/fund', destination: '/hub/campaigns', permanent: true },
      { source: '/dispatch', destination: '/hub/transport', permanent: true },
      { source: '/driver-hub', destination: '/driver/app', permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://islandhub.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
