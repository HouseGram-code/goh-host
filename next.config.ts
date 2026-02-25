import type {NextConfig} from 'next';

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  output: 'standalone',
  experimental: {
    // @ts-ignore
    allowedDevOrigins: [
      'ais-dev-rcei773m6shlgkcdtp6jt7-6560868183.us-west2.run.app',
      'ais-pre-rcei773m6shlgkcdtp6jt7-6560868183.us-west2.run.app',
    ],
  },
  transpilePackages: ['motion'],
  webpack: (config: any, {dev}: {dev: boolean}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
