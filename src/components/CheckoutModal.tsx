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
  Trash2,
} from "lucide-react";

export default function CheckoutModal({
  close,
  cart,
  removeFromCart,
  total,
}: any) {
  const [method, setMethod] = useState("yape");
  const [state, formAction, isPending] = useActionState(createOrder, null);

  // Bloquear scroll del body al abrir el modal
  useEffect(() => {
    document.body.style.overflow = "hidden";
    // Esta clase ayuda a ocultar el header en layout
    document.body.classList.add("modal-open");

    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    };
  }, []);

  // Transformar carrito para visualización
  const cartItems = Object.entries(cart).map(([key, item]: any) => {
    return {
      cartId: key,
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      qty: item.qty,
      options: item.options,
    };
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center isolate">
      {/* Fondo negro suave con blur potente para tapar la web de atrás */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
        onClick={close}
      />

      {/* 2. EL MODAL (CONTENEDOR)
          - h-[92vh]: En móvil dejamos un poquito de aire arriba para que se vea el fondo borroso.
          - rounded-t-[2.5rem]: Curva suave estilo App moderna.
      */}
      <div className="relative w-full max-w-lg bg-[#F8F9FA] sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl flex flex-col h-[92vh] sm:h-[85vh] overflow-hidden animate-in slide-in-from-bottom-12 duration-300 border border-white/40 ring-1 ring-black/5">
        {/* Barra de agarre visual (Affordance) */}
        <div className="absolute top-0 left-0 right-0 h-6 z-30 flex justify-center pt-2 pointer-events-none">
          <div className="w-12 h-1.5 bg-gray-300/50 rounded-full backdrop-blur-sm"></div>
        </div>

        {/* --- HEADER DEL MODAL --- */}
        <div className="relative z-20 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shrink-0">
          <div className="flex items-center gap-3 mt-2">
            <div className="bg-orange-500 text-white p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
              <ShoppingBag size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-none tracking-tight">
                Confirmar
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Resumen de Pedido
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors mt-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- FORMULARIO (Scrollable) --- */}
        <form
          action={formAction}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {/* Inputs Ocultos */}
          <input type="hidden" name="items" value={JSON.stringify(cartItems)} />
          <input type="hidden" name="total" value={total} />
          <input type="hidden" name="payment_method" value={method} />

          {/* ÁREA SCROLLABLE */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-[#F8F9FA]">
            {/* SECCIÓN A: TICKET DETALLADO */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-orange-500"></div>

              <div className="flex items-center gap-2 mb-4 text-orange-600/80">
                <Receipt size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Tu Ticket
                </span>
              </div>

              <div className="space-y-4 pl-2">
                {cartItems.map((item: any) => (
                  <div
                    key={item.cartId}
                    className="flex justify-between items-start text-sm group/item border-b border-dashed border-gray-50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex gap-3 flex-1">
                      <span className="font-bold text-gray-900 min-w-[24px] bg-gray-100 h-6 w-6 flex items-center justify-center rounded text-xs mt-0.5">
                        {item.qty}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold leading-tight text-base">
                          {item.name}
                        </span>
                        {item.options && (
                          <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                            {item.options.entrada && (
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />{" "}
                                {item.options.entrada}
                              </span>
                            )}
                            {item.options.bebida && (
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />{" "}
                                {item.options.bebida}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono font-bold text-gray-900 text-sm">
                        S/ {(item.price * item.qty).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded p-1 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-end pl-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Total a Pagar
                </span>
                <span className="font-black text-3xl text-gray-900 tracking-tighter">
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* SECCIÓN B: DATOS DE ENTREGA */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                Datos de Entrega
              </h3>
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-3">
                {/* NOMBRE - Input 'Safe Zoom' */}
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"
                    size={18}
                  />
                  <input
                    name="name"
                    required
                    placeholder="Tu Nombre Completo"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-base sm:text-sm font-medium"
                  />
                </div>

                {/* TELÉFONO - Input 'Safe Zoom' */}
                <div className="relative group">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"
                    size={18}
                  />
                  <input
                    name="phone"
                    required
                    type="tel"
                    placeholder="Celular / WhatsApp"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-base sm:text-sm font-medium"
                  />
                </div>

                {/* OFICINA - Input 'Safe Zoom' */}
                <div className="relative group">
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"
                    size={18}
                  />
                  <input
                    name="office"
                    required
                    placeholder="Oficina / Juzgado (Ej: Civil 2)"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-base sm:text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN C: MÉTODO DE PAGO */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                Método de Pago
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("yape")}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${
                    method === "yape"
                      ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200"
                      : "bg-white border-gray-200 text-gray-400 hover:border-purple-200 hover:bg-purple-50"
                  }`}
                >
                  <CreditCard
                    size={24}
                    className={method === "yape" ? "stroke-2" : "stroke-1"}
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Yape / Plin
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("cash")}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${
                    method === "cash"
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : "bg-white border-gray-200 text-gray-400 hover:border-emerald-200 hover:bg-emerald-50"
                  }`}
                >
                  <Banknote
                    size={24}
                    className={method === "cash" ? "stroke-2" : "stroke-1"}
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Efectivo
                  </span>
                </button>
              </div>

              {/* DETALLES DE PAGO */}
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {method === "yape" ? (
                  <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm">
                    <div className="text-center mb-4">
                      <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-1">
                        Monto Exacto
                      </p>
                      <p className="text-3xl font-black text-purple-900 tracking-tighter">
                        S/ {total.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 mb-4 text-center border border-purple-100">
                      <p className="text-[10px] text-purple-400 font-bold uppercase mb-1">
                        Yapear a
                      </p>
                      <div className="text-xl font-black text-purple-900 font-mono tracking-wider select-all">
                        974-805-994
                      </div>
                      <div className="text-xs font-bold text-purple-600 mt-1">
                        Irma Cerna Hoyos
                      </div>
                    </div>
                    {/* Input Código - Safe Zoom */}
                    <div className="relative">
                      <input
                        name="operation_code"
                        required
                        placeholder="Ingresa el Código de Operación"
                        className="w-full p-3 bg-white border-2 border-purple-100 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-center font-bold text-purple-900 placeholder:text-gray-300 text-base sm:text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm text-center">
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2">
                      ¿Con cuánto pagarás?
                    </p>
                    <div className="relative max-w-[150px] mx-auto">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">
                        S/
                      </span>
                      {/* Input Efectivo - Safe Zoom */}
                      <input
                        name="cash_amount"
                        type="number"
                        step="0.10"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2 bg-emerald-50 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-center font-black text-xl text-emerald-900 placeholder:text-emerald-300/50 text-base sm:text-xl"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">
                      Llevaremos tu vuelto exacto.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mensaje Error */}
            {state?.message && !state.success && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-center animate-pulse">
                {state.message}
              </div>
            )}
          </div>

          {/* --- FOOTER FLOTANTE --- */}
          <div className="p-4 bg-white border-t border-gray-100 shrink-0 z-20 pb-8 sm:pb-4 safe-area-bottom">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-between px-6 group"
            >
              {isPending ? (
                <span className="flex items-center gap-2 mx-auto text-sm">
                  <Loader2 className="animate-spin" size={18} /> Procesando...
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-2">
                    Confirmar Pedido{" "}
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
