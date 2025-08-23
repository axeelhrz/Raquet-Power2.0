/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'https://e-wanted.com/api/:path*' },
    ];
  },
};
module.exports = nextConfig;


export default nextConfig;