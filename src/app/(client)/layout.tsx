import Header from "@/components/Header";

// Este layout SOLO aplica a la tienda
export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 'bg-transparent' para que se vea el gradiente del body
    <div className="bg-transparent min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
