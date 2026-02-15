import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = withPWA({
  dest: "public", // Donde se guardan los archivos del service worker
  cacheOnFrontEndNav: true, // Hace que la navegación sea instantánea
  aggressiveFrontEndNavCaching: true, // Fuerza el caché agresivo
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // Desactiva PWA en modo desarrollo para que no te moleste
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default pwaConfig(nextConfig);