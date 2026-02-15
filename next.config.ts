import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Este "comodín" ya incluye a Unsplash, Supabase y todo lo demás.
      },
    ],
  },
};

export default nextConfig;