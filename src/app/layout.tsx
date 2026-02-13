import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "D' Irma | Sazón Judicial",
  description: "Gastronomía casera premium exclusiva para el Poder Judicial.",
  // Agregamos iconos para que se vea bien al guardar en pantalla de inicio (iOS/Android)
  icons: {
    icon: "/favicon.ico", // Asegúrate de tener este archivo o bórralo si no
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Permitir zoom por accesibilidad (Mejor práctica UI/UX)
  // interactiveWidget soluciona problemas cuando sale el teclado en el checkout
  interactiveWidget: "resizes-content",
  themeColor: "#F8F9FA", // El color de la barra de estado del navegador combina con tu fondo
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased scroll-smooth">
      <body
        className={`${inter.className} min-h-screen bg-[#F8F9FA] text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
