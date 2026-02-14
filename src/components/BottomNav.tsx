"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ReceiptText } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();

  // Ocultar en admin
  if (pathname.startsWith("/admin")) return null;

  const navItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Mis Consumos", href: "/historial", icon: ReceiptText },
  ];

  return (
    <div
      id="app-bottom-nav"
      // Agregamos padding inferior seguro para iPhone
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none transition-transform duration-500 ease-in-out pb-safe"
    >
      {/* DISEÑO PREMIUM "ISLA FLOTANTE" CON SOMBRA DEFINIDA:
         - bg-white/90: Fondo más sólido para contraste.
         - border-gray-200/40: Borde sutil para definir el límite.
         - shadow-xl shadow-black/5: Sombra suave pero oscura para elevar.
         - ring-1 ring-black/5: Anillo exterior para nitidez extra.
      */}
      <nav className="pointer-events-auto w-full max-w-[320px] mx-4 mb-4 bg-white/90 backdrop-blur-xl border border-gray-200/40 rounded-full shadow-xl shadow-black/5 ring-1 ring-black/5 px-2 py-2">
        <ul className="flex items-center justify-between px-6 h-14 relative">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li
                key={item.href}
                className="relative w-full flex justify-center"
              >
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-1 w-full transition-colors duration-300 ${
                    isActive
                      ? "text-orange-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      // Pill más suave detrás del icono
                      className="absolute -top-1 w-12 h-10 bg-orange-100/50 rounded-2xl -z-10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}

                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`}
                  />
                  <span className="text-[10px] font-bold tracking-tight leading-none mt-0.5">
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
