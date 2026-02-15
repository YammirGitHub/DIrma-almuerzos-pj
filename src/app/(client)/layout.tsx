// src/app/(client)/layout.tsx
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header"; // <--- 1. IMPORTAR HEADER

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header /> {/* <--- 2. AGREGARLO AQUÍ ARRIBA */}
      {children}
      <BottomNav />
    </>
  );
}