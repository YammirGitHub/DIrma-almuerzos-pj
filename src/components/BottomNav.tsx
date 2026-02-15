"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ReceiptText } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const navItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Mis Consumos", href: "/historial", icon: ReceiptText },
  ];

  return (
    <div
      id="app-bottom-nav"
      className="fixed bottom-0 left-0 pb-safe right-0 z-40 flex justify-center pointer-events-none transition-transform duration-500 ease-in-out"
    >
      <nav
        className="
          pointer-events-auto 
          /* EFECTO CRISTAL (IGUAL AL HEADER) */
          bg-white/80 backdrop-blur-2xl border border-white/50
          
          /* SOMBRA PREMIUM (Clave para diferenciarse del fondo) */
          /* Sombra oscura sutil hacia arriba + Anillo interno de luz */
          shadow-[0_-8px_30px_rgba(0,0,0,0.08)] ring-1 ring-white/60

          /* --- MOVIL (Nativo Fusionado) --- */
          w-full 
          rounded-t-[2.5rem] /* Curva suave arriba */
          pb-[calc(env(safe-area-inset-bottom)+1rem)] /* Padding dinámico para iPhone */
          pt-4 px-6 

          /* --- PC/TABLET (Isla Flotante) --- */
          md:w-auto 
          md:min-w-[340px] 
          md:rounded-full /* Píldora completa */
          md:mb-8 md:pb-3 md:pt-3 md:px-10
          md:shadow-2xl md:shadow-orange-900/10 /* Sombra cálida en PC */
        "
      >
        <ul className="flex items-center justify-around md:gap-16 h-12 relative">
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
                  className={`flex flex-col items-center gap-1 w-full transition-all duration-300 ${
                    isActive
                      ? "text-orange-600 scale-105"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {/* Pill de fondo (Sutil y elegante) */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute -top-3 w-12 h-12 bg-gradient-to-b from-orange-100/80 to-transparent rounded-2xl -z-10 blur-[2px]"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}

                  <Icon
                    size={26} // Icono ligeramente más grande para tacto
                    strokeWidth={isActive ? 2.5 : 2}
                    className="drop-shadow-sm"
                  />
                  <span className="text-[9px] font-bold tracking-tight leading-none mt-0.5">
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
