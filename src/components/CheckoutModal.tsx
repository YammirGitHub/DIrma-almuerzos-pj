"use client";

import { createOrder, searchDni } from "@/app/actions"; // <--- IMPORTAMOS searchDni
import { useState, useActionState, useEffect } from "react";
import {
  X,
  ShoppingBag,
  CreditCard,
  User,
  Phone,
  MapPin,
  Receipt,
  ChevronRight,
  Loader2,
  Trash2,
  CalendarDays,
  AlertCircle,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Search,
  IdCard,
} from "lucide-react";

export default function CheckoutModal({
  close,
  cart,
  removeFromCart,
  total,
}: any) {
  const [method, setMethod] = useState("yape");
  const [yapeMode, setYapeMode] = useState<"qr" | "number">("qr");
  const [copied, setCopied] = useState(false);
  const [state, formAction, isPending] = useActionState(createOrder, null);

  // --- ESTADOS PARA DNI Y NOMBRE ---
  const [dni, setDni] = useState("");
  const [name, setName] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // --- LÓGICA DE BÚSQUEDA INSTANTÁNEA (USANDO SERVER ACTION) ---
  const handleDniChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Solo números
    setDni(val);

    // Si tiene 8 dígitos, buscamos automáticamente
    if (val.length === 8) {
      setIsSearching(true);

      // Llamamos a la función del servidor (actions.ts)
      // Esto evita el error "Failed to fetch" y CORS
      const data = await searchDni(val);

      if (data && data.nombres) {
        setName(
          `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`,
        );
      }

      setIsSearching(false);
    }
  };

  // Función para copiar número al portapapeles
  const copyNumber = () => {
    navigator.clipboard.writeText("974805994");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cartItems = Object.entries(cart).map(([key, item]: any) => {
    return {
      cartId: key,
      qty: item.qty,
      options: item.options,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
      },
    };
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center isolate">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
        onClick={close}
      />

      <div className="relative w-full max-w-lg bg-[#F8F9FA] sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl flex flex-col h-[95dvh] sm:h-[85vh] overflow-hidden animate-in slide-in-from-bottom-12 duration-300 border border-white/40 ring-1 ring-black/5">
        {/* HEADER */}
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

        <form
          action={formAction}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <input type="hidden" name="items" value={JSON.stringify(cartItems)} />
          <input type="hidden" name="total" value={total} />
          <input type="hidden" name="payment_method" value={method} />
          {/* INPUT HIDDEN PARA MANDAR EL DNI AL SERVIDOR */}
          <input type="hidden" name="dni" value={dni} />

          {/* AREA SCROLLABLE */}
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

            {/* SECCIÓN B: DATOS DE ENTREGA (CON RENIEC) */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                Datos de Entrega
              </h3>
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-3">
                {/* 1. INPUT DNI CON BÚSQUEDA INSTANTÁNEA */}
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    {isSearching ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <IdCard size={18} />
                    )}
                  </div>
                  <input
                    name="dni_input"
                    required
                    maxLength={8}
                    inputMode="numeric"
                    placeholder="Ingresa tu DNI (Búsqueda Automática)"
                    value={dni}
                    onChange={handleDniChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-sm font-bold tracking-wider"
                  />
                </div>

                {/* 2. NOMBRE (AUTOCOMPLETADO) */}
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"
                    size={18}
                  />
                  <input
                    name="name"
                    required
                    placeholder="Nombre Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium ${name ? "text-gray-900 font-bold bg-green-50/50" : "placeholder:text-gray-400"}`}
                  />
                </div>

                <div className="relative group">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"
                    size={18}
                  />
                  <input
                    name="phone"
                    required
                    type="tel"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="Celular (9 dígitos)"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(
                        /[^0-9]/g,
                        "",
                      );
                    }}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                  />
                </div>
                <div className="relative group">
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"
                    size={18}
                  />
                  <input
                    name="office"
                    required
                    placeholder="Oficina / Juzgado"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN C: MÉTODO DE PAGO */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                Método de Pago
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("yape")}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 ${method === "yape" ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200" : "bg-white border-gray-200 text-gray-400 hover:bg-purple-50"}`}
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
                  onClick={() => setMethod("monthly")}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 ${method === "monthly" ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border-gray-200 text-gray-400 hover:bg-blue-50"}`}
                >
                  <CalendarDays
                    size={24}
                    className={method === "monthly" ? "stroke-2" : "stroke-1"}
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    A Fin de Mes
                  </span>
                </button>
              </div>

              {/* ZONA YAPE MEJORADA */}
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {method === "yape" && (
                  <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
                    {/* TABS QR / NUMERO */}
                    <div className="flex border-b border-purple-50">
                      <button
                        type="button"
                        onClick={() => setYapeMode("qr")}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${yapeMode === "qr" ? "bg-purple-50 text-purple-700 border-b-2 border-purple-500" : "text-gray-400 hover:bg-gray-50"}`}
                      >
                        <QrCode size={16} /> Código QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setYapeMode("number")}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${yapeMode === "number" ? "bg-purple-50 text-purple-700 border-b-2 border-purple-500" : "text-gray-400 hover:bg-gray-50"}`}
                      >
                        <Smartphone size={16} /> Número Celular
                      </button>
                    </div>

                    <div className="p-5 text-center">
                      {/* MODO QR */}
                      {yapeMode === "qr" && (
                        <div className="animate-in zoom-in duration-300">
                          <div className="bg-white p-2 rounded-xl border-2 border-dashed border-purple-200 inline-block mb-3">
                            <img
                              src="/yape-qr.png"
                              alt="QR Yape"
                              className="w-40 h-40 object-contain rounded-lg"
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">
                            Escanea desde tu app
                          </p>
                        </div>
                      )}
                      {/* MODO NÚMERO */}
                      {yapeMode === "number" && (
                        <div className="animate-in zoom-in duration-300 py-4">
                          <div className="text-3xl font-black text-purple-900 font-mono tracking-wider mb-2">
                            974 805 994
                          </div>
                          <p className="text-sm font-bold text-purple-600 mb-4">
                            Irma Cerna Hoyos
                          </p>
                          <button
                            type="button"
                            onClick={copyNumber}
                            className="mx-auto flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-full text-xs font-bold transition-colors"
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? "¡Copiado!" : "Copiar Número"}
                          </button>
                        </div>
                      )}
                      {/* ZONA YAPE MEJORADA - INPUT DE 3 DÍGITOS */}
                      <div className="mt-6 pt-6 border-t border-purple-50">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                            Código de Seguridad
                          </label>
                          <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-2 py-0.5 rounded">
                            El número grande de 3 dígitos
                          </span>
                        </div>

                        <input
                          name="operation_code"
                          required
                          type="text"
                          inputMode="numeric"
                          maxLength={3} // LÍMITE DE 3 DÍGITOS
                          placeholder="Ej: 417" // Ejemplo visual corto
                          onInput={(e) => {
                            // Solo permite números
                            e.currentTarget.value =
                              e.currentTarget.value.replace(/[^0-9]/g, "");
                          }}
                          className="w-full p-4 bg-purple-50/50 border border-purple-100 rounded-2xl focus:border-purple-500 focus:bg-white outline-none text-center font-black text-purple-900 placeholder:text-purple-200 text-3xl tracking-[0.5em] transition-all"
                        />
                        <p className="text-[10px] text-gray-400 mt-3 text-center">
                          Revisa tu constancia de Yape, son los números grandes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {method === "monthly" && (
                  <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <CalendarDays size={20} />
                      </div>
                    </div>
                    <p className="font-bold text-blue-900 text-sm">
                      Pago a fin de mes
                    </p>
                    <p className="text-xs text-blue-600/80 mt-1 px-4">
                      El monto se sumará a tu cuenta corriente asociada al
                      celular ingresado.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {state?.message && !state.success && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-center animate-pulse">
                {state.message}
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100 shrink-0 z-20 pb-8 safe-area-bottom">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-between px-6 group"
            >
              {isPending ? (
                <span className="mx-auto flex items-center gap-2 text-sm">
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
