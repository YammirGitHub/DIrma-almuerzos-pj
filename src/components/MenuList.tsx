"use client";

import { useState, useMemo, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Plus,
  Minus,
  Utensils,
  X,
  ChefHat,
  Coffee,
  Salad,
  GlassWater,
  Soup,
  ArrowRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CheckoutModal from "./CheckoutModal";

// --- TIPOS ---
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
};

type CartItem = {
  product: Product;
  qty: number;
  options?: { entrada?: string; bebida?: string; cremas?: string };
};

type Cart = { [key: string]: CartItem };

const EXTRAS_OPTIONS = {
  entrada: [
    "Sopa del día",
    "Ensalada Fresca",
    "Papa a la Huancaína",
    "Tequeños",
  ],
  bebida: ["Chicha Morada", "Maracuyá", "Infusión Caliente", "Agua Mineral"],
};

// --- CONFIGURACIÓN DE CATEGORÍAS ---
const CATEGORIES = [
  { id: "all", label: "Todo" },
  { id: "menu", label: "Menú" },
  { id: "diet", label: "Dietas" },
  { id: "plato", label: "Carta" },
  { id: "extra", label: "Extras" },
  { id: "bebida", label: "Bebidas" },
];

export default function MenuList({
  products: initialProducts,
}: {
  products: Product[];
}) {
  // --- ESTADO ---
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<Cart>({});
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // UI State
  const [filter, setFilter] = useState("all");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempOptions, setTempOptions] = useState({
    entrada: EXTRAS_OPTIONS.entrada[0],
    bebida: EXTRAS_OPTIONS.bebida[0],
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // --- EFECTOS ---
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
      .channel("menu_realtime_v6")
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
  if (selectedProduct || isCheckoutOpen) {
    // ESTO ACTIVA LA ANIMACIÓN DEL HEADER
    document.body.classList.add("modal-open"); 
  } else {
    // ESTO LO TRAE DE VUELTA
    document.body.classList.remove("modal-open");
  }
  // Limpieza al desmontar
  return () => document.body.classList.remove("modal-open");
}, [selectedProduct, isCheckoutOpen]);
  // --- LÓGICA ---
  const groupedProducts = useMemo(() => {
    const active = products.filter((p) => p.is_available);
    return {
      menu: active.filter((p) => p.category === "menu"),
      plato: active.filter((p) => p.category === "plato"),
      diet: active.filter((p) => p.category === "diet"),
      extra: active.filter((p) => p.category === "extra"),
      bebida: active.filter((p) => p.category === "bebida"),
    };
  }, [products]);

  const addToCart = (product: Product, options: any = null) => {
    const cartItemId = options
      ? `${product.id}-${JSON.stringify(options)}`
      : product.id;
    setCart((prev) => {
      const existing = prev[cartItemId];
      return {
        ...prev,
        [cartItemId]: { product, qty: (existing?.qty || 0) + 1, options },
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

  const getProductQty = (productId: string) => {
    return Object.values(cart)
      .filter((item) => item.product.id === productId)
      .reduce((acc, item) => acc + item.qty, 0);
  };

  const handleProductAction = (product: Product, action: "add" | "remove") => {
    const isMenu = ["menu", "diet"].includes(product.category);
    if (action === "add" && isMenu) {
      setTempOptions({
        entrada: EXTRAS_OPTIONS.entrada[0],
        bebida: EXTRAS_OPTIONS.bebida[0],
      });
      setSelectedProduct(product);
      return;
    }
    if (action === "add") addToCart(product);
    else {
      const simpleId = product.id;
      if (cart[simpleId]) removeFromCart(simpleId);
      else setIsCheckoutOpen(true);
    }
  };

  const totalItems = Object.values(cart).reduce(
    (acc, item) => acc + item.qty,
    0,
  );
  const totalPrice = Object.values(cart).reduce(
    (acc, item) => acc + item.product.price * item.qty,
    0,
  );

  // --- RENDER SECCIONES ---
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
              className={`p-2.5 rounded-2xl text-white shadow-lg shadow-orange-500/10 ${colorClass}`}
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
      {/* 0. HEADER "NUESTRA CARTA" */}
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
            <span className="text-slate-800 font-bold block md:inline md:ml-1">
              ¡Elige tu favorito y disfruta!
            </span>
          </p>
        </div>
      </div>

      {/* 1. NAVEGACIÓN DE FILTROS (Clean & Floating) */}
      {/* Eliminamos el fondo global y dejamos que los botones "floten" sobre el contenido al hacer scroll */}
      <div className="sticky top-[5rem] z-30 w-full mb-8 pointer-events-none">
        {/* CONTENEDOR FILTROS: Pointer-events-auto para que los botones sean clickeables */}
        <div className="relative py-3 flex flex-wrap justify-center gap-2.5 max-w-[1400px] mx-auto px-2 pointer-events-auto">
          {CATEGORIES.map((cat) => {
            const isActive = filter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                // Añadimos shadow-lg y backdrop-blur A CADA BOTÓN para que se lean bien sobre el contenido
                className={`relative px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 shadow-sm border active:scale-95 backdrop-blur-md ${
                  isActive
                    ? "bg-orange-600 text-white border-orange-600 shadow-orange-500/40 z-10"
                    : "bg-white/90 text-slate-500 border-slate-200 hover:border-orange-200 hover:text-orange-600 hover:shadow-md"
                }`}
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

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="pb-32 min-h-[60vh] max-w-[1400px] mx-auto">
        {renderSection(
          "menu",
          "Menú Ejecutivo",
          <ChefHat size={20} />,
          "bg-orange-500",
        )}
        {renderSection(
          "diet",
          "Dietas Saludables",
          <Salad size={20} />,
          "bg-green-500",
        )}
        {renderSection(
          "plato",
          "Especiales a la Carta",
          <Soup size={20} />,
          "bg-red-500",
        )}
        {renderSection(
          "extra",
          "Extras & Guarniciones",
          <Coffee size={20} />,
          "bg-yellow-500",
        )}
        {renderSection(
          "bebida",
          "Bebidas",
          <GlassWater size={20} />,
          "bg-cyan-500",
        )}

        {Object.values(groupedProducts).every((arr) => arr.length === 0) && (
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
            <p className="text-sm font-medium mt-2 text-slate-400">
              Estamos preparando algo delicioso...
            </p>
          </div>
        )}
      </div>

      {/* 3. MODAL DE OPCIONES */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 isolate">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] z-10"
            >
              <div className="relative h-64 shrink-0 bg-slate-100 group">
                <Image
                  src={
                    selectedProduct.image_url ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                  }
                  alt={selectedProduct.name}
                  fill
                  className="object-cover transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-5 right-5 bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/40 transition-colors border border-white/20 shadow-lg"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
                <div className="absolute bottom-6 left-8 right-8">
                  <h2 className="text-3xl font-black text-white leading-tight mb-2 tracking-tight">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-white/90 text-sm line-clamp-2 font-medium">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-black shadow-sm ring-1 ring-orange-200">
                      1
                    </span>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Elige tu Entrada
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {EXTRAS_OPTIONS.entrada.map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 active:scale-[0.98] ${tempOptions.entrada === opt ? "border-orange-500 bg-orange-50/50 shadow-md shadow-orange-500/10" : "border-slate-100 hover:border-orange-200 hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${tempOptions.entrada === opt ? "border-orange-500 bg-white" : "border-slate-300"}`}
                          >
                            {tempOptions.entrada === opt && (
                              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                            )}
                          </div>
                          <span
                            className={`text-sm font-bold ${tempOptions.entrada === opt ? "text-slate-900" : "text-slate-500"}`}
                          >
                            {opt}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-black shadow-sm ring-1 ring-orange-200">
                      2
                    </span>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Elige tu Bebida
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {EXTRAS_OPTIONS.bebida.map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setTempOptions({ ...tempOptions, bebida: opt })
                        }
                        className={`px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-200 active:scale-95 ${tempOptions.bebida === opt ? "border-orange-500 bg-orange-600 text-white shadow-lg shadow-orange-500/30" : "border-slate-100 text-slate-500 hover:border-orange-200 hover:text-orange-600 bg-white"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button
                  onClick={() => addToCart(selectedProduct, tempOptions)}
                  className="w-full bg-orange-600 text-white py-4.5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-orange-500/40 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span>Agregar al Pedido</span>
                  <div className="h-5 w-[1px] bg-white/30"></div>
                  <span className="text-white">
                    S/ {selectedProduct.price.toFixed(2)}
                  </span>
                  <ArrowRight
                    size={22}
                    className="group-hover:translate-x-1 transition-transform"
                    strokeWidth={3}
                  />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. BOTÓN FLOTANTE CARRITO (Premium & Responsivo) */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            id="floating-cart-btn"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            // CLASES CLAVE PARA POSICIONAMIENTO:
            // Móvil: Centro, sobre el BottomNav (bottom-24)
            // Desktop (md:): Esquina inferior derecha (md:bottom-8 md:right-8 md:justify-end md:w-auto)
            className="fixed bottom-24 left-0 right-0 z-50 flex justify-center md:justify-end md:bottom-8 md:right-8 px-6 md:px-0 pointer-events-none safe-area-bottom"
          >
            <button
              onClick={() => setIsCheckoutOpen(true)}
              // Cambio de Color a Naranja Premium (bg-orange-600)
              className="pointer-events-auto w-full max-w-sm md:w-auto md:min-w-[300px] bg-orange-600 text-white p-2.5 pl-4 pr-2.5 rounded-[1.75rem] shadow-2xl shadow-orange-600/40 flex items-center justify-between active:scale-[0.97] transition-all group backdrop-blur-2xl ring-1 ring-white/20 hover:bg-orange-500 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                {/* Círculo indicador de cantidad (Blanco con texto naranja) */}
                <div className="bg-white text-orange-600 h-11 w-11 flex items-center justify-center rounded-full text-sm font-black shadow-inner">
                  {totalItems}
                </div>
                <div className="flex flex-col items-start pr-4">
                  <span className="text-[10px] font-bold text-orange-100 uppercase tracking-widest leading-tight">
                    Total
                  </span>
                  <span className="font-bold text-white text-base leading-none drop-shadow-sm">
                    Ver mi pedido
                  </span>
                </div>
              </div>
              {/* Píldora del precio (Fondo oscuro semitransparente) */}
              <div className="bg-black/20 px-5 py-3 rounded-[1.25rem] text-white font-mono font-bold border border-white/10 shadow-inner group-hover:bg-black/30 transition-colors">
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

// --- SUBCOMPONENTE: TARJETA DE PRODUCTO ---
function ProductCard({
  product,
  qty,
  onAdd,
  onRemove,
}: {
  product: Product;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const isMenu = ["menu", "diet"].includes(product.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1.5 flex flex-row md:flex-col gap-5 h-full relative overflow-hidden group cursor-pointer"
      onClick={!qty ? onAdd : undefined}
    >
      <div className="relative w-28 h-28 md:w-full md:h-48 shrink-0 bg-slate-100 rounded-[1.5rem] overflow-hidden shadow-inner group-hover:shadow-md transition-shadow">
        <Image
          src={
            product.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
          }
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 120px, 300px"
        />

        {isMenu && (
          <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-md py-1.5 flex justify-center opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
              <Info size={10} className="text-orange-400" /> Opciones
            </span>
          </div>
        )}

        <AnimatePresence>
          {qty > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-2 right-2 md:top-3 md:right-3 bg-orange-600 text-white w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-black shadow-lg shadow-orange-600/40 ring-2 ring-white z-10"
            >
              {qty}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        <div>
          <h3 className="font-black text-slate-900 text-base md:text-lg leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed font-medium">
            {product.description ||
              "Ingredientes frescos y seleccionados del día."}
          </p>
        </div>

        <div className="flex justify-between items-end mt-4">
          <span className="font-black text-xl text-slate-900 tracking-tight">
            S/ {product.price.toFixed(2)}
          </span>

          {qty > 0 && !isMenu ? (
            <div
              className="flex items-center bg-orange-50 rounded-full h-10 p-1 shadow-inner ring-1 ring-orange-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="w-8 h-full flex items-center justify-center text-orange-600 hover:bg-white hover:shadow-sm rounded-full transition-all active:scale-90"
              >
                <Minus size={16} strokeWidth={3} />
              </button>
              <span className="text-sm font-black w-6 text-center text-orange-700">
                {qty}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                className="w-8 h-full flex items-center justify-center text-white bg-orange-600 rounded-full shadow-md shadow-orange-500/30 hover:bg-orange-700 transition-all active:scale-90"
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
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all duration-300 active:scale-90 group-hover:scale-110 ${isMenu ? "bg-white border-2 border-orange-100 text-orange-600 hover:bg-orange-50 hover:border-orange-200" : "bg-orange-600 text-white hover:bg-orange-700"}`}
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
