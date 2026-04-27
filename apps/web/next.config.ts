import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["oas", "es5-ext"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pandascore.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-api.pandascore.co",
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
