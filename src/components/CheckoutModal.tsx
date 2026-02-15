"use client";

import { createOrder, searchDni } from "@/app/actions";
import { useState, useActionState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Para transiciones físicas premium
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
  QrCode,
  Smartphone,
  Copy,
  Check,
  IdCard,
  Info,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility para manejo de clases Senior
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

  const [dni, setDni] = useState("");
  const [name, setName] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Lógica DNI con feedback inmediato
  const handleDniChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setDni(val);
    if (val.length < 8) {
      if (name) setName("");
      setIsSearching(false);
    }
    if (val.length === 8) {
      setIsSearching(true);
      try {
        const data = await searchDni(val);
        if (data && data.nombres) {
          setName(
            `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`,
          );
        }
      } catch (error) {
        console.error("Error DNI:", error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const copyNumber = () => {
    navigator.clipboard.writeText("974805994");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cartItems = Object.entries(cart).map(([key, item]: any) => ({
    cartId: key,
    qty: item.qty,
    options: item.options,
    product: item.product,
  }));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop con Glassmorphism Real */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={close}
      />

      {/* El Túnel Invisible (Regla 3) - Centrado Óptico (Visual) */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] flex flex-col max-h-[90dvh] overflow-hidden border border-white/20 ring-1 ring-black/5"
      >
        {/* Header con Perceived Performance */}
        <header className="sticky top-0 z-30 px-8 py-6 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-200">
              <ShoppingBag size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                Confirmar Pedido
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{" "}
                Seguridad Bancaria Activa
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90 text-gray-400"
          >
            <X size={20} />
          </button>
        </header>

        <form
          action={formAction}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Hidden Inputs (Single Source of Truth) */}
          <input type="hidden" name="items" value={JSON.stringify(cartItems)} />
          <input type="hidden" name="total" value={total} />
          <input type="hidden" name="payment_method" value={method} />
          <input type="hidden" name="dni" value={dni} />

          {/* Area Scrollable con Scroll Fantasma (Regla 4) */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10 custom-scrollbar style-scroll-phantom">
            {/* Ticket de Consumo Justificado y Senior */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Receipt size={16} className="text-orange-500" />
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Tu Selección
                </span>
              </div>
              <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100 space-y-4">
                {cartItems.map((item: any) => (
                  <div
                    key={item.cartId}
                    className="flex justify-between items-start gap-4"
                  >
                    <div className="flex gap-3">
                      <span className="text-sm font-black text-orange-600 bg-orange-100/50 w-7 h-7 flex items-center justify-center rounded-lg">
                        {item.qty}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-800 leading-tight">
                          {item.product.name}
                        </p>
                        {item.options && (
                          <p className="text-[10px] text-gray-400 mt-1 font-medium italic">
                            {item.options.entrada} • {item.options.bebida}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-black text-gray-900 tracking-tighter">
                      S/ {(item.product.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Total
                  </span>
                  <span className="text-3xl font-black text-gray-900 tracking-tighter">
                    S/ {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </section>

            {/* Información Personal - Mobile First (Regla 1) */}
            <section className="space-y-4">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                Datos de Entrega
              </span>
              <div className="grid grid-cols-1 gap-4 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm">
                {/* DNI Field con Validaciones */}
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    {isSearching ? (
                      <Loader2
                        size={18}
                        className="animate-spin text-orange-500"
                      />
                    ) : (
                      <IdCard size={18} />
                    )}
                  </div>
                  <input
                    required
                    maxLength={8}
                    inputMode="numeric"
                    placeholder="DNI del comensal"
                    value={dni}
                    onChange={handleDniChange}
                    className="w-full pl-14 pr-4 py-5 bg-gray-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-orange-500/20 text-sm font-bold tracking-widest transition-all outline-none"
                  />
                  {name && (
                    <ShieldCheck
                      size={18}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in"
                    />
                  )}
                </div>

                <div className="relative group">
                  <User
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    name="name"
                    required
                    placeholder="Nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn(
                      "w-full pl-14 pr-4 py-5 rounded-[1.5rem] text-sm font-bold transition-all outline-none border border-transparent",
                      name
                        ? "bg-green-50/30 text-gray-900 border-green-100"
                        : "bg-gray-50 text-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-200",
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Phone
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      name="phone"
                      required
                      type="tel"
                      maxLength={9}
                      placeholder="Celular"
                      onInput={(e: any) =>
                        (e.target.value = e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full pl-14 pr-4 py-5 bg-gray-50 rounded-[1.5rem] text-sm font-bold outline-none border border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div className="relative">
                    <MapPin
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      name="office"
                      required
                      placeholder="Oficina"
                      className="w-full pl-14 pr-4 py-5 bg-gray-50 rounded-[1.5rem] text-sm font-bold outline-none border border-transparent focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Métodos de Pago Premium */}
            <section className="space-y-4">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                Forma de Pago
              </span>
              <div className="grid grid-cols-2 gap-4">
                <PaymentTab
                  active={method === "yape"}
                  onClick={() => setMethod("yape")}
                  icon={<CreditCard size={24} />}
                  label="Yape / Plin"
                  color="purple"
                />
                <PaymentTab
                  active={method === "monthly"}
                  onClick={() => setMethod("monthly")}
                  icon={<CalendarDays size={24} />}
                  label="A Fin de Mes"
                  color="blue"
                />
              </div>

              <AnimatePresence mode="wait">
                {method === "yape" ? (
                  <motion.div
                    key="yape"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-[2rem] border border-purple-100 p-6 space-y-6 shadow-xl shadow-purple-500/5"
                  >
                    <div className="flex bg-gray-100 p-1 rounded-[1.25rem]">
                      <button
                        type="button"
                        onClick={() => setYapeMode("qr")}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all",
                          yapeMode === "qr"
                            ? "bg-white text-purple-600 shadow-sm"
                            : "text-gray-400",
                        )}
                      >
                        Escaneo QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setYapeMode("number")}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all",
                          yapeMode === "number"
                            ? "bg-white text-purple-600 shadow-sm"
                            : "text-gray-400",
                        )}
                      >
                        Número
                      </button>
                    </div>

                    {yapeMode === "qr" ? (
                      <div className="text-center group flex flex-col items-center">
                        <div className="p-3 bg-white border-2 border-dashed border-purple-100 rounded-3xl group-hover:scale-105 transition-transform duration-500 shadow-lg shadow-purple-200/20">
                          <img
                            src="/yape-qr.png"
                            alt="QR"
                            className="w-36 h-36 object-contain rounded-xl"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-4 tracking-widest">
                          Escanea desde tu App
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-purple-50/50 rounded-2xl">
                        <p className="text-3xl font-black text-purple-900 tracking-tighter italic">
                          974 805 994
                        </p>
                        <p className="text-[11px] font-bold text-purple-500 mt-1">
                          IRMA CERNA HOYOS
                        </p>
                        <button
                          type="button"
                          onClick={copyNumber}
                          className="mt-4 inline-flex items-center gap-2 bg-white text-purple-600 px-5 py-2.5 rounded-full text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-95 border border-purple-100"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
                          {copied ? "¡COPIADO!" : "COPIAR NÚMERO"}
                        </button>
                      </div>
                    )}

                    <div className="pt-4 border-t border-purple-50">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest px-1">
                          Código de Seguridad
                        </label>
                        <Info size={14} className="text-purple-200" />
                      </div>
                      <input
                        name="operation_code"
                        required
                        type="text"
                        inputMode="numeric"
                        maxLength={3}
                        placeholder="Ej: 417"
                        onInput={(e: any) =>
                          (e.target.value = e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full p-5 bg-purple-50/50 border-2 border-purple-100 rounded-2xl focus:border-purple-500 focus:bg-white outline-none text-center font-black text-purple-900 text-4xl tracking-[0.6em] transition-all placeholder:text-purple-200"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="monthly"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-blue-50/30 rounded-[2rem] border border-blue-100 p-8 flex flex-col items-center text-center space-y-4"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shadow-blue-500/10 border border-blue-50">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-blue-900 uppercase tracking-wide">
                        Crédito Interno Activo
                      </p>
                      <p className="text-[11px] text-blue-500 mt-2 leading-relaxed font-medium px-4">
                        Este consumo será cargado a tu planilla y se liquidará
                        al finalizar el periodo mensual de forma automática.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {state?.message && !state.success && (
              <div className="p-5 bg-red-50 border border-red-100 text-red-600 rounded-[1.5rem] text-[11px] font-black text-center flex items-center justify-center gap-3 animate-bounce">
                <Info size={16} /> {state.message.toUpperCase()}
              </div>
            )}
          </div>

          {/* Botón de Acción Senior - Apple Style */}
          <footer className="p-8 bg-white border-t border-gray-100 shrink-0 pb-12 safe-area-bottom">
            <button
              type="submit"
              disabled={isPending || isSearching}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-6 rounded-[1.75rem] font-black text-lg shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.97] transition-all disabled:opacity-50 flex items-center justify-between px-10 group relative overflow-hidden"
            >
              {isPending ? (
                <div className="mx-auto flex items-center gap-3">
                  <Loader2 className="animate-spin" size={24} /> PROCESANDO
                  PEDIDO...
                </div>
              ) : (
                <>
                  <span className="flex items-center gap-3 tracking-tight">
                    SOLICITAR AHORA{" "}
                    <ChevronRight
                      size={22}
                      className="group-hover:translate-x-2 transition-transform"
                    />
                  </span>
                  <span className="bg-white/20 px-4 py-2 rounded-xl text-base backdrop-blur-md ring-1 ring-white/30 tracking-tighter">
                    S/ {total.toFixed(2)}
                  </span>
                </>
              )}
            </button>
          </footer>
        </form>
      </motion.div>
    </div>
  );
}

// Subcomponente Atómico para los Tabs de Pago
function PaymentTab({ active, onClick, icon, label, color }: any) {
  const styles: any = {
    purple: active
      ? "bg-purple-600 border-purple-600 text-white shadow-xl shadow-purple-200"
      : "hover:border-purple-200 text-gray-400 border-gray-100",
    blue: active
      ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200"
      : "hover:border-blue-200 text-gray-400 border-gray-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 relative overflow-hidden",
        styles[color],
      )}
    >
      <div
        className={cn(
          "transition-transform duration-500",
          active ? "scale-110" : "scale-100 opacity-60",
        )}
      >
        {icon}
      </div>
      <span className="text-[11px] font-black uppercase tracking-widest">
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="activeDot"
          className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
        />
      )}
    </button>
  );
}
