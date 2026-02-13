"use client";
import { ChefHat } from "lucide-react";

export default function Header() {
  return (
    // ID IMPORTANTE: "app-header" permite controlarlo desde CSS global
    <div
      id="app-header"
      className="fixed top-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none transition-all duration-500"
    >
      {/* HEADER ISLA FLOTANTE (Diseño Unificado)
          1. bg-white/80: Transparencia láctea premium.
          2. shadow-orange-900/5: Sombra cálida (no negra) para unificar con la marca.
          3. rounded-full: Forma orgánica perfecta.
      */}
      <header className="pointer-events-auto w-full max-w-5xl bg-white/80 backdrop-blur-2xl shadow-2xl shadow-orange-900/5 border border-white/60 rounded-full py-3 px-6 flex items-center justify-between transition-all hover:bg-white hover:shadow-orange-500/10 hover:scale-[1.01] group">
        {/* IZQUIERDA: Marca */}
        <div className="flex items-center gap-3">
          {/* Logo con gradiente sutil o color sólido premium */}
          <div className="flex items-center justify-center bg-orange-500 text-white h-10 w-10 rounded-xl shadow-lg shadow-orange-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <ChefHat size={22} strokeWidth={2.5} />
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="font-black tracking-tighter text-gray-900 leading-none text-lg group-hover:text-orange-600 transition-colors">
              D' Irma
            </h1>
            <p className="font-bold text-[9px] text-gray-400 uppercase tracking-[0.2em] mt-0.5 group-hover:text-orange-400 transition-colors">
              Esencia y sazón
            </p>
          </div>
        </div>

        {/* DERECHA: Estado */}
        <div>
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50/50 border border-emerald-100/50 backdrop-blur-md shadow-sm group-hover:bg-emerald-50 transition-colors">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide hidden sm:block">
              Pedidos Abiertos
            </span>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide sm:hidden">
              ON
            </span>
          </div>
        </div>
      </header>
    </div>
  );
}
