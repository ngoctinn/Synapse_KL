import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // serverActions: true, // No longer needed in Next.js 16
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dspxxsdvuenhhhrqqfsp.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
