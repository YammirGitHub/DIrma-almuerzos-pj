"use client";

import { useState, useMemo, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Plus,
  Minus,
  Utensils,
  X,
  ChefHat,
  Salad,
  Soup,
  Info,
  Check,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CheckoutModal from "./CheckoutModal";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- TIPOS ESTRICTOS (Actualizados para el nuevo JSONB) ---
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  stock?: number | null;
  options?: {
    entradas?: string[];
    bebidas?: string[];
    adicionales?: { name: string; price: number }[];
  } | null;
};

// Ampliamos el CartItem para soportar la nueva estructura de adicionales
type CartItem = {
  product: Product;
  qty: number;
  options?: {
    entrada?: string;
    bebida?: string;
    adicionales?: { name: string; price: number }[];
  };
};
type Cart = { [key: string]: CartItem };

// FILTROS PRINCIPALES SIMPLIFICADOS
const CATEGORIES = [
  { id: "all", label: "Todo" },
  { id: "menu", label: "Menú Ejecutivo" },
  { id: "plato", label: "A la Carta" },
  { id: "diet", label: "Dietas" },
];

export default function MenuList({
  products: initialProducts,
}: {
  products: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<Cart>({});
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [filter, setFilter] = useState("all");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // MODAL DINÁMICO (Estado actualizado para los nuevos adicionales)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempOptions, setTempOptions] = useState<{
    entrada: string;
    bebida: string;
    adicionales: { name: string; price: number }[];
  }>({ entrada: "", bebida: "", adicionales: [] });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    const savedCart = localStorage.getItem("d-irma-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }
    setIsCartLoaded(true);
  }, []);

  useEffect(() => {
    if (isCartLoaded) localStorage.setItem("d-irma-cart", JSON.stringify(cart));
  }, [cart, isCartLoaded]);

  useEffect(() => {
    const channel = supabase
      .channel("menu_realtime_v8")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          if (payload.eventType === "INSERT")
            setProducts((prev) => [...prev, payload.new as Product]);
          else if (payload.eventType === "UPDATE")
            setProducts((prev) =>
              prev.map((p) =>
                p.id === payload.new.id ? (payload.new as Product) : p,
              ),
            );
          else if (payload.eventType === "DELETE")
            setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    if (selectedProduct || isCheckoutOpen)
      document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, [selectedProduct, isCheckoutOpen]);

  const groupedProducts = useMemo(() => {
    const active = products.filter(
      (p) =>
        p.is_available &&
        (p.stock === null || p.stock === undefined || p.stock > 0),
    );
    return {
      menu: active.filter((p) => p.category === "menu"),
      plato: active.filter((p) => p.category === "plato"),
      diet: active.filter((p) => p.category === "diet"),
    };
  }, [products]);

  const addToCart = (product: Product, options: any = null) => {
    const cartItemId = options
      ? `${product.id}-${JSON.stringify(options)}`
      : product.id;

    let finalProduct = { ...product };
    if (options && options.adicionales && options.adicionales.length > 0) {
      const extraCost = options.adicionales.reduce(
        (sum: number, ext: { name: string; price: number }) =>
          sum + Number(ext.price),
        0,
      );
      finalProduct.price = product.price + extraCost;
    }

    setCart((prev) => {
      const existing = prev[cartItemId];
      return {
        ...prev,
        [cartItemId]: {
          product: finalProduct,
          qty: (existing?.qty || 0) + 1,
          options,
        },
      };
    });
    setSelectedProduct(null);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => {
      const current = prev[cartItemId];
      if (!current) return prev;
      if (current.qty > 1)
        return { ...prev, [cartItemId]: { ...current, qty: current.qty - 1 } };
      const newCart = { ...prev };
      delete newCart[cartItemId];
      return newCart;
    });
  };

  const getProductQty = (productId: string) =>
    Object.values(cart)
      .filter((item) => item.product.id === productId)
      .reduce((acc, item) => acc + item.qty, 0);

  const handleProductAction = (product: Product, action: "add" | "remove") => {
    const isConfigurable = ["menu", "diet", "plato"].includes(product.category);

    if (action === "add" && isConfigurable) {
      setTempOptions({
        entrada: product.options?.entradas?.[0] || "",
        bebida: product.options?.bebidas?.[0] || "",
        adicionales: [],
      });
      setSelectedProduct(product);
    } else if (action === "add") {
      addToCart(product);
    } else {
      const simpleId = product.id;
      if (cart[simpleId]) removeFromCart(simpleId);
      else setIsCheckoutOpen(true);
    }
  };

  const toggleExtra = (extraProduct: { name: string; price: number }) => {
    setTempOptions((prev) => {
      const isSelected = prev.adicionales.some(
        (e) => e.name === extraProduct.name,
      );
      if (isSelected) {
        return {
          ...prev,
          adicionales: prev.adicionales.filter(
            (e) => e.name !== extraProduct.name,
          ),
        };
      } else {
        return { ...prev, adicionales: [...prev.adicionales, extraProduct] };
      }
    });
  };

  const totalItems = Object.values(cart).reduce(
    (acc, item) => acc + item.qty,
    0,
  );
  const totalPrice = Object.values(cart).reduce(
    (acc, item) => acc + item.product.price * item.qty,
    0,
  );

  const currentModalPrice = selectedProduct
    ? selectedProduct.price +
      tempOptions.adicionales.reduce((acc, ext) => acc + Number(ext.price), 0)
    : 0;

  const renderSection = (
    key: keyof typeof groupedProducts,
    title: string,
    icon: any,
    colorClass: string,
  ) => {
    const items = groupedProducts[key];
    if (!items || items.length === 0) return null;
    if (filter !== "all" && filter !== key) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-12"
      >
        {(filter === "all" || filter === key) && (
          <div className="flex items-center gap-3 mb-6 px-2">
            <div
              className={`p-2.5 rounded-2xl text-white shadow-sm ${colorClass}`}
            >
              {icon}
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              {title}
            </h3>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              qty={getProductQty(product.id)}
              onAdd={() => handleProductAction(product, "add")}
              onRemove={() => handleProductAction(product, "remove")}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* HEADER CARTA */}
      <div className="mb-6 px-2 md:px-0 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-1 bg-orange-500 rounded-full"></span>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
              Sazón Norteña
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
            Nuestra Carta
          </h2>
          <p className="text-slate-500 font-medium mt-3 text-sm md:text-base max-w-lg leading-relaxed">
            Ingredientes frescos, tradición chiclayana y el cariño de siempre.
          </p>
        </div>
      </div>

      {/* FILTROS PRINCIPALES */}
      <div className="sticky top-[5rem] z-30 w-full mb-8 pointer-events-none">
        <div className="absolute inset-0 backdrop-blur-xl -mx-4 md:-mx-8 lg:-mx-12 mask-gradient-b pointer-events-none" />
        <div className="relative py-3 flex flex-wrap justify-center gap-2.5 max-w-[1400px] mx-auto px-2 pointer-events-auto">
          {CATEGORIES.map((cat) => {
            const isActive = filter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={cn(
                  "relative px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 shadow-sm border active:scale-95 backdrop-blur-md",
                  isActive
                    ? "bg-orange-600 text-white border-orange-600 shadow-orange-500/20 z-10"
                    : "bg-white/90 text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-600",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 bg-orange-600 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pb-32 min-h-[60vh] max-w-[1400px] mx-auto">
        {renderSection(
          "menu",
          "Menú Ejecutivo",
          <ChefHat size={20} />,
          "bg-orange-500",
        )}
        {renderSection(
          "plato",
          "Especiales a la Carta",
          <Soup size={20} />,
          "bg-red-500",
        )}
        {renderSection(
          "diet",
          "Dietas Saludables",
          <Salad size={20} />,
          "bg-green-500",
        )}

        {Object.entries(groupedProducts).every(
          ([, arr]) => arr.length === 0,
        ) && (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in zoom-in text-slate-400">
            <div className="bg-white p-8 rounded-full mb-6 shadow-xl shadow-slate-200/50">
              <Utensils
                size={48}
                className="text-slate-300"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-xl font-black text-slate-700 tracking-tight">
              No hay platos disponibles
            </h3>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL DE OPCIONES DINÁMICO (UX PREMIUM & CROSS-SELLING) */}
      {/* ============================================================== */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 isolate overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white w-full sm:max-w-[500px] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] z-10 overflow-hidden ring-1 ring-black/5"
            >
              {/* Imagen del Producto (Hero) */}
              <div className="relative h-48 sm:h-56 shrink-0 bg-slate-100 w-full">
                <Image
                  src={
                    selectedProduct.image_url ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                  }
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-black/10 to-black/30" />

                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-5 right-5 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-all shadow-sm border border-white/20 active:scale-95"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Contenido Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5 bg-white space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Cabecera del Plato */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                      {selectedProduct.name}
                    </h2>
                    {selectedProduct.description && (
                      <p className="text-slate-500 text-sm mt-1.5 font-medium leading-relaxed text-pretty">
                        {selectedProduct.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                      Precio Base
                    </span>
                    <span className="text-xl font-black text-slate-900 tracking-tighter bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                      S/ {selectedProduct.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="h-px w-full bg-slate-100"></div>

                <div className="space-y-8">
                  {/* SECCIÓN 1: ENTRADAS */}
                  {selectedProduct.options?.entradas &&
                    selectedProduct.options.entradas.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                              1
                            </span>
                            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                              ¿Qué entrada deseas?
                            </h3>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-widest">
                            Incluido
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                          {selectedProduct.options.entradas.map((opt) => {
                            const isSelected = tempOptions.entrada === opt;
                            return (
                              <button
                                type="button"
                                key={opt}
                                onClick={() =>
                                  setTempOptions({
                                    ...tempOptions,
                                    entrada: opt,
                                  })
                                }
                                className={cn(
                                  "flex items-center justify-between w-full text-left p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] border",
                                  isSelected
                                    ? "bg-orange-50/50 border-orange-300 shadow-sm ring-1 ring-orange-100"
                                    : "bg-white border-slate-200 hover:border-orange-200",
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                                      isSelected
                                        ? "border-orange-500 bg-white"
                                        : "border-slate-300 bg-slate-50",
                                    )}
                                  >
                                    {isSelected && (
                                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                                    )}
                                  </div>
                                  <span
                                    className={cn(
                                      "text-sm font-bold transition-colors",
                                      isSelected
                                        ? "text-orange-900"
                                        : "text-slate-700",
                                    )}
                                  >
                                    {opt}
                                  </span>
                                </div>
                                <span
                                  className={cn(
                                    "text-xs font-black uppercase tracking-widest",
                                    isSelected
                                      ? "text-orange-500"
                                      : "text-slate-400",
                                  )}
                                >
                                  Gratis
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* SECCIÓN 2: BEBIDAS */}
                  {selectedProduct.options?.bebidas &&
                    selectedProduct.options.bebidas.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                              2
                            </span>
                            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                              ¿Qué bebida deseas?
                            </h3>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-widest">
                            Incluido
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                          {selectedProduct.options.bebidas.map((opt) => {
                            const isSelected = tempOptions.bebida === opt;
                            return (
                              <button
                                type="button"
                                key={opt}
                                onClick={() =>
                                  setTempOptions({
                                    ...tempOptions,
                                    bebida: opt,
                                  })
                                }
                                className={cn(
                                  "flex items-center justify-between w-full text-left p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] border",
                                  isSelected
                                    ? "bg-orange-50/50 border-orange-300 shadow-sm ring-1 ring-orange-100"
                                    : "bg-white border-slate-200 hover:border-orange-200",
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                                      isSelected
                                        ? "border-orange-500 bg-white"
                                        : "border-slate-300 bg-slate-50",
                                    )}
                                  >
                                    {isSelected && (
                                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                                    )}
                                  </div>
                                  <span
                                    className={cn(
                                      "text-sm font-bold transition-colors",
                                      isSelected
                                        ? "text-orange-900"
                                        : "text-slate-700",
                                    )}
                                  >
                                    {opt}
                                  </span>
                                </div>
                                <span
                                  className={cn(
                                    "text-xs font-black uppercase tracking-widest",
                                    isSelected
                                      ? "text-orange-500"
                                      : "text-slate-400",
                                  )}
                                >
                                  Gratis
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* SECCIÓN 3: UPSELLING (Adicionales) */}
                  {selectedProduct.options?.adicionales &&
                    selectedProduct.options.adicionales.length > 0 && (
                      <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-orange-100 text-orange-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                              <Plus size={12} />
                            </span>
                            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                              ¿Quieres agregar algo extra?
                            </h3>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-widest">
                            Opcional
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                          {selectedProduct.options.adicionales.map(
                            (extra, idx) => {
                              const isSelected = tempOptions.adicionales.some(
                                (e) => e.name === extra.name,
                              );
                              return (
                                <button
                                  type="button"
                                  key={idx}
                                  onClick={() => toggleExtra(extra)}
                                  className={cn(
                                    "flex items-center justify-between w-full text-left p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] border",
                                    isSelected
                                      ? "bg-orange-50/50 border-orange-300 shadow-sm ring-1 ring-orange-100" // <-- ESTILO NARANJA UNIFICADO
                                      : "bg-white border-slate-200 hover:border-orange-200",
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={cn(
                                        "w-5 h-5 rounded-[6px] flex items-center justify-center transition-all border-2 shrink-0", // <-- CHECK CUADRADO
                                        isSelected
                                          ? "border-orange-500 bg-orange-500 text-white"
                                          : "border-slate-300 bg-slate-50",
                                      )}
                                    >
                                      {isSelected && (
                                        <Check size={14} strokeWidth={4} />
                                      )}
                                    </div>
                                    <span
                                      className={cn(
                                        "text-sm font-bold transition-colors",
                                        isSelected
                                          ? "text-orange-900"
                                          : "text-slate-700",
                                      )}
                                    >
                                      {extra.name}
                                    </span>
                                  </div>
                                  <span
                                    className={cn(
                                      "text-sm font-black transition-colors shrink-0",
                                      isSelected
                                        ? "text-orange-600"
                                        : "text-slate-500",
                                    )}
                                  >
                                    + S/ {Number(extra.price).toFixed(2)}
                                  </span>
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Botón Flotante del Modal */}
              <div className="p-5 bg-white/90 backdrop-blur-xl border-t border-slate-100 safe-area-bottom shadow-[0_-15px_30px_rgba(0,0,0,0.03)] z-20">
                <button
                  type="button"
                  onClick={() => addToCart(selectedProduct, tempOptions)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4.5 rounded-[1.25rem] font-bold text-lg shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-between px-6 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="flex items-center gap-2 relative z-10">
                    <ShoppingBag
                      size={20}
                      strokeWidth={2.5}
                      className="opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    Añadir al Pedido
                  </span>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="h-5 w-[1px] bg-white/30"></div>
                    <span className="font-black tracking-tight text-xl drop-shadow-sm">
                      S/ {currentModalPrice.toFixed(2)}
                    </span>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- BOTÓN FLOTANTE CARRITO PRINCIPAL --- */}
      <AnimatePresence>
        {totalItems > 0 && !selectedProduct && (
          <motion.div
            id="floating-cart-btn"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-24 left-0 right-0 z-50 flex justify-center md:justify-end md:bottom-8 md:right-8 px-6 md:px-0 pointer-events-none safe-area-bottom"
          >
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="pointer-events-auto w-full max-w-sm md:w-auto md:min-w-[300px] bg-orange-600 text-white p-2.5 pl-4 pr-2.5 rounded-[1.75rem] shadow-2xl shadow-orange-600/30 flex items-center justify-between active:scale-[0.97] transition-all group ring-1 ring-white/10 hover:bg-orange-700 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white text-orange-600 h-11 w-11 flex items-center justify-center rounded-full text-sm font-black shadow-sm">
                  {totalItems}
                </div>
                <div className="flex flex-col items-start pr-4">
                  <span className="text-[10px] font-bold text-orange-200 uppercase tracking-widest leading-tight">
                    Total Consumo
                  </span>
                  <span className="font-bold text-white text-base leading-none drop-shadow-sm flex items-center gap-1 mt-0.5">
                    Ir a pagar <ChevronRight size={14} />
                  </span>
                </div>
              </div>
              <div className="bg-black/20 px-5 py-3 rounded-[1.25rem] text-white font-mono font-black border border-white/10 shadow-inner transition-colors">
                S/ {totalPrice.toFixed(2)}
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          close={() => setIsCheckoutOpen(false)}
          cart={cart}
          removeFromCart={removeFromCart}
          total={totalPrice}
        />
      )}
    </>
  );
}

const getSafeUrl = (url: string) => {
  if (!url) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
  try {
    new URL(url);
    return url;
  } catch {
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
  }
};

function ProductCard({ product, qty, onAdd, onRemove }: any) {
  const isConfigurable = ["menu", "diet", "plato"].includes(product.category);
  const safeImg = getSafeUrl(product.image_url);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={!qty ? onAdd : undefined}
      className="group relative flex flex-row md:flex-col gap-4 bg-white p-4 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 border border-slate-100 hover:border-slate-200 transition-all duration-300 cursor-pointer active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative w-28 h-28 md:w-full md:h-52 shrink-0 rounded-[1.5rem] overflow-hidden bg-slate-50">
        <Image
          src={safeImg}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 120px, 300px"
        />
        {/* Elegant Badge si configurable */}
        {isConfigurable && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-white/20 flex items-center gap-1">
            <ChefHat size={12} className="text-orange-500" />
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
              Arma tu plato
            </span>
          </div>
        )}
        <AnimatePresence>
          {qty > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-3 right-3 bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-md ring-4 ring-white"
            >
              {qty}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        <div>
          <h3 className="font-black text-slate-900 text-base md:text-lg leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-medium">
            {product.description || "Ingredientes frescos y seleccionados."}
          </p>
        </div>

        <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              Precio
            </span>
            <span className="font-black text-xl text-slate-900 tracking-tight leading-none">
              S/ {product.price.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          {qty > 0 && !isConfigurable ? (
            <div
              className="flex items-center bg-orange-50 rounded-2xl h-10 p-1 border border-orange-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="w-8 h-full flex items-center justify-center text-orange-600 hover:bg-white rounded-xl transition-all active:scale-95 shadow-sm"
              >
                <Minus size={16} strokeWidth={3} />
              </button>
              <span className="text-sm font-black w-7 text-center text-orange-700">
                {qty}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                className="w-8 h-full flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all active:scale-95 shadow-sm"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-orange-500 hover:text-white transition-all duration-300 active:scale-95 shadow-sm border border-slate-100 hover:border-orange-500 group-hover:bg-orange-50 group-hover:text-orange-600"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
