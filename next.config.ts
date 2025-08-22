import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily disable static export to resolve build issues
  // output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  // i18n configuration is not supported in App Router
  // Use the new internationalization features instead
  // https://nextjs.org/docs/app/building-your-application/routing/internationalization
};

export default nextConfig;