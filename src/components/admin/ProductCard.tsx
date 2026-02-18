"use client";
import Image from "next/image";
import { Trash2, Loader2, Power, PowerOff } from "lucide-react";

export default function ProductCard({
  product,
  onToggleStatus,
  onDelete,
  isToggling,
}: any) {
  const isAvailable = product.is_available;

  return (
    <div
      className={`bg-white p-3 rounded-[1.5rem] shadow-sm border border-slate-100 flex gap-4 transition-all hover:shadow-lg hover:border-orange-100 group relative overflow-hidden ${!isAvailable ? "opacity-70 grayscale" : ""}`}
    >
      {/* Imagen */}
      <div className="relative w-24 h-24 shrink-0 bg-slate-50 rounded-2xl overflow-hidden">
        <Image
          src={
            product.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
          }
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="100px"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
            <PowerOff className="text-white drop-shadow-md" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-slate-900 text-sm leading-tight truncate pr-6">
              {product.name}
            </h3>
            <button
              onClick={() => onDelete(product.id)}
              className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors p-1"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            {product.description || "Sin descripción"}
          </p>
        </div>

        <div className="flex justify-between items-end">
          <span className="font-black text-slate-900">
            S/ {product.price.toFixed(2)}
          </span>

          {/* Toggle Switch Custom */}
          <button
            onClick={() => onToggleStatus(product.id, isAvailable)}
            disabled={isToggling}
            className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${isAvailable ? "bg-green-500" : "bg-slate-200"}`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-sm flex items-center justify-center transition-transform ${isAvailable ? "translate-x-5" : "translate-x-0"}`}
            >
              {isToggling && (
                <Loader2 size={10} className="animate-spin text-slate-400" />
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
