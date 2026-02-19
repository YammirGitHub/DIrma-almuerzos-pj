"use client";

import { createOrder, searchDni } from "@/app/actions";
import { useState, useActionState, useRef, useEffect } from "react";
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
  Smartphone,
  Shield,
  Building,
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

  // --- SOLUCIÓN AL ERROR: DECLARACIÓN DE TODOS LOS ESTADOS ---
  const [dni, setDni] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [office, setOffice] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Referencia para el autoscroll
  const paymentSectionRef = useRef<HTMLElement>(null);

  // --- EFECTO MEMORIA (UX PREMIUM) ---
  // 1. Cargar datos guardados al abrir el modal
  useEffect(() => {
    const savedData = localStorage.getItem("d-irma-user-data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.dni) setDni(parsed.dni);
        if (parsed.name) setName(parsed.name);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.office) setOffice(parsed.office);
      } catch (e) {
        console.error("Error leyendo caché de usuario");
      }
    }
  }, []);

  // 2. Guardar datos en tiempo real (Autoguardado)
  useEffect(() => {
    if (dni || name || phone || office) {
      localStorage.setItem(
        "d-irma-user-data",
        JSON.stringify({ dni, name, phone, office }),
      );
    }
  }, [dni, name, phone, office]);

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

  // --- Lógica Scroll Inteligente ---
  const handleMethodChange = (newMethod: string) => {
    setMethod(newMethod);
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);
  };

  const cartItems = Object.entries(cart).map(([key, item]: any) => ({
    cartId: key,
    qty: item.qty,
    options: item.options,
    product: item.product,
  }));

  const modalVariants: Variants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 300,
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
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal Principal */}
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative w-full sm:max-w-[500px] bg-[#F8F9FA] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[95dvh] sm:h-[85vh] overflow-hidden ring-1 ring-white/10"
      >
        {/* Header Limpio */}
        <header className="relative z-20 px-6 py-5 flex items-center justify-between shrink-0 bg-white border-b border-slate-100 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <div className="bg-orange-50 text-orange-600 p-2.5 rounded-2xl border border-orange-100">
              <ShoppingBag size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                Resumen de Pedido
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Transacción Segura
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={close}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors active:scale-90"
          >
            <X size={20} />
          </button>
        </header>

        <form
          action={formAction}
          className="flex flex-col flex-1 min-h-0 overflow-hidden relative z-0 bg-[#F8F9FA]"
        >
          <input type="hidden" name="items" value={JSON.stringify(cartItems)} />
          <input type="hidden" name="total" value={total} />
          <input type="hidden" name="payment_method" value={method} />
          <input type="hidden" name="dni" value={dni} />

          {/* Scroll Area */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 custom-scrollbar pb-36">
            {/* PASO 1. DETALLE DEL CONSUMO */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 px-1">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-md">
                  1
                </span>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Detalle del Consumo
                </h3>
                <div className="h-[1px] flex-1 bg-slate-200 ml-2"></div>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md shrink-0 border border-orange-100">
                  {cartItems.reduce(
                    (acc: number, item: any) => acc + item.qty,
                    0,
                  )}{" "}
                  Items
                </span>
              </div>

              <div className="bg-white rounded-[1.8rem] border border-slate-100 p-4 space-y-3 shadow-sm">
                {cartItems.map((item: any) => (
                  <div
                    key={item.cartId}
                    className="flex justify-between items-start bg-slate-50/50 p-3 rounded-2xl border border-slate-100 group"
                  >
                    <div className="flex gap-3 items-start">
                      <span className="font-extrabold text-white bg-orange-500 w-6 h-6 flex items-center justify-center rounded-lg text-xs mt-0.5 shadow-sm">
                        {item.qty}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 leading-tight">
                          {item.product.name}
                        </span>
                        {item.options && (
                          <div className="flex flex-col mt-1 space-y-0.5">
                            {item.options.entrada && (
                              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                                <ArrowRight
                                  size={8}
                                  className="text-orange-400"
                                />{" "}
                                {item.options.entrada}
                              </span>
                            )}
                            {item.options.bebida && (
                              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
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
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartId)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-3 flex justify-between items-end px-2">
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

            {/* PASO 2. DATOS DEL SOLICITANTE */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 px-1">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-md">
                  2
                </span>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  Datos del Solicitante
                </h3>
                <div className="h-[1px] flex-1 bg-slate-200 ml-2"></div>
                {name && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[9px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-black flex items-center gap-1 uppercase tracking-wider"
                  >
                    <ShieldCheck size={10} /> Validado
                  </motion.span>
                )}
              </div>

              <div className="bg-white rounded-[1.8rem] border border-slate-100 p-2 shadow-sm space-y-2">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
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
                    placeholder="Número de DNI"
                    value={dni}
                    onChange={handleDniChange}
                    className="w-full pl-12 pr-4 py-4 bg-transparent focus:bg-slate-50 rounded-2xl outline-none text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="h-[1px] w-[calc(100%-2rem)] mx-auto bg-slate-100"></div>

                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Nombres Completos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn(
                      "w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none transition-all",
                      name
                        ? "bg-emerald-50/50 text-slate-900"
                        : "bg-transparent text-slate-900 placeholder:text-slate-300",
                    )}
                  />
                </div>
                <div className="h-[1px] w-[calc(100%-2rem)] mx-auto bg-slate-100"></div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative group">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      name="phone"
                      required
                      type="tel"
                      maxLength={9}
                      autoComplete="tel"
                      placeholder="Celular"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full pl-10 pr-2 py-4 bg-transparent focus:bg-slate-50 rounded-2xl outline-none text-sm font-bold transition-all text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                  <div className="relative group border-l border-slate-100">
                    <MapPin
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      name="office"
                      required
                      placeholder="Oficina / Área"
                      value={office}
                      onChange={(e) => setOffice(e.target.value)}
                      className="w-full pl-10 pr-2 py-4 bg-transparent focus:bg-slate-50 rounded-2xl outline-none text-sm font-bold transition-all text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================= */}
            {/* PASO 3. MÉTODO DE PAGO (REDISEÑO PREMIUM FINTECH) */}
            {/* ========================================================= */}
            <section className="space-y-4" ref={paymentSectionRef}>
              <div className="flex items-center gap-3 px-1">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-md">
                  3
                </span>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Opciones de Pago
                </h3>
                <div className="h-[1px] flex-1 bg-slate-200 ml-2"></div>
              </div>

              {/* TABS DE SELECCIÓN */}
              <div className="grid grid-cols-2 gap-3">
                <PaymentTab
                  active={method === "yape"}
                  onClick={() => handleMethodChange("yape")}
                  icon={<CreditCard size={22} />}
                  label="Yape / Plin"
                  color="purple"
                />
                <PaymentTab
                  active={method === "monthly"}
                  onClick={() => handleMethodChange("monthly")}
                  icon={<Building size={22} />} // Cambio de icono a algo más corporativo
                  label="Planilla"
                  color="blue"
                />
              </div>

              {/* CONTENIDO DEL MÉTODO SELECCIONADO */}
              <AnimatePresence mode="wait">
                {method === "yape" ? (
                  <motion.div
                    key="yape"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div className="bg-white rounded-[2rem] border border-purple-100 shadow-xl shadow-purple-500/5 overflow-hidden relative">
                      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-purple-50 to-transparent pointer-events-none" />

                      <div className="p-5 space-y-6 relative z-10">
                        {/* iOS-Style Segmented Control */}
                        <div className="flex bg-slate-50 p-1 rounded-xl shadow-inner border border-slate-100 relative">
                          <button
                            type="button"
                            onClick={() => setYapeMode("qr")}
                            className={cn(
                              "relative flex-1 py-2.5 text-[10px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 z-10",
                              yapeMode === "qr"
                                ? "text-purple-700"
                                : "text-slate-400 hover:text-slate-600",
                            )}
                          >
                            {yapeMode === "qr" && (
                              <motion.div
                                layoutId="yapeTab"
                                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-purple-100/50 -z-10"
                              />
                            )}
                            <QrCode size={14} /> Escanear QR
                          </button>
                          <button
                            type="button"
                            onClick={() => setYapeMode("number")}
                            className={cn(
                              "relative flex-1 py-2.5 text-[10px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 z-10",
                              yapeMode === "number"
                                ? "text-purple-700"
                                : "text-slate-400 hover:text-slate-600",
                            )}
                          >
                            {yapeMode === "number" && (
                              <motion.div
                                layoutId="yapeTab"
                                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-purple-100/50 -z-10"
                              />
                            )}
                            <Smartphone size={14} /> Usar Número
                          </button>
                        </div>

                        {/* Vista Central (QR o Número) */}
                        <div className="min-h-[170px] flex items-center justify-center">
                          {yapeMode === "qr" ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex flex-col items-center"
                            >
                              <div className="bg-white p-3.5 rounded-3xl border border-purple-100 shadow-md relative group cursor-pointer hover:border-purple-300 transition-colors">
                                <Sparkles
                                  size={20}
                                  className="absolute -top-2.5 -right-2.5 text-purple-500 fill-purple-200 animate-bounce"
                                />
                                <img
                                  src="/yape-qr.png"
                                  alt="QR Yape"
                                  className="w-32 h-32 object-contain rounded-xl"
                                />
                              </div>
                              <span className="text-[10px] font-bold text-purple-500 mt-4 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full border border-purple-100/50">
                                Escanea para pagar
                              </span>
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="w-full"
                            >
                              <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-[1.5rem] p-5 shadow-sm text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200/30 rounded-bl-full -mr-4 -mt-4 blur-xl" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                  Yape / Plin
                                </p>
                                <p className="text-3xl font-black text-purple-900 tracking-tighter font-mono">
                                  974 805 994
                                </p>
                                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mt-1 mb-4 flex items-center justify-center gap-1.5">
                                  <Shield size={10} /> Irma Cerna Hoyos
                                </p>
                                <button
                                  type="button"
                                  onClick={copyNumber}
                                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-purple-500/20"
                                >
                                  {copied ? (
                                    <Check size={16} />
                                  ) : (
                                    <Copy size={16} />
                                  )}{" "}
                                  {copied
                                    ? "¡NÚMERO COPIADO!"
                                    : "COPIAR NÚMERO"}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Input PIN-Style para el Código */}
                        <div className="pt-2 border-t border-dashed border-purple-100">
                          <label className="flex items-center gap-1.5 text-[10px] font-black text-purple-500 uppercase tracking-widest pl-1 mb-2">
                            <Info size={12} /> Código de Operación
                          </label>
                          <input
                            name="operation_code"
                            required
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            onInput={(e: any) =>
                              (e.target.value = e.target.value.replace(
                                /\D/g,
                                "",
                              ))
                            }
                            className="w-full h-14 text-center text-2xl font-black text-purple-900 bg-purple-50/50 border border-purple-100 rounded-2xl focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 outline-none tracking-[0.4em] placeholder:text-purple-200 transition-all shadow-inner focus:shadow-md"
                          />
                          <p className="text-[10px] text-center text-slate-400 font-medium mt-2">
                            Revisa tu app de pago e ingresa los{" "}
                            <span className="font-bold text-purple-600">
                              6 dígitos
                            </span>{" "}
                            de confirmación.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="monthly"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-gradient-to-br from-blue-50 via-white to-slate-50 rounded-[2rem] border border-blue-100 p-6 flex flex-col items-center text-center relative overflow-hidden shadow-inner"
                  >
                    {/* Luces de fondo (Blur) */}
                    <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="w-16 h-16 bg-white rounded-full shadow-lg shadow-blue-500/10 border border-blue-50 flex items-center justify-center text-blue-600 mb-4 relative z-10">
                      <Wallet size={28} strokeWidth={2} />
                    </div>

                    <div className="relative z-10 w-full">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border border-blue-200">
                        <ShieldCheck size={10} /> Beneficio Institucional
                      </span>
                      <h4 className="text-xl font-black text-slate-900 leading-tight mb-4">
                        Descuento por Planilla
                      </h4>

                      {/* Info Box Estilo Apple Pay */}
                      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-blue-50 shadow-sm text-left w-full space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 text-emerald-500 bg-emerald-50 p-1 rounded-full">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <p className="text-xs font-medium text-slate-600 leading-relaxed">
                            Procesaremos tu pedido al instante sin necesidad de
                            transferencias ni efectivo.
                          </p>
                        </div>
                        <div className="h-px bg-slate-100 w-full"></div>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 text-blue-500 bg-blue-50 p-1 rounded-full">
                            <CalendarDays size={12} strokeWidth={2.5} />
                          </div>
                          <p className="text-xs font-medium text-slate-600 leading-relaxed">
                            El importe total será descontado de forma automática
                            en tu{" "}
                            <span className="font-bold text-blue-700">
                              próxima fecha de abono salarial
                            </span>
                            .
                          </p>
                        </div>
                      </div>
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

          {/* Footer CTA (Botón Premium) */}
          <div className="absolute bottom-0 left-0 right-0 p-5 pt-6 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/95 to-transparent z-20">
            <button
              type="submit"
              disabled={isPending || isSearching}
              className="relative w-full bg-orange-600 text-white py-4.5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-orange-500/40 hover:shadow-orange-500/60 active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-between px-6 overflow-hidden group border border-orange-500"
            >
              {/* Brillo dinámico en hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

              <span className="relative z-10 flex items-center gap-3">
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" /> Procesando
                  </div>
                ) : (
                  "Confirmar Pedido"
                )}
              </span>

              <div className="relative z-10 flex items-center gap-3">
                <span className="bg-black/10 px-3 py-1.5 rounded-xl text-base shadow-inner">
                  S/ {total.toFixed(2)}
                </span>
                <div className="bg-white text-orange-600 rounded-full p-2 group-hover:translate-x-1 transition-transform shadow-sm">
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
    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 border-purple-500 ring-2 ring-purple-600/20"
    : "bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-blue-500 ring-2 ring-blue-600/20";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 overflow-hidden group bg-white",
        active
          ? activeClasses
          : "border-slate-200 text-slate-400 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50/50 shadow-sm",
      )}
    >
      <div
        className={cn(
          "transition-transform duration-300 p-2.5 rounded-full",
          active
            ? "bg-white/20"
            : "bg-slate-50 group-hover:bg-white shadow-inner",
        )}
      >
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest z-10">
        {label}
      </span>

      {active && (
        <motion.div
          layoutId="active-dot"
          className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full shadow-sm"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}
    </button>
  );
}
