import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "D' Irma | Sazón Judicial",
  description: "Gastronomía casera premium.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Barra transparente para ver el fondo
    title: "D' Irma",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // CLAVE: Usa toda la pantalla, incluso detrás del Notch
  themeColor: "transparent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased scroll-smooth">
      <body
        className={`${inter.className} min-h-screen bg-[#F8F9FA] text-gray-900 relative`}
      >
        {/* --- 1. DEGRADADO SUPERIOR (STATUS BAR) --- */}
        {/* Oscuro suave para que la hora blanca se lea siempre, pero difuminado */}
        <div className="fixed top-0 left-0 right-0 h-12 z-[40] bg-gradient-to-b from-black/40 to-transparent pointer-events-none backdrop-blur-[1px]" />

        {/* --- 2. DEGRADADO INFERIOR (HOME BAR) --- */}
        {/* Blanco suave para que el contenido se pierda al bajar */}
        <div className="fixed bottom-0 left-0 right-0 h-12 z-[40] bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/80 to-transparent pointer-events-none backdrop-blur-[2px]" />

        {/* --- CONTENIDO --- */}
        {children}
      </body>
    </html>
  );
}
