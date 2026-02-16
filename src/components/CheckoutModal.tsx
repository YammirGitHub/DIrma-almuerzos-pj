"use client";

import { createOrder, searchDni } from "@/app/actions";
import { useState, useActionState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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
  CalendarDays,
  Info,
  Check,
  Copy,
  IdCard,
  ShieldCheck,
  ArrowRight,
  Wallet,
  Sparkles,
  Trash2,
  AlertCircle,
  QrCode,
  Smartphone, // <--- ¡AQUÍ ESTABAN LOS FALTANTES!
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

  // --- Lógica DNI ---
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
        console.error(error);
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

  // Animaciones Nativas (iOS Spring)
  const modalVariants: Variants = {
    hidden: { y: "100%", opacity: 0, scale: 0.98 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 350,
        mass: 0.8,
      },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: { duration: 0.25, ease: "easeInOut" },
    },
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 isolate overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-all"
        onClick={close}
      />

      {/* Modal Principal */}
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative w-full sm:max-w-[500px] bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[95dvh] sm:h-[85vh] overflow-hidden ring-1 ring-black/5"
      >
        {/* Header Limpio */}
        <header className="relative z-20 px-6 py-5 flex items-center justify-between shrink-0 bg-white border-b border-slate-50 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <div className="bg-orange-50 text-orange-600 p-2.5 rounded-2xl border border-orange-100">
              <ShoppingBag size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">
                Confirmar Pedido
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  En Vivo
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={close}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors active:scale-90"
          >
            <X size={20} />
          </button>
        </header>

        <form
          action={formAction}
          className="flex flex-col flex-1 min-h-0 overflow-hidden relative z-0 bg-white"
        >
          <input type="hidden" name="items" value={JSON.stringify(cartItems)} />
          <input type="hidden" name="total" value={total} />
          <input type="hidden" name="payment_method" value={method} />
          <input type="hidden" name="dni" value={dni} />

          {/* Scroll Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar pb-32">
            {/* 1. TICKET DE CONSUMO (Con opción de borrar) */}
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <Receipt size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Tu Carrito
                  </span>
                </div>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                  {cartItems.length} Items
                </span>
              </div>

              <div className="bg-slate-50/50 rounded-[1.8rem] border border-slate-100 p-4 space-y-3">
                {cartItems.map((item: any) => (
                  <div
                    key={item.cartId}
                    className="flex justify-between items-start bg-white p-3 rounded-2xl shadow-sm border border-slate-100/50 group"
                  >
                    <div className="flex gap-3 items-start">
                      <span className="font-extrabold text-white bg-slate-800 w-6 h-6 flex items-center justify-center rounded-lg text-xs mt-0.5 shadow-md shadow-slate-200">
                        {item.qty}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 leading-tight">
                          {item.product.name}
                        </span>
                        {item.options && (
                          <div className="flex flex-col mt-1 space-y-0.5">
                            {item.options.entrada && (
                              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                <ArrowRight
                                  size={8}
                                  className="text-orange-400"
                                />{" "}
                                {item.options.entrada}
                              </span>
                            )}
                            {item.options.bebida && (
                              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                <ArrowRight
                                  size={8}
                                  className="text-orange-400"
                                />{" "}
                                {item.options.bebida}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between h-full gap-2">
                      <span className="text-sm font-black text-slate-800">
                        S/ {(item.product.price * item.qty).toFixed(2)}
                      </span>
                      {/* BOTÓN BORRAR ITEM */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartId)}
                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:scale-105 transition-all active:scale-95"
                        title="Eliminar este producto"
                      >
                        <Trash2 size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-end px-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total a Pagar
                  </span>
                  <div className="flex items-baseline gap-1 text-slate-900">
                    <span className="text-sm font-bold text-slate-400">S/</span>
                    <span className="text-3xl font-black tracking-tight">
                      {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. DATOS DE ENTREGA (Auto-Search) */}
            <section className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  ¿Quién recibe?
                </span>
                {name && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[9px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5"
                  >
                    <ShieldCheck size={11} /> RENIEC VALIDADO
                  </motion.span>
                )}
              </div>

              <div className="space-y-3">
                {/* DNI con Feedback */}
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
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
                    placeholder="Escribe el DNI aquí..."
                    value={dni}
                    onChange={handleDniChange}
                    className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-500/10 rounded-2xl outline-none text-sm font-bold text-slate-800 transition-all placeholder:text-slate-400"
                  />
                  {/* Ayuda Visual para DNI */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {!name && dni.length > 0 && dni.length < 8 && (
                      <span className="text-[9px] font-bold text-orange-400 bg-orange-50 px-2 py-1 rounded-md">
                        Faltan {8 - dni.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nombre Readonly */}
                <div className="relative group">
                  <User
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    name="name"
                    required
                    placeholder="Nombre Completo (Automático)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn(
                      "w-full pl-14 pr-4 py-4 rounded-2xl text-sm font-bold outline-none transition-all border",
                      name
                        ? "bg-green-50/50 text-slate-900 border-green-100"
                        : "bg-slate-50 text-slate-400 border-slate-100 focus:bg-white focus:border-orange-200",
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group">
                    <Phone
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
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
                      className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-500/10 rounded-2xl outline-none text-sm font-bold transition-all text-slate-800"
                    />
                  </div>
                  <div className="relative group">
                    <MapPin
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      name="office"
                      required
                      placeholder="Oficina"
                      className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:border-orange-200 focus:ring-4 focus:ring-orange-500/10 rounded-2xl outline-none text-sm font-bold transition-all text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 3. MÉTODOS DE PAGO (Tabs Visuales) */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Forma de Pago
                </span>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <PaymentTab
                  active={method === "yape"}
                  onClick={() => setMethod("yape")}
                  icon={<CreditCard size={22} />}
                  label="Yape / Plin"
                  color="purple"
                />
                <PaymentTab
                  active={method === "monthly"}
                  onClick={() => setMethod("monthly")}
                  icon={<CalendarDays size={22} />}
                  label="A Fin de Mes"
                  color="blue"
                />
              </div>

              <AnimatePresence mode="wait">
                {method === "yape" ? (
                  <motion.div
                    key="yape"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white rounded-[2rem] border border-purple-100 shadow-xl shadow-purple-500/5 p-1">
                      <div className="bg-purple-50/40 rounded-[1.8rem] p-5 space-y-6">
                        {/* QR / Numero Switcher */}
                        <div className="flex p-1 bg-white rounded-xl border border-purple-50 shadow-sm">
                          <button
                            type="button"
                            onClick={() => setYapeMode("qr")}
                            className={cn(
                              "flex-1 py-2.5 text-[10px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2",
                              yapeMode === "qr"
                                ? "bg-purple-600 text-white shadow-md"
                                : "text-slate-400 hover:bg-slate-50",
                            )}
                          >
                            <QrCode size={14} /> QR
                          </button>
                          <button
                            type="button"
                            onClick={() => setYapeMode("number")}
                            className={cn(
                              "flex-1 py-2.5 text-[10px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2",
                              yapeMode === "number"
                                ? "bg-purple-600 text-white shadow-md"
                                : "text-slate-400 hover:bg-slate-50",
                            )}
                          >
                            <Smartphone size={14} /> Número
                          </button>
                        </div>

                        {/* Contenido Visual */}
                        <div className="min-h-[160px] flex items-center justify-center">
                          {yapeMode === "qr" ? (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex flex-col items-center"
                            >
                              <div className="bg-white p-3 rounded-2xl border-2 border-dashed border-purple-200 shadow-sm relative group cursor-pointer hover:border-purple-400 transition-colors">
                                <Sparkles
                                  size={18}
                                  className="absolute -top-2 -right-2 text-purple-500 fill-purple-200 animate-bounce"
                                />
                                <img
                                  src="/yape-qr.png"
                                  alt="QR"
                                  className="w-32 h-32 object-contain rounded-lg"
                                />
                              </div>
                              <p className="text-[9px] font-bold text-purple-400 mt-3 uppercase tracking-widest bg-purple-100 px-3 py-1 rounded-full">
                                Escanea desde tu app
                              </p>
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-center w-full"
                            >
                              <p className="text-3xl font-black text-purple-900 tracking-tighter">
                                974 805 994
                              </p>
                              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-white border border-purple-100 rounded-full shadow-sm">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-purple-700 uppercase">
                                  Irma Cerna Hoyos
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={copyNumber}
                                className="w-full mt-5 bg-white text-purple-700 border border-purple-200 py-3 rounded-xl text-xs font-black hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                              >
                                {copied ? (
                                  <Check size={14} />
                                ) : (
                                  <Copy size={14} />
                                )}{" "}
                                {copied ? "COPIADO" : "COPIAR NÚMERO"}
                              </button>
                            </motion.div>
                          )}
                        </div>

                        {/* Input Código */}
                        <div className="relative">
                          <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest pl-2 mb-1 block">
                            Código de Operación
                          </label>
                          <div className="relative bg-white p-1 rounded-2xl border border-purple-100 shadow-sm focus-within:ring-2 focus-within:ring-purple-100 transition-all flex items-center">
                            <div className="pl-4 text-purple-300">
                              <Info size={16} />
                            </div>
                            <input
                              name="operation_code"
                              required
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="0000"
                              onInput={(e: any) =>
                                (e.target.value = e.target.value.replace(
                                  /\D/g,
                                  "",
                                ))
                              }
                              className="w-full h-12 text-center text-2xl font-black text-purple-900 bg-transparent outline-none tracking-[0.3em] placeholder:text-purple-100"
                            />
                          </div>
                          <p className="text-[9px] text-center text-purple-400/70 mt-2">
                            Son los dígitos grandes al finalizar el pago.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="monthly"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-blue-50/50 rounded-3xl border border-blue-100 p-6 flex flex-col items-center justify-center text-center gap-4"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-blue-50 flex items-center justify-center text-blue-500">
                      <Wallet size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-blue-900">
                        Crédito Personal
                      </h4>
                      <p className="text-xs font-medium text-blue-600/70 leading-relaxed max-w-[240px] mx-auto mt-2 bg-blue-100/50 p-3 rounded-xl">
                        Este consumo se agregará a tu cuenta corriente y se
                        liquidará al cierre del mes.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Error State */}
            {state?.message && !state.success && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-center animate-shake flex items-center justify-center gap-2">
                <AlertCircle size={16} /> {state.message}
              </div>
            )}
          </div>

          {/* Footer Call to Action (Floating) */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent z-20">
            <button
              type="submit"
              disabled={isPending || isSearching}
              className="w-full bg-orange-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/30 hover:bg-orange-700 hover:shadow-orange-600/40 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-between px-8 group relative overflow-hidden ring-1 ring-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

              <span className="relative z-10 flex items-center gap-3">
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" /> Procesando...
                  </div>
                ) : (
                  "Confirmar Pedido"
                )}
              </span>

              <div className="relative z-10 flex items-center gap-3">
                <span className="bg-orange-700/40 px-3 py-1 rounded-lg text-base backdrop-blur-sm border border-white/10 shadow-inner">
                  S/ {total.toFixed(2)}
                </span>
                <div className="bg-white text-orange-600 rounded-full p-1.5 group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={18} strokeWidth={3} />
                </div>
              </div>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function PaymentTab({ active, onClick, icon, label, color }: any) {
  const isPurple = color === "purple";
  const activeClasses = isPurple
    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20 border-purple-500"
    : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 border-blue-500";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 overflow-hidden group",
        active
          ? activeClasses
          : "bg-white border-slate-100 text-slate-400 hover:border-orange-200 hover:text-orange-500",
      )}
    >
      <div
        className={cn(
          "transition-transform duration-300 p-2 rounded-full",
          active ? "bg-white/20" : "bg-slate-50 group-hover:bg-orange-50",
        )}
      >
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="active-dot"
          className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full shadow-sm"
        />
      )}
    </button>
  );
}
