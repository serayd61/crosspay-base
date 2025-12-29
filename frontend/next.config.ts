import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: '/farcaster.json',
      },
      // Dynamic image generation
      {
        source: '/icon.png',
        destination: '/api/og?type=icon',
      },
      {
        source: '/image.png',
        destination: '/api/og?type=preview',
      },
      {
        source: '/splash.png',
        destination: '/api/og?type=splash',
      },
      {
        source: '/preview.png',
        destination: '/api/og?type=preview',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/farcaster.json',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Content-Type', value: 'application/json' },
        ],
      },
      {
        source: '/.well-known/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};

export default nextConfig;
