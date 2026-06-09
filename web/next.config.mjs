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
      { source: '/stores', destination: '/hub', permanent: true },
      { source: '/food', destination: '/hub/food', permanent: true },
      { source: '/products', destination: '/hub/products', permanent: true },
      { source: '/rentals', destination: '/hub/rentals', permanent: true },
      { source: '/tours', destination: '/hub/tours', permanent: true },
      { source: '/listings', destination: '/hub', permanent: true },
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
