import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude packages with problematic paths from Turbopack bundling
  serverExternalPackages: ['oas', 'es5-ext', '@api/developers-pandascore', 'api'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pandascore.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
