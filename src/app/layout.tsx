import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "D' Irma | Sazón Judicial",
  description: "Gastronomía casera premium.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Barra transparente para fusión total
    title: "D' Irma",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a", // Coincide con el Hero para que la barra de estado se vea integrada
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased scroll-smooth">
      {/* Eliminamos los gradientes fijos que ensuciaban la vista */}
      <body
        className={`${inter.className} min-h-screen bg-[#F8F9FA] text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
