"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Receipt,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Toast from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";

export default function HistorialPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [customerExists, setCustomerExists] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null); // Para expandir detalles

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error" as "error" | "success",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 9) setPhone(value);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phone.length !== 9 || !phone.startsWith("9")) {
      setToast({
        show: true,
        message: "Ingresa un celular válido (9 dígitos)",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setSearched(true);
    setExpandedOrder(null); // Resetear expansiones

    // 1. Verificamos si el cliente EXISTE
    const { data: customer } = await supabase
      .from("customers")
      .select("phone")
      .eq("phone", phone)
      .single();

    setCustomerExists(!!customer);

    // 2. Si existe, buscamos pedidos
    if (customer) {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_phone", phone)
        .order("created_at", { ascending: false })
        .limit(50);
      setOrders(ordersData || []);
    } else {
      setOrders([]);
    }

    setLoading(false);
  };

  const deudaTotal = orders
    .filter(
      (o) => o.payment_status === "on_account" || o.payment_status === "unpaid",
    )
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-gray-900">
      <Toast
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4 safe-area-top">
        <Link
          href="/"
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="font-black text-lg">Mi Historial</h1>
      </div>

      <div className="max-w-md mx-auto p-4 md:p-6 mt-4">
        {/* BUSCADOR */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 mb-8 border border-white">
          <h2 className="text-xl font-black mb-1 text-gray-900">
            Consulta tus consumos
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Ingresa tu número para ver tu estado de cuenta.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="999 999 999"
                className="w-full p-4 pl-12 bg-gray-50 rounded-2xl font-bold text-center text-2xl outline-none focus:ring-2 focus:ring-orange-500/20 border border-transparent focus:border-orange-500 transition-all placeholder:text-gray-300 tracking-widest text-gray-900"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={24}
              />
            </div>
            <button
              disabled={loading || phone.length !== 9}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all shadow-lg hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Buscando..." : "Ver Mis Pedidos"}
            </button>
          </form>
        </div>

        {searched && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ESTADO 1: NO EXISTE */}
            {!customerExists && (
              <div className="text-center py-8 bg-gray-50 rounded-[2rem] border border-gray-100 px-6">
                <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <HelpCircle className="text-gray-400" size={32} />
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">
                  Número no registrado
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Este celular no tiene historial de pedidos.
                </p>
                <Link
                  href="/"
                  className="text-orange-600 font-bold text-sm hover:underline"
                >
                  ¡Haz tu primer pedido aquí!
                </Link>
              </div>
            )}

            {/* ESTADO 2 y 3: CLIENTE EXISTE */}
            {customerExists && (
              <>
                {deudaTotal > 0 ? (
                  <div className="bg-orange-600 text-white p-6 rounded-[2rem] shadow-xl shadow-orange-600/30 mb-8 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2 opacity-90">
                        <AlertCircle size={18} />
                        <p className="font-bold uppercase tracking-widest text-xs">
                          Por Pagar
                        </p>
                      </div>
                      <div className="text-5xl font-black mb-2 tracking-tight">
                        S/ {deudaTotal.toFixed(2)}
                      </div>
                      <p className="text-sm text-orange-100 font-medium">
                        Tienes pedidos pendientes.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500 text-white p-6 rounded-[2rem] shadow-xl shadow-emerald-500/30 mb-8 flex items-center gap-5 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm relative z-10">
                      <CheckCircle size={32} strokeWidth={2.5} />
                    </div>
                    <div className="relative z-10">
                      <p className="font-black text-2xl leading-none mb-1">
                        ¡Estás al día!
                      </p>
                      <p className="text-emerald-100 text-sm font-medium">
                        Gracias por tu puntualidad.
                      </p>
                    </div>
                  </div>
                )}

                <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4 ml-2 pl-2 border-l-2 border-orange-500">
                  Historial Reciente
                </h3>

                <div className="space-y-4 pb-20">
                  {orders.map((order) => {
                    const isExpanded = expandedOrder === order.id;

                    return (
                      <div
                        key={order.id}
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : order.id)
                        }
                        className={`bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 transition-all cursor-pointer ${isExpanded ? "ring-2 ring-orange-100" : "hover:shadow-md"}`}
                      >
                        {/* HEADER TARJETA */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-gray-900 text-lg capitalize">
                              {new Date(order.created_at).toLocaleDateString(
                                "es-PE",
                                {
                                  weekday: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                              {new Date(order.created_at).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>

                          {/* COLUMNA DE ESTADOS (PAGO + ENTREGA) */}
                          <div className="flex flex-col items-end gap-2">
                            {/* 1. Estado de Pago */}
                            <span
                              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border ${
                                order.payment_status === "on_account"
                                  ? "bg-orange-50 text-orange-700 border-orange-100"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
                              }`}
                            >
                              {order.payment_status === "on_account"
                                ? "Debe"
                                : "Pagado"}
                            </span>

                            {/* 2. Estado de Entrega (NUEVO) */}
                            {order.status === "delivered" ? (
                              <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md text-[9px] font-bold border border-gray-100 uppercase tracking-wider">
                                <CheckCircle
                                  size={12}
                                  className="text-green-500"
                                />{" "}
                                Entregado
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[9px] text-orange-400 font-bold uppercase tracking-wider animate-pulse">
                                ⏳ En preparación
                              </span>
                            )}
                          </div>
                        </div>

                        {/* RESUMEN VISUAL (Si está cerrado muestra cantidad, si abierto nada) */}
                        {!isExpanded && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Receipt size={14} />
                            <span>{order.items.length} productos</span>
                            <ChevronDown
                              size={14}
                              className="ml-auto text-gray-300"
                            />
                          </div>
                        )}

                        {/* DETALLE EXPANDIBLE (ACORDEÓN) */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 pb-2 space-y-3 border-t border-dashed border-gray-100 mt-2">
                                {order.items.map((item: any, i: number) => (
                                  <div
                                    key={i}
                                    className="flex justify-between items-start text-sm"
                                  >
                                    <div className="flex gap-2">
                                      <span className="font-black text-gray-900 bg-gray-100 px-1.5 rounded text-xs h-fit mt-0.5">
                                        {item.qty}
                                      </span>
                                      <div>
                                        <p className="font-bold text-gray-700 leading-tight">
                                          {item.name}
                                        </p>
                                        {item.options && (
                                          <div className="text-[10px] text-gray-400 mt-0.5 flex flex-col">
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
                                    <span className="font-mono text-gray-500 text-xs mt-0.5">
                                      S/ {(item.price * item.qty).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-center pt-2">
                                <ChevronUp
                                  size={16}
                                  className="text-gray-300"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* TOTAL FOOTER */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-1">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {order.payment_method === "yape"
                              ? "Yape"
                              : "A Cuenta"}
                          </span>
                          <span className="font-black text-xl text-gray-900">
                            S/ {order.total_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
