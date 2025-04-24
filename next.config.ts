import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://*.rbxcdn.com/**')],
  },
};

export default nextConfig;
