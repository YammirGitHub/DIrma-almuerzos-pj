import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "D' Irma | Almuerzos PJ",
  description: "Pide tu almuerzo al juzgado.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        
        {/* HEADER: Ahora es Sticky y ocupa todo el ancho */}
        <Header />

        {/* CONTENIDO PRINCIPAL: Flexible pero centrado */}
        {/* En móvil: w-full. En PC: max-w-5xl (para no estirar demasiado las fotos) */}
        <div className="flex-1 w-full max-w-5xl mx-auto bg-gray-50 sm:px-6 lg:px-8">
          {/* Sombra sutil y bordes solo en pantallas grandes para efecto "Tarjeta Flotante" */}
          <div className="w-full min-h-screen bg-white sm:shadow-xl sm:rounded-b-3xl sm:min-h-[calc(100vh-80px)] overflow-hidden border-x border-gray-100/50">
             {children}
          </div>
        </div>
        
      </body>
    </html>
  );
}