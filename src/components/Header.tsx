"use client";
import { ChefHat } from "lucide-react";

export default function Header() {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* HEADER ESTILO APPLE (Glassmorphism) 
          1. bg-white/70: Mucho más transparente (antes 90).
          2. backdrop-blur-3xl: Desenfoque "congelado" súper fuerte.
          3. border-white/40: Borde sutil para definir el cristal.
      */}
      <header className="pointer-events-auto w-full max-w-5xl bg-white/70 backdrop-blur-3xl shadow-2xl shadow-black/5 border border-white/40 rounded-full py-3 px-5 flex items-center justify-between transition-all duration-300 hover:bg-white/90 hover:shadow-orange-500/10 group">
        {/* IZQUIERDA: Marca */}
        <div className="flex items-center gap-3">
          {/* Logo Naranja Vibrante */}
          <div className="flex items-center justify-center bg-orange-500 text-white h-10 w-10 rounded-xl shadow-lg shadow-orange-200/50 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <ChefHat size={22} strokeWidth={2.5} />
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="font-black tracking-tighter text-gray-900 leading-none text-lg group-hover:text-orange-500 transition-colors">
              D' Irma
            </h1>
            <p className="font-bold text-[9px] text-gray-500 uppercase tracking-[0.2em] mt-0.5 group-hover:text-gray-400 transition-colors">
              Sazón Judicial
            </p>
          </div>
        </div>

        {/* DERECHA: Estado */}
        <div>
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50/50 border border-emerald-100/50 backdrop-blur-md shadow-sm">
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
