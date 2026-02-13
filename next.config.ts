/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Agrega esto también por si tus productos vienen de Supabase
      // (Cambia 'tustringdeproyecto' por lo que salga en tus URLs de Supabase)
      // {
      //   protocol: 'https',
      //   hostname: '**.supabase.co',
      // },
    ],
  },
};

export default nextConfig;