/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'web-production-40b3.up.railway.app/api/:path*', // <-- tu URL Railway
      },
    ];
  },
};
module.exports = nextConfig;

export default nextConfig;
