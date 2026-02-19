"use client";
import Image from "next/image";
import { Trash2, Edit2, Loader2, Package } from "lucide-react";

// ESCUDO PROTECTOR: Valida que el texto sea realmente una URL.
const getValidImageUrl = (url: string) => {
  if (!url || typeof url !== "string")
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
  try {
    new URL(url); // Si esto falla, va al catch
    return url;
  } catch (_) {
    // Si no es una URL válida, devuelve la imagen por defecto
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
  }
};

export default function ProductCard({
  product,
  onToggleStatus,
  onDelete,
  onEdit,
  isToggling,
}: any) {
  // LÓGICA DE STOCK: No disponible si lo apagas manualmente OR si el stock llega a 0
  const isAvailable =
    product.is_available && (product.stock === null || product.stock > 0);
  const hasStockLimit = product.stock !== null && product.stock !== undefined;

  const safeImageUrl = getValidImageUrl(product.image_url);

  return (
    <div
      className={`bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-200 flex flex-col gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-200 group relative overflow-hidden ${!isAvailable ? "opacity-60 bg-slate-50" : ""}`}
    >
      <div className="flex gap-4">
        {/* Imagen con fondo sutil naranja */}
        <div className="relative w-20 h-20 shrink-0 bg-orange-50 rounded-xl overflow-hidden border border-orange-100/50">
          <Image
            src={safeImageUrl}
            alt={product.name || "Plato"}
            fill
            className={`object-cover transition-all duration-700 ${!isAvailable ? "grayscale" : "group-hover:scale-105"}`}
            sizes="100px"
          />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-start py-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 pr-2 group-hover:text-orange-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(product)}
                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                title="Editar producto"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Eliminar producto"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="mt-auto pt-2 flex items-center justify-between">
            <span className="font-black text-slate-900 tracking-tight">
              S/ {product.price?.toFixed(2)}
            </span>

            {/* Toggle Switch */}
            <button
              onClick={() => onToggleStatus(product.id, product.is_available)}
              disabled={isToggling}
              className={`w-10 h-5 rounded-full p-1 transition-all duration-300 flex items-center shadow-inner ${product.is_available ? "bg-orange-500" : "bg-slate-300"}`}
            >
              <div
                className={`bg-white w-3 h-3 rounded-full shadow-sm flex items-center justify-center transition-all duration-300 ${product.is_available ? "translate-x-5" : "translate-x-0"}`}
              >
                {isToggling && (
                  <Loader2 size={8} className="animate-spin text-orange-500" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de Stock */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-bold">
        <span className="text-slate-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
          <Package size={12} /> Inventario
        </span>
        <span
          className={
            hasStockLimit
              ? product.stock === 0
                ? "text-red-500"
                : "text-orange-600"
              : "text-emerald-600"
          }
        >
          {hasStockLimit
            ? product.stock === 0
              ? "Agotado"
              : `Quedan ${product.stock}`
            : "Ilimitado"}
        </span>
      </div>
    </div>
  );
}
