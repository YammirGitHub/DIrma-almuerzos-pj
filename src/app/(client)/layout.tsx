import Header from "@/components/Header";

// Este layout SOLO aplica a la tienda, no al admin
export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Aquí va el Header que solo el cliente debe ver */}
      <Header />

      {/* Contenido de la tienda */}
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
