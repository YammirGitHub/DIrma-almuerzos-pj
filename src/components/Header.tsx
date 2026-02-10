"use client";
import { UtensilsCrossed } from "lucide-react";

export default function Header() {
  return (
    // 'sticky' para que te siga al bajar, 'z-50' para estar encima de todo
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-gray-200 shadow-sm transition-all">
      {/* Contenedor interno limitado a max-w-5xl para alinearse con el cuerpo */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Marca */}
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 rounded-xl shadow-lg shadow-black/20 transform hover:scale-105 transition-transform">
            <UtensilsCrossed size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-gray-900 leading-none">
              D' Irma
            </h1>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">
              Esencia y sazón
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-green-800 uppercase tracking-wide hidden sm:block">
            Pedidos Abiertos
          </span>
          <span className="text-xs font-bold text-green-800 uppercase tracking-wide sm:hidden">
            Abierto
          </span>
        </div>
      </div>
    </header>
  );
}
