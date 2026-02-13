"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Minus,
  Utensils,
  X,
  ChefHat,
  Check,
  Info,
  Coffee,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CheckoutModal from "./CheckoutModal";

const EXTRAS_OPTIONS = {
  entrada: [
    "Sopa del día",
    "Ensalada Fresca",
    "Papa a la Huancaína",
    "Tequeños",
  ],
  bebida: ["Chicha Morada", "Maracuyá", "Infusión Caliente", "Agua Mineral"],
  cremas: ["Todas las cremas", "Solo Ají", "Sin cremas"],
};

export default function MenuList({ products }: { products: any[] }) {
  const [cart, setCart] = useState<{ [key: string]: any }>({});
  const [filter, setFilter] = useState("all");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [tempOptions, setTempOptions] = useState({
    entrada: "",
    bebida: "",
    cremas: "",
  });

  // Bloquear scroll y ocultar header
  useEffect(() => {
    if (selectedProduct || isCheckoutOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [selectedProduct, isCheckoutOpen]);

  // --- AGRUPACIÓN ---
  const groupedProducts = useMemo(() => {
    const menus = products.filter((p) => ["menu", "diet"].includes(p.category));
    const extras = products.filter(
      (p) => !["menu", "diet"].includes(p.category),
    );
    return { menus, extras };
  }, [products]);

  // --- LÓGICA CARRITO ---
  const addToCart = (product: any, options: any = null) => {
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

  // Calcula cantidad total de UN producto específico en el carrito (para mostrar en la tarjeta)
  const getProductQty = (productId: string) => {
    return Object.values(cart)
      .filter((item: any) => item.product.id === productId)
      .reduce((acc: number, item: any) => acc + item.qty, 0);
  };

  // --- HANDLER INTELIGENTE ---
  const handleProductAction = (
    product: any,
    action: "add" | "remove",
    isDirectClick: boolean = false,
  ) => {
    const isMenu = ["menu", "diet"].includes(product.category);

    if (action === "remove") {
      // Solo para extras (directos), removemos usando el ID del producto
      removeFromCart(product.id);
      return;
    }

    // Acción ADD
    if (isMenu) {
      // Si es menú, SIEMPRE abre modal para opciones, no agrega directo
      setTempOptions({
        entrada: EXTRAS_OPTIONS.entrada[0],
        bebida: EXTRAS_OPTIONS.bebida[0],
        cremas: EXTRAS_OPTIONS.cremas[0],
      });
      setSelectedProduct(product);
    } else {
      // Si es Extra, agrega directo
      if (isDirectClick) {
        addToCart(product);
      }
    }
  };

  const totalItems = Object.values(cart).reduce(
    (acc: number, item: any) => acc + item.qty,
    0,
  );
  const totalPrice = Object.values(cart).reduce(
    (acc: number, item: any) => acc + item.product.price * item.qty,
    0,
  );

  return (
    <>
      {/* --- CABECERA & FILTROS --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Nuestra Carta
          </h2>
          <p className="text-gray-400 font-medium mt-1 text-sm md:text-base">
            Personaliza tu pedido a tu gusto.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {[
            { id: "all", label: "Todo" },
            { id: "menu", label: "Menú Ejecutivo" },
            { id: "extra", label: "Extras" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${filter === f.id ? "bg-orange-500 text-white border-orange-500 shadow-orange-200" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- CONTENIDO CON SECCIONES SEPARADAS --- */}
      <div className="space-y-12 pb-32 min-h-[300px]">
        {/* SECCIÓN MENÚS */}
        {(filter === "all" || filter === "menu") &&
          groupedProducts.menus.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filter === "all" && (
                <div className="flex items-center gap-2 mb-6 ml-1">
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                    <ChefHat size={20} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">
                    Platos de Fondo
                  </h3>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedProducts.menus.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    qty={getProductQty(product.id)}
                    onClickCard={() =>
                      handleProductAction(product, "add", false)
                    }
                    onAdd={() => handleProductAction(product, "add", true)}
                    // Menús no usan remove directo desde la tarjeta porque tienen opciones complejas
                    onRemove={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

        {/* SECCIÓN EXTRAS */}
        {(filter === "all" || filter === "extra") &&
          groupedProducts.extras.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              {filter === "all" && (
                <div className="flex items-center gap-2 mb-6 ml-1">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Coffee size={20} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">
                    Extras y Bebidas
                  </h3>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedProducts.extras.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    qty={getProductQty(product.id)}
                    onClickCard={() => {}} // Click en tarjeta de extra no hace nada (para no confundir)
                    onAdd={() => handleProductAction(product, "add", true)}
                    onRemove={() =>
                      handleProductAction(product, "remove", true)
                    }
                  />
                ))}
              </div>
            </div>
          )}

        {/* EMPTY STATE */}
        {((filter === "menu" && groupedProducts.menus.length === 0) ||
          (filter === "extra" && groupedProducts.extras.length === 0)) && (
          <div className="text-center py-10 text-gray-400 text-sm">
            No hay productos en esta categoría.
          </div>
        )}
      </div>

      {/* --- MODAL DETALLE --- */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 isolate">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl h-[85vh] sm:h-auto sm:max-h-[90vh] flex flex-col z-10"
            >
              {/* Header Imagen */}
              <div className="relative h-56 bg-gray-100 shrink-0">
                <img
                  src={
                    selectedProduct.image_url ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                  }
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 bg-black/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/40 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white to-transparent h-24" />
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar overscroll-contain">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-2">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {selectedProduct.description}
                  </p>
                  <div className="inline-block mt-3 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold">
                    S/ {selectedProduct.price.toFixed(2)}
                  </div>
                </div>

                {/* SELECCIONADORES */}
                <div className="space-y-8 pb-4">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="bg-gray-100 text-gray-600 w-5 h-5 flex items-center justify-center rounded text-[10px]">
                        1
                      </span>{" "}
                      Entrada
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {EXTRAS_OPTIONS.entrada.map((opt) => (
                        <label
                          key={opt}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${tempOptions.entrada === opt ? "border-orange-500 bg-orange-50/50 ring-1 ring-orange-500" : "border-gray-100 hover:border-gray-200"}`}
                        >
                          <input
                            type="radio"
                            name="entrada"
                            className="hidden"
                            checked={tempOptions.entrada === opt}
                            onChange={() =>
                              setTempOptions({ ...tempOptions, entrada: opt })
                            }
                          />
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${tempOptions.entrada === opt ? "border-orange-500" : "border-gray-300"}`}
                          >
                            {tempOptions.entrada === opt && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            )}
                          </div>
                          <span
                            className={`text-sm font-bold ${tempOptions.entrada === opt ? "text-gray-900" : "text-gray-600"}`}
                          >
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="bg-gray-100 text-gray-600 w-5 h-5 flex items-center justify-center rounded text-[10px]">
                        2
                      </span>{" "}
                      Bebida
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {EXTRAS_OPTIONS.bebida.map((opt) => (
                        <button
                          key={opt}
                          onClick={() =>
                            setTempOptions({ ...tempOptions, bebida: opt })
                          }
                          className={`px-4 py-2.5 rounded-lg text-sm font-bold border transition-all ${tempOptions.bebida === opt ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm" : "border-gray-100 text-gray-500 hover:border-gray-200 hover:text-gray-700"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-white safe-area-bottom">
                <button
                  onClick={() => addToCart(selectedProduct, tempOptions)}
                  className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-orange-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:bg-orange-700"
                >
                  <Plus size={20} strokeWidth={3} />
                  AGREGAR - S/ {selectedProduct.price.toFixed(2)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- BOTÓN FLOTANTE --- */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 safe-area-bottom"
          >
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="pointer-events-auto w-full max-w-md bg-orange-600 text-white p-3.5 rounded-full shadow-2xl shadow-orange-600/40 flex justify-between items-center active:scale-[0.98] transition-all border border-white/20 backdrop-blur-md hover:bg-orange-700"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white text-orange-600 h-10 w-10 flex items-center justify-center rounded-full text-sm font-black shadow-lg shadow-orange-900/10">
                  {totalItems}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold text-base">Ver pedido</span>
                  <span className="text-[10px] text-orange-100 font-medium uppercase tracking-wide">
                    Ir a Pagar
                  </span>
                </div>
              </div>
              <div className="pr-4 font-mono text-lg font-black tracking-tight">
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

// --- TARJETA DE PRODUCTO INTELIGENTE ---
function ProductCard({ product, qty, onClickCard, onAdd, onRemove }: any) {
  const isMenu = ["menu", "diet"].includes(product.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClickCard}
      className={`group bg-white rounded-[1.5rem] p-3 shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-200 flex gap-4 h-full relative overflow-hidden ${isMenu ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-inner">
        <img
          src={
            product.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
          }
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {isMenu && (
          <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold text-center py-1 uppercase tracking-widest">
            Menú
          </div>
        )}

        {/* Badge de Cantidad (Solo aparece si es Menú y tiene cantidad) */}
        {isMenu && qty > 0 && (
          <div className="absolute top-2 right-2 bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md animate-in zoom-in">
            {qty}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between py-1 pr-1">
        <div>
          <h3 className="font-bold text-gray-900 leading-tight text-base md:text-lg group-hover:text-orange-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex justify-between items-end mt-2">
          <span className="font-black text-lg text-gray-900">
            S/ {product.price.toFixed(2)}
          </span>

          {/* CONTROLES */}
          {isMenu ? (
            // CASO MENÚ: Solo botón +, siempre abre modal
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              className="bg-orange-50 text-orange-600 w-9 h-9 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm active:scale-90"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          ) : // CASO EXTRAS (GASEOSA): Contador inteligente
          qty > 0 ? (
            // --- CORRECCIÓN AQUÍ: CAMBIADO A NARANJA ---
            <div
              className="flex items-center bg-orange-600 text-white rounded-full h-9 shadow-lg shadow-orange-200 animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onRemove}
                className="w-8 h-full flex items-center justify-center hover:bg-orange-700 rounded-l-full transition-colors active:scale-90"
              >
                <Minus size={14} strokeWidth={3} />
              </button>
              <span className="text-sm font-black w-5 text-center">{qty}</span>
              <button
                onClick={onAdd}
                className="w-8 h-full flex items-center justify-center hover:bg-orange-700 rounded-r-full transition-colors active:scale-90"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          ) : (
            // Botón inicial normal
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              className="bg-orange-50 text-orange-600 w-9 h-9 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm active:scale-90"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
