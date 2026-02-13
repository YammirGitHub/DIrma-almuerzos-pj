import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "D' Irma | Sazón Judicial",
  description: "Gastronomía casera premium exclusiva para el Poder Judicial.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // HACE LA BARRA TRANSPARENTE
    title: "D' Irma",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // ESTO ES LA CLAVE PARA EL EFECTO INMERSIVO
  interactiveWidget: "resizes-content",
  themeColor: "transparent", // Permite que el fondo de la web se vea en la barra
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased scroll-smooth">
      {/* bg-gray-900 asegura que si hay rebote arriba, sea oscuro (coincide con tu Hero) */}
      <body
        className={`${inter.className} min-h-screen bg-gray-900 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
