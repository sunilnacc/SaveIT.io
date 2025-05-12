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
        hostname: 'picsum.photos',
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
        hostname: 'cdn.grofers.com',
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
        hostname: 'd2chhaxkq6tvay.cloudfront.net',
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
