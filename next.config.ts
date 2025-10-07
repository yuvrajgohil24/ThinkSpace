import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  dir: "./src",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
