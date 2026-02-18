"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Receipt,
  ChevronDown,
  ChevronUp,
  CreditCard,
  X,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Loader2,
  Wallet,
  ShieldCheck,
  CalendarDays,
  Clock,
} from "lucide-react";
import Toast from "@/components/ui/Toast";

export default function HistorialPage() {
  // Estado
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null); // Guardamos datos del cliente
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Estado Pago
  const [showPayModal, setShowPayModal] = useState(false);
  const [yapeMode, setYapeMode] = useState<"qr" | "number">("qr");
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [opCode, setOpCode] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error" as "error" | "success",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // --- REALTIME SUBSCRIPTION (Por DNI) ---
  useEffect(() => {
    if (!searched || !dni) return;

    const channel = supabase
      .channel(`historial-${dni}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `customer_dni=eq.${dni}`,
        },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === payload.new.id ? { ...o, ...payload.new } : o,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searched, dni]);

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) setDni(value);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dni.length !== 8) {
      setToast({
        show: true,
        message: "DNI inválido (debe tener 8 dígitos)",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setSearched(true);
    setExpandedOrder(null);

    // 1. Buscar Cliente (Para obtener el nombre real registrado)
    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("dni", dni)
      .single();
    setCustomerData(customer);

    // 2. Buscar Historial
    if (customer) {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_dni", dni)
        .order("created_at", { ascending: false })
        .limit(50);
      setOrders(ordersData || []);
    } else {
      setOrders([]);
    }
    setLoading(false);
  };

  // --- LÓGICA DE PAGO ---
  const handlePayDebt = async () => {
    if (!opCode) {
      setToast({
        show: true,
        message: "Falta el código de operación",
        type: "error",
      });
      return;
    }
    setPaying(true);

    const unpaidIds = orders
      .filter((o) => ["on_account", "unpaid"].includes(o.payment_status))
      .map((o) => o.id);

    if (unpaidIds.length === 0) {
      setPaying(false);
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "verifying",
        payment_method: "yape",
        operation_code: opCode,
      })
      .in("id", unpaidIds);

    setPaying(false);

    if (error) {
      setToast({ show: true, message: "Error al enviar", type: "error" });
    } else {
      setToast({ show: true, message: "Enviado a revisión", type: "success" });
      setShowPayModal(false);
      setOpCode("");
      // Optimistic update
      setOrders(
        orders.map((o) =>
          unpaidIds.includes(o.id)
            ? { ...o, payment_status: "verifying", operation_code: opCode }
            : o,
        ),
      );
    }
  };

  const copyNumber = () => {
    navigator.clipboard.writeText("974805994");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deudaTotal = orders
    .filter((o) => ["on_account", "unpaid"].includes(o.payment_status))
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 font-sans text-slate-800 selection:bg-orange-100 selection:text-orange-900">
      <Toast
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* HEADER STICKY */}
      <header className="sticky top-0 z-30 px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center gap-4 safe-area-top">
        <Link
          href="/"
          className="p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors active:scale-90 shadow-sm text-slate-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-black text-lg text-slate-900 tracking-tight">
          Estado de Cuenta
        </h1>
      </header>

      <main className="max-w-md mx-auto p-4 mt-2 space-y-6">
        {/* TARJETA BUSCADOR */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 text-orange-600 p-2.5 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none">
                Consulta Segura
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Ingresa tu DNI para ver tu historial.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <div className="relative group">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={8}
                value={dni}
                onChange={handleDniChange}
                placeholder="DNI (8 dígitos)"
                className="w-full p-4 pl-12 bg-slate-50 rounded-2xl font-bold text-lg outline-none focus:ring-4 focus:ring-orange-500/10 border-2 border-transparent focus:border-orange-200 transition-all placeholder:text-slate-300 tracking-widest text-slate-800"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors"
                size={20}
              />
            </div>
            <button
              disabled={loading || dni.length !== 8}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-slate-900/20 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Consultar Historial"
              )}
            </button>
          </form>
        </motion.div>

        {/* RESULTADOS */}
        {searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* CASO: NO EXISTE */}
            {!customerData && (
              <div className="text-center py-10 px-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="bg-slate-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <HelpCircle className="text-slate-300" size={40} />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-1">
                  DNI No Registrado
                </h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  No hemos encontrado pedidos asociados al DNI{" "}
                  <span className="font-bold text-slate-800">{dni}</span>.
                </p>
                <Link
                  href="/"
                  className="inline-flex bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-200 hover:bg-orange-700 transition-colors"
                >
                  Hacer mi primer pedido
                </Link>
              </div>
            )}

            {/* CASO: EXISTE */}
            {customerData && (
              <div className="space-y-6">
                {/* 1. TARJETA DE ESTADO FINANCIERO */}
                {deudaTotal > 0 ? (
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-[2.5rem] shadow-2xl shadow-orange-500/40 relative overflow-hidden"
                  >
                    {/* Decoración Fondo */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3 opacity-90">
                        <div className="bg-white/20 p-1.5 rounded-lg">
                          <AlertCircle size={16} />
                        </div>
                        <p className="font-bold uppercase tracking-widest text-[10px]">
                          Saldo Pendiente
                        </p>
                      </div>

                      <div className="flex flex-col mb-6">
                        <span className="text-5xl font-black tracking-tighter drop-shadow-md">
                          S/ {deudaTotal.toFixed(2)}
                        </span>
                        <span className="text-orange-100 text-sm font-medium mt-1">
                          Tienes consumos por regularizar.
                        </span>
                      </div>

                      <button
                        onClick={() => setShowPayModal(true)}
                        className="w-full bg-white text-orange-600 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wide shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <CreditCard size={18} /> Pagar Deuda Ahora
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-emerald-500 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-500/30 flex flex-col items-center text-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent" />
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-md mb-4 shadow-inner">
                      <CheckCircle size={40} strokeWidth={2.5} />
                    </div>
                    <h3 className="font-black text-2xl mb-1 relative z-10">
                      ¡Todo al día!
                    </h3>
                    <p className="text-emerald-100 text-sm font-medium relative z-10 px-4">
                      No tienes deudas pendientes. Gracias por tu puntualidad.
                    </p>
                  </motion.div>
                )}

                {/* 2. LISTA DE MOVIMIENTOS */}
                <div>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <Receipt size={16} className="text-slate-400" />
                    <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs">
                      Movimientos Recientes
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {orders.map((order) => {
                      const isExpanded = expandedOrder === order.id;
                      const isPaid = order.payment_status === "paid";
                      const isVerifying = order.payment_status === "verifying";

                      return (
                        <motion.div
                          layout
                          key={order.id}
                          onClick={() =>
                            setExpandedOrder(isExpanded ? null : order.id)
                          }
                          className={`bg-white p-5 rounded-[1.8rem] border transition-all cursor-pointer overflow-hidden ${isExpanded ? "border-orange-200 shadow-lg shadow-orange-500/5 ring-1 ring-orange-100" : "border-slate-100 shadow-sm hover:shadow-md"}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isPaid ? "bg-emerald-50 text-emerald-600" : isVerifying ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"}`}
                              >
                                {isPaid ? (
                                  <CheckCircle size={20} />
                                ) : isVerifying ? (
                                  <Loader2 size={20} className="animate-spin" />
                                ) : (
                                  <AlertCircle size={20} />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-base capitalize">
                                  {new Date(
                                    order.created_at,
                                  ).toLocaleDateString("es-PE", {
                                    weekday: "short",
                                    day: "numeric",
                                  })}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Clock size={10} className="text-slate-400" />
                                  <span className="text-xs text-slate-400 font-medium">
                                    {new Date(
                                      order.created_at,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-black text-slate-900 text-lg tracking-tight">
                                S/ {order.total_amount.toFixed(2)}
                              </p>
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${isPaid ? "bg-emerald-100 text-emerald-700" : isVerifying ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}
                              >
                                {isPaid
                                  ? "Pagado"
                                  : isVerifying
                                    ? "Verificando"
                                    : "Por Pagar"}
                              </span>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 pt-4 border-t border-dashed border-slate-100 space-y-3">
                                  {order.items.map((item: any, i: number) => (
                                    <div
                                      key={i}
                                      className="flex justify-between items-start text-sm"
                                    >
                                      <div className="flex gap-2.5">
                                        <span className="font-bold text-slate-500 text-xs mt-0.5">
                                          {item.qty}x
                                        </span>
                                        <div>
                                          <p className="font-bold text-slate-700 leading-tight">
                                            {item.name}
                                          </p>
                                          {item.options && (
                                            <div className="text-[10px] text-slate-400 mt-0.5 flex flex-col gap-0.5">
                                              {item.options.entrada && (
                                                <span>
                                                  • {item.options.entrada}
                                                </span>
                                              )}
                                              {item.options.bebida && (
                                                <span>
                                                  • {item.options.bebida}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <span className="font-medium text-slate-900 text-xs">
                                        S/ {(item.price * item.qty).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}

                                  <div className="pt-2 flex justify-center">
                                    <ChevronUp
                                      size={16}
                                      className="text-slate-300"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {!isExpanded && (
                            <div className="mt-3 flex justify-center">
                              <ChevronDown
                                size={16}
                                className="text-slate-300"
                              />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* --- MODAL PAGO (Estilo Clean White) --- */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 isolate">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 pb-8 flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    Pagar Deuda
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Regularización
                  </p>
                </div>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="text-center mb-8">
                <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-1">
                  Total a Pagar
                </p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">
                  S/ {deudaTotal.toFixed(2)}
                </p>
              </div>

              {/* TABS YAPE */}
              <div className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-500/5 p-1 mb-6">
                <div className="bg-purple-50/40 rounded-[1.5rem] p-5">
                  <div className="flex bg-white p-1 rounded-xl shadow-sm border border-purple-50 mb-6">
                    <button
                      onClick={() => setYapeMode("qr")}
                      className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${yapeMode === "qr" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:bg-purple-50"}`}
                    >
                      <QrCode size={14} /> QR
                    </button>
                    <button
                      onClick={() => setYapeMode("number")}
                      className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${yapeMode === "number" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:bg-purple-50"}`}
                    >
                      <Smartphone size={14} /> Número
                    </button>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    {yapeMode === "qr" ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-3 rounded-2xl border-2 border-dashed border-purple-200 shadow-sm mb-4"
                      >
                        <img
                          src="/yape-qr.png"
                          alt="QR Yape"
                          className="w-32 h-32 object-contain rounded-lg"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-4 w-full"
                      >
                        <p className="text-3xl font-black text-purple-900 tracking-tighter">
                          974 805 994
                        </p>
                        <p className="text-[10px] font-bold text-purple-600 uppercase mt-1">
                          Irma Cerna Hoyos
                        </p>
                        <button
                          onClick={copyNumber}
                          className="mt-3 w-full py-2.5 bg-white border border-purple-200 rounded-xl text-purple-700 text-xs font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
                          {copied ? "Copiado" : "Copiar"}
                        </button>
                      </motion.div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest pl-2 mb-1 block">
                      Código de Operación
                    </label>
                    <input
                      value={opCode}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        setOpCode(v);
                      }}
                      maxLength={6}
                      placeholder="000000"
                      inputMode="numeric"
                      className="w-full h-14 text-center text-2xl font-black text-purple-900 bg-white border border-purple-100 rounded-2xl focus:border-purple-300 focus:ring-4 focus:ring-purple-500/10 outline-none tracking-[0.3em] placeholder:text-purple-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayDebt}
                disabled={paying}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-base shadow-xl shadow-slate-900/20 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {paying ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Enviar Comprobante"
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
