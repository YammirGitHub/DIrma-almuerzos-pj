// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// ELIMINAR: import BottomNav from "@/components/BottomNav"; <--- BORRAR ESTO

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "D' Irma | Sazón Judicial",
  description: "Gastronomía casera premium.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "D' Irma",
  },
};

// src/app/layout.tsx

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prohíbe zoom máximo
  userScalable: false, // Prohíbe pellizcar
  viewportFit: "cover", // Usa toda la pantalla (incluido notch)
  themeColor: "#0f172a", // Color de la barra de estado de Android
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased scroll-smooth">
      <body
        className={`${inter.className} min-h-dvh bg-[#F8F9FA] text-gray-900`}
      >
        {children}
        {/* ELIMINAR: <BottomNav /> <--- BORRAR ESTO DE AQUÍ */}
      </body>
    </html>
  );
}
