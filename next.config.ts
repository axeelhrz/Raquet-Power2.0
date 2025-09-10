/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize chunk splitting and loading
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'framer-motion'],
  },
  
  // Improve build performance and chunk loading
  webpack: (
    config: import("webpack").Configuration,
    { dev, isServer }: { dev: boolean; isServer: boolean }
  ) => {
    if (!dev && !isServer) {
      // Ensure optimization exists before modifying splitChunks
      if (!config.optimization) {
        config.optimization = {};
      }
      // Optimize chunk splitting for better loading
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui',
            priority: 10,
            chunks: 'all',
          },
          framer: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            priority: 10,
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  
  // API rewrites with timeout and retry configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://web-production-40b3.up.railway.app/api/:path*',
      },
    ];
  },
  
  // Add headers for better caching and error handling
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;