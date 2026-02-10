"use client";

import { createOrder } from "@/app/actions";
import { useState, useActionState, useEffect } from "react";
import {
  X,
  ShoppingBag,
  CreditCard,
  Banknote,
  User,
  Phone,
  MapPin,
  Receipt,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function CheckoutModal({ close, cart, products, total }: any) {
  const [method, setMethod] = useState("yape");
  const [state, formAction, isPending] = useActionState(createOrder, null);

  // Scroll Lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const p = products.find((x: any) => x.id === id);
    return { id, name: p.name, price: p.price, qty };
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center isolate">
      {/* 1. BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={close}
      />

      {/* 2. EL MODAL (Contenedor Flex Principal) */}
      <div className="relative w-full max-w-lg bg-gray-50 sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl flex flex-col h-[92vh] sm:h-[85vh] overflow-hidden animate-in slide-in-from-bottom-12 duration-300">
        {/* BARRA DE AGARRE (Decorativa) */}
        <div className="absolute top-0 left-0 right-0 h-6 z-30 flex justify-center pt-2 pointer-events-none">
          <div className="w-12 h-1.5 bg-gray-300/50 rounded-full backdrop-blur-sm"></div>
        </div>

        {/* --- HEADER (Fijo) --- */}
        <div className="relative z-20 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shrink-0">
          <div className="flex items-center gap-3 mt-2">
            <div className="bg-black text-white p-2.5 rounded-xl shadow-lg shadow-black/10">
              <ShoppingBag size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-none">
                Confirmar
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Paso Final
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors mt-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- FORMULARIO (Ocupa todo el espacio restante) --- */}
        {/* Usamos flex flex-col y min-h-0 para que el scroll funcione bien dentro del form */}
        <form
          action={formAction}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <input type="hidden" name="items" value={JSON.stringify(cartItems)} />
          <input type="hidden" name="total" value={total} />
          <input type="hidden" name="payment_method" value={method} />

          {/* --- AREA SCROLLABLE (Inputs) --- */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* SECCIÓN A: TICKET */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-black group-hover:w-2 transition-all"></div>
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <Receipt size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Resumen
                </span>
              </div>
              <div className="space-y-3 pl-2">
                {cartItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start text-sm group/item"
                  >
                    <div className="flex gap-3">
                      <span className="font-bold text-gray-900 min-w-[20px]">
                        {item.qty}x
                      </span>
                      <span className="text-gray-600 font-medium leading-snug">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-gray-900 text-xs bg-gray-50 px-2 py-0.5 rounded">
                      S/ {(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="my-4 border-b border-dashed border-gray-200 relative">
                <div className="absolute -left-7 -top-3 w-4 h-4 bg-gray-50 rounded-full"></div>
                <div className="absolute -right-7 -top-3 w-4 h-4 bg-gray-50 rounded-full"></div>
              </div>
              <div className="flex justify-between items-end pl-2">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Total
                </span>
                <span className="font-black text-3xl text-gray-900 tracking-tighter">
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* SECCIÓN B: DATOS */}
            <div className="space-y-5">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <span className="bg-gray-200 text-gray-600 w-5 h-5 rounded-md flex items-center justify-center text-[10px]">
                  1
                </span>
                Datos de Entrega
              </h3>
              <div className="space-y-3">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    name="name"
                    required
                    placeholder="Tu Nombre Completo"
                    className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                    <Phone size={18} />
                  </div>
                  <input
                    name="phone"
                    required
                    type="tel"
                    placeholder="Celular / WhatsApp"
                    className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                    <MapPin size={18} />
                  </div>
                  <input
                    name="office"
                    required
                    placeholder="Oficina / Juzgado (Ej: Civil 2)"
                    className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN C: PAGO */}
            <div className="space-y-5">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <span className="bg-gray-200 text-gray-600 w-5 h-5 rounded-md flex items-center justify-center text-[10px]">
                  2
                </span>
                Pago
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("yape")}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden ${
                    method === "yape"
                      ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200"
                      : "bg-white border-gray-200 text-gray-400 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <CreditCard
                    size={24}
                    className={method === "yape" ? "stroke-2" : "stroke-1"}
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Yape / Plin
                  </span>
                  {method === "yape" && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-800/20 to-transparent"></div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("cash")}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden ${
                    method === "cash"
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : "bg-white border-gray-200 text-gray-400 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  <Banknote
                    size={24}
                    className={method === "cash" ? "stroke-2" : "stroke-1"}
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Efectivo
                  </span>
                  {method === "cash" && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-800/20 to-transparent"></div>
                  )}
                </button>
              </div>

              {/* DETALLES DE PAGO */}
              <div className="relative overflow-hidden">
                {method === "yape" ? (
                  <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-6 border-b border-purple-50 pb-4">
                      <div className="text-left">
                        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-1">
                          Monto a Yapear
                        </p>
                        <p className="text-3xl font-black text-purple-900 tracking-tighter">
                          S/ {total.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                          Yape / Plin
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 mb-4 text-center border border-purple-100">
                      <p className="text-xs text-purple-500 font-medium mb-1 uppercase tracking-wide">
                        Número de Celular
                      </p>
                      <div className="text-2xl font-black text-purple-900 tracking-widest font-mono select-all">
                        974-805-994
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-2 bg-white rounded-lg py-2 px-4 shadow-sm border border-purple-50 w-fit mx-auto">
                        <div className="bg-green-500 text-white p-0.5 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          Irma Cerna Hoyos
                        </span>
                      </div>
                    </div>
                    <div className="relative group">
                      <input
                        name="operation_code"
                        placeholder="Escribe aquí el código de operación"
                        className="w-full p-4 bg-white border-2 border-purple-100 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none font-medium text-sm text-center placeholder:text-gray-400 transition-all text-purple-900"
                        required
                      />
                      <p className="text-[10px] text-gray-400 text-center mt-2">
                        *Lo encuentras en la constancia de tu Yape
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs text-center text-emerald-600 font-bold uppercase tracking-wider mb-2">
                      ¿Con cuánto pagarás?
                    </p>
                    <div className="relative max-w-[180px] mx-auto">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-lg">
                        S/
                      </span>
                      <input
                        name="cash_amount"
                        type="number"
                        step="0.10"
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3 bg-emerald-50 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-center font-black text-2xl text-emerald-800 placeholder:text-emerald-200"
                      />
                    </div>
                    <p className="text-[10px] text-center text-gray-400 mt-3">
                      El repartidor llevará tu vuelto exacto.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ERROR */}
            {state?.message && !state.success && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2 justify-center animate-pulse">
                <span>⚠️</span> {state.message}
              </div>
            )}
          </div>

          {/* --- FOOTER FLOTANTE (ESTÁTICO AL FINAL DEL MODAL) --- */}
          {/* Al sacarlo del div con scroll, siempre se queda pegado abajo del modal, pero no de la pantalla del navegador */}
          <div className="p-4 bg-white/90 backdrop-blur-lg border-t border-gray-100 shrink-0 z-20">
            <button
              type="submit"
              disabled={isPending}
              className="w-full max-w-lg mx-auto bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-black/20 hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-between px-6 group"
            >
              {isPending ? (
                <span className="flex items-center gap-2 mx-auto">
                  <Loader2 className="animate-spin" /> Procesando...
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-2">
                    Confirmar{" "}
                    <ChevronRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-medium backdrop-blur-sm">
                    S/ {total.toFixed(2)}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
