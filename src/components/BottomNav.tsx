"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ReceiptText } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();

  // Ocultar en rutas de admin
  if (pathname.startsWith("/admin")) return null;

  const navItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Mis Consumos", href: "/historial", icon: ReceiptText },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-safe pointer-events-none">
      {/* Contenedor Flotante (Isla Dinámica) */}
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] w-full pb-[env(safe-area-inset-bottom)] pt-2 md:w-auto md:min-w-[320px] md:rounded-full md:mb-6 md:border md:pb-2 md:px-8 md:shadow-2xl">
        <ul className="flex items-center justify-around h-14 md:gap-12 relative">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li
                key={item.href}
                className="relative w-full md:w-auto flex justify-center"
              >
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-300 relative py-2 ${
                    isActive
                      ? "text-orange-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {/* Fondo activo animado (Píldora sutil) */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute -top-0.5 w-12 h-1 bg-orange-500 rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  <div className="relative">
                    <Icon
                      size={24}
                      strokeWidth={isActive ? 2.5 : 2}
                      className="transition-all"
                    />
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute inset-0 bg-orange-400/20 blur-lg rounded-full"
                      />
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold tracking-tight transition-all ${isActive ? "opacity-100 translate-y-0" : "opacity-70 translate-y-0.5"}`}
                  >
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
