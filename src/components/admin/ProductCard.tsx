"use client";
import Image from "next/image";
import { Trash2, Loader2 } from "lucide-react";

interface ProductCardProps {
  product: any;
  onToggleStatus: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
}

export default function ProductCard({
  product,
  onToggleStatus,
  onDelete,
  isToggling,
}: ProductCardProps) {
  return (
    <div
      className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all ${!product.is_available ? "opacity-60 grayscale" : ""}`}
    >
      <div className="relative w-20 h-20 shrink-0 bg-gray-100 rounded-xl overflow-hidden">
        <Image
          src={
            product.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
          }
          alt={product.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-sm text-gray-900 truncate pr-2">
            {product.name}
          </h3>
          <button
            onClick={() => onDelete(product.id)}
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <p className="text-base font-black text-gray-900 mt-1">
          S/ {product.price.toFixed(2)}
        </p>

        {/* Toggle de Disponibilidad */}
        <div className="flex justify-end mt-2">
          <button
            onClick={() => onToggleStatus(product.id, product.is_available)}
            disabled={isToggling}
            className={`w-10 h-6 rounded-full transition-colors relative ${product.is_available ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm flex items-center justify-center ${product.is_available ? "translate-x-4" : ""}`}
            >
              {isToggling && (
                <Loader2 size={10} className="animate-spin text-gray-400" />
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
