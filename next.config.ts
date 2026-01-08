import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static optimization during development to prevent caching
  experimental: {
    optimizeCss: false,
  },

  // Add headers to prevent caching in development
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, must-revalidate',
            },
          ],
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
