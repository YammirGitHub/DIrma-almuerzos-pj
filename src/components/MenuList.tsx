"use client";

import { useState, useMemo } from "react";
import { Plus, Minus, Utensils, Coffee, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CheckoutModal from "./CheckoutModal";

export default function MenuList({ products }: { products: any[] }) {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // --- LÓGICA DE CARRITO ---
  const addToCart = (id: string) =>
    setCart((p) => ({ ...p, [id]: (p[id] || 0) + 1 }));

  const removeFromCart = (id: string) =>
    setCart((p) => {
      const n = (p[id] || 0) - 1;
      if (n <= 0) {
        const c = { ...p };
        delete c[id];
        return c;
      }
      return { ...p, [id]: n };
    });

  // --- AGRUPACIÓN ---
  const groupedProducts = useMemo(() => {
    const mainDishes = products.filter((p) =>
      ["menu", "diet"].includes(p.category),
    );
    const extras = products.filter(
      (p) => !["menu", "diet"].includes(p.category),
    );
    return { mainDishes, extras };
  }, [products]);

  // --- TOTALES ---
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const p = products.find((x) => x.id === id);
    return total + (p?.price || 0) * qty;
  }, 0);

  return (
    <>
      <div className="pb-32 space-y-12">
        {/* SECCIÓN 1: PLATOS DE FONDO */}
        {groupedProducts.mainDishes.length > 0 && (
          <Section title="Platos de Fondo" icon={<ChefHat size={20} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {groupedProducts.mainDishes.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  qty={cart[product.id] || 0}
                  onAdd={() => addToCart(product.id)}
                  onRemove={() => removeFromCart(product.id)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* SECCIÓN 2: EXTRAS */}
        {groupedProducts.extras.length > 0 && (
          <Section title="Extras y Bebidas" icon={<Coffee size={20} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupedProducts.extras.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  qty={cart[product.id] || 0}
                  onAdd={() => addToCart(product.id)}
                  onRemove={() => removeFromCart(product.id)}
                />
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* BOTÓN FLOTANTE (ISLA INFERIOR) - AHORA NARANJA */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
          >
            <div className="w-full max-w-md pointer-events-auto">
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full bg-orange-500 text-white p-4 rounded-full shadow-2xl shadow-orange-500/40 flex justify-between items-center transform active:scale-[0.98] transition-all hover:bg-orange-600 border border-white/20 backdrop-blur-md"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white text-orange-600 h-9 w-9 flex items-center justify-center rounded-full text-sm font-black shadow-sm">
                    {totalItems}
                  </div>
                  <span className="font-bold text-lg tracking-tight">
                    Ver mi pedido
                  </span>
                </div>
                <div className="flex items-center gap-3 pr-2">
                  <span className="text-orange-100 text-xs font-bold uppercase tracking-wider">
                    Total
                  </span>
                  <span className="font-mono text-xl font-black">
                    S/ {totalPrice.toFixed(2)}
                  </span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL CHECKOUT */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          close={() => setIsCheckoutOpen(false)}
          cart={cart}
          products={products}
          total={totalPrice}
        />
      )}
    </>
  );
}

// --- SUB-COMPONENTES ---

function Section({ title, icon, children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600">
          {icon}
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}

// 🔥 TARJETA DE PRODUCTO (Naranja Brand) 🔥
function ProductCard({ product, qty, onAdd, onRemove }: any) {
  const ingredients = product.description
    ? product.description.split("+").map((i: string) => i.trim())
    : [];

  return (
    <motion.div
      layoutId={product.id}
      className={`group bg-white rounded-[24px] p-4 shadow-sm border transition-all hover:shadow-xl hover:shadow-orange-100 hover:border-orange-200 h-full flex flex-col relative overflow-hidden ${
        qty > 0
          ? "border-orange-500 ring-2 ring-orange-500 ring-opacity-50"
          : "border-gray-100"
      }`}
    >
      <div className="flex gap-5">
        {/* Imagen */}
        <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-2xl bg-gray-100 shadow-inner">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <Utensils size={32} />
            </div>
          )}
          {/* Badge MENÚ (Naranja) */}
          {product.category === "menu" && (
            <div className="absolute top-0 left-0 bg-orange-500 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-br-xl shadow-sm">
              MENÚ
            </div>
          )}
        </div>

        {/* Info Principal */}
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <h3 className="font-bold text-gray-900 leading-tight text-lg group-hover:text-orange-600 transition-colors">
              {product.name}
            </h3>
            <span className="font-mono text-xl font-black text-gray-900 mt-2 block tracking-tight">
              S/ {product.price}
            </span>
          </div>

          {/* Controles: Naranja Vibrante */}
          <div className="flex justify-end mt-2">
            {qty === 0 ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onAdd}
                className="bg-orange-500 text-white h-10 w-10 sm:w-auto sm:px-5 sm:h-10 rounded-full flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
              >
                <Plus size={18} strokeWidth={3} />
                <span className="hidden sm:inline font-bold text-sm">
                  Agregar
                </span>
              </motion.button>
            ) : (
              <div className="flex items-center bg-orange-500 text-white rounded-full p-1 shadow-lg shadow-orange-200">
                <button
                  onClick={onRemove}
                  className="h-8 w-8 flex items-center justify-center hover:bg-orange-600 rounded-full transition-colors"
                >
                  <Minus size={16} strokeWidth={3} />
                </button>
                <span className="w-8 text-center font-black text-sm">
                  {qty}
                </span>
                <button
                  onClick={onAdd}
                  className="h-8 w-8 flex items-center justify-center bg-white text-orange-600 rounded-full hover:bg-orange-50 transition-colors shadow-sm"
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- INGREDIENTES --- */}
      <div className="mt-4 pt-4 border-t border-gray-50">
        {ingredients.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing: string, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-[11px] font-bold text-gray-600 border border-orange-100"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                {ing}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            {product.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
