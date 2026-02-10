"use client";

import { useState, useMemo } from "react";
import { Plus, Minus, Utensils, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CheckoutModal from "./CheckoutModal";

export default function MenuList({ products }: { products: any[] }) {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // ... (Las funciones addToCart, removeFromCart y groupedProducts SON IGUALES que antes) ...
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

  const groupedProducts = useMemo(() => {
    const mainDishes = products.filter((p) =>
      ["menu", "diet"].includes(p.category),
    );
    const extras = products.filter(
      (p) => !["menu", "diet"].includes(p.category),
    );
    return { mainDishes, extras };
  }, [products]);

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const p = products.find((x) => x.id === id);
    return total + (p?.price || 0) * qty;
  }, 0);

  return (
    <>
      <div className="pb-24 space-y-10">
        {/* SECCIÓN 1: PLATOS DE FONDO (GRID EN PC) */}
        {groupedProducts.mainDishes.length > 0 && (
          <Section title="Platos de Fondo" icon={<Utensils size={18} />}>
            {/* AQUÍ ESTÁ LA CLAVE RESPONSIVA: grid-cols-1 md:grid-cols-2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* SECCIÓN 2: EXTRAS (GRID EN PC) */}
        {groupedProducts.extras.length > 0 && (
          <Section title="Extras y Bebidas" icon={<Coffee size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* BOTÓN FLOTANTE: CENTRADO EN PC */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
          >
            {/* Limitamos el ancho del botón para que no sea gigante en PC (max-w-md) */}
            <div className="w-full max-w-md pointer-events-auto">
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full bg-black text-white p-4 rounded-2xl shadow-2xl shadow-black/40 flex justify-between items-center transform active:scale-[0.98] transition-all hover:bg-gray-900 border border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white text-black px-3 py-1 rounded-lg text-sm font-bold">
                    {totalItems}
                  </div>
                  <span className="font-bold text-lg">Ver pedido</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-bold uppercase">
                    Total
                  </span>
                  <span className="font-mono text-xl font-bold">
                    S/ {totalPrice.toFixed(2)}
                  </span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL (Reutilizamos el mismo) */}
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

// --- SUB-COMPONENTES (Sin cambios mayores, solo diseño) ---

function Section({ title, icon, children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center gap-2 text-gray-400 mb-4 border-b border-gray-100 pb-2">
        {icon}
        <h3 className="text-sm font-bold uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function ProductCard({ product, qty, onAdd, onRemove }: any) {
  return (
    <motion.div
      layoutId={product.id}
      // Hover effect en PC
      className={`bg-white rounded-2xl p-4 shadow-sm border transition-all hover:shadow-md ${
        qty > 0
          ? "border-green-500 ring-1 ring-green-500 bg-green-50/10"
          : "border-gray-100"
      }`}
    >
      <div className="flex gap-4 h-full">
        {/* Imagen */}
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform hover:scale-110 duration-500"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <Utensils />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-900 leading-tight text-lg mb-1">
                {product.name}
              </h3>
              {/* Badge PC only */}
              {product.category === "menu" && (
                <span className="hidden sm:inline-block text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                  MENÚ
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex justify-between items-end mt-3">
            <span className="font-mono text-xl font-bold text-gray-900">
              S/ {product.price}
            </span>

            {/* Controles */}
            {qty === 0 ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onAdd}
                className="bg-black text-white p-2.5 rounded-full hover:bg-gray-800 transition-colors shadow-lg shadow-black/20"
              >
                <Plus size={18} />
              </motion.button>
            ) : (
              <div className="flex items-center bg-black rounded-full px-1 py-1 shadow-lg">
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={onRemove}
                  className="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-full"
                >
                  <Minus size={16} />
                </motion.button>
                <span className="w-8 text-center font-bold text-white text-sm tabular-nums">
                  {qty}
                </span>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={onAdd}
                  className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full"
                >
                  <Plus size={16} />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
