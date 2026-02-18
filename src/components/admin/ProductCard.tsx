"use client";
import Image from "next/image";
import { Trash2, Loader2, Power, Edit3 } from "lucide-react";

export default function ProductCard({
  product,
  onToggleStatus,
  onDelete,
  isToggling,
}: any) {
  const isAvailable = product.is_available;

  return (
    <div
      className={`bg-white p-3 rounded-[2rem] shadow-sm border border-slate-100 flex gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 group relative overflow-hidden ${!isAvailable ? "opacity-60" : ""}`}
    >
      {/* Imagen Squircle */}
      <div className="relative w-24 h-24 shrink-0 bg-slate-50 rounded-[1.2rem] overflow-hidden shadow-inner">
        <Image
          src={
            product.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
          }
          alt={product.name}
          fill
          className={`object-cover transition-all duration-700 ${!isAvailable ? "grayscale" : "group-hover:scale-110"}`}
          sizes="100px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-slate-900 text-sm leading-tight truncate pr-8">
              {product.name}
            </h3>

            {/* Botón Borrar (Absolute Top Right) */}
            <button
              onClick={() => onDelete(product.id)}
              className="absolute top-4 right-4 text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all active:scale-90"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description || "Sin descripción disponible"}
          </p>
        </div>

        <div className="flex justify-between items-end mt-2">
          <span className="font-black text-slate-900 text-lg tracking-tight">
            S/ {product.price.toFixed(2)}
          </span>

          {/* Toggle Switch Premium */}
          <button
            onClick={() => onToggleStatus(product.id, isAvailable)}
            disabled={isToggling}
            className={`w-11 h-6 rounded-full p-1 transition-all duration-300 flex items-center shadow-inner ${isAvailable ? "bg-green-500" : "bg-slate-200"}`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ${isAvailable ? "translate-x-5" : "translate-x-0"}`}
            >
              {isToggling && (
                <Loader2 size={8} className="animate-spin text-slate-400" />
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
