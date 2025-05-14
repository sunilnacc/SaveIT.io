
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos', // Kept for existing, can be removed if fully migrated
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Added for new placeholders
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bbassets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.dmart.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media-assets.swiggy.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.grofers.com', // Blinkit's old CDN, still might be in use for some images
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blinkit-styleguide.s3.ap-south-1.amazonaws.com', // Blinkit new CDN
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.jiomart.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.zeptonow.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd2chhaxkq6tvay.cloudfront.net', // Dunzo CDN
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'qcsearch.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
