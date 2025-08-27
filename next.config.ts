/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://web-production-40b3.up.railway.app/api/:path*',
      },
    ];
  },
};
module.exports = nextConfig;
