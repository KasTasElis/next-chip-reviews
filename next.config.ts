import type { NextConfig } from "next";
import "./env";

const nextConfig: NextConfig = {
  /* config options here */
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.daisyui.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "vtbzagduqkqkxtdchpmb.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
