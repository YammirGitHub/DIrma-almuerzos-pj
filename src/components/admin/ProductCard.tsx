"use client";
import Image from "next/image";
import { Trash2, Edit2, Loader2, Package, LayoutList } from "lucide-react";

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
  // LÓGICA DE STOCK
  const isAvailable =
    product.is_available && (product.stock === null || product.stock > 0);
  const hasStockLimit = product.stock !== null && product.stock !== undefined;

  const safeImageUrl = getValidImageUrl(product.image_url);

  // LÓGICA DE OPCIONES (Contar cuántas hay configuradas)
  const entradasCount = product.options?.entradas?.length || 0;
  const bebidasCount = product.options?.bebidas?.length || 0;
  const adicionalesCount = product.options?.adicionales?.length || 0;
  const hasConfig =
    entradasCount > 0 || bebidasCount > 0 || adicionalesCount > 0;

  return (
    <div
      className={`bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-200 flex flex-col gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-200 group relative overflow-hidden ${!isAvailable ? "opacity-60 bg-slate-50 grayscale-[0.5]" : ""}`}
    >
      <div className="flex gap-4">
        {/* Imagen con fondo sutil naranja */}
        <div className="relative w-24 h-24 sm:w-20 sm:h-20 shrink-0 bg-orange-50 rounded-xl overflow-hidden border border-orange-100/50">
          <Image
            src={safeImageUrl}
            alt={product.name || "Plato"}
            fill
            className={`object-cover transition-all duration-700 ${!isAvailable ? "grayscale" : "group-hover:scale-105"}`}
            sizes="100px"
          />
        </div>

        {/* Información Principal */}
        <div className="flex-1 flex flex-col justify-start min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 pr-2 group-hover:text-orange-600 transition-colors">
              {product.name}
            </h3>
            {/* Botones de Acción */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white/80 backdrop-blur-sm rounded-lg">
              <button
                onClick={() => onEdit(product)}
                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-all"
                title="Editar producto"
              >
                <Edit2 size={14} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                title="Eliminar producto"
              >
                <Trash2 size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Descripción Corta */}
          {product.description && (
            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-medium leading-tight">
              {product.description}
            </p>
          )}

          {/* Badges de Configuración (Upselling) */}
          {hasConfig && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {entradasCount > 0 && (
                <span className="text-[8px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                  🍲 {entradasCount} Ent
                </span>
              )}
              {bebidasCount > 0 && (
                <span className="text-[8px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                  🥤 {bebidasCount} Beb
                </span>
              )}
              {adicionalesCount > 0 && (
                <span className="text-[8px] font-bold bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-200/50">
                  ⭐ {adicionalesCount} Ext
                </span>
              )}
            </div>
          )}

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
