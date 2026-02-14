"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from "lucide-react";

export default function HistorialPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) return alert("Ingresa un celular válido");

    setLoading(true);
    setSearched(true);

    // 1. Buscar Cliente
    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", phone)
      .single();

    setCustomerInfo(customer);

    // 2. Buscar Pedidos (Últimos 50)
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_phone", phone)
      .order("created_at", { ascending: false })
      .limit(50);

    if (ordersData) setOrders(ordersData);
    setLoading(false);
  };

  // Cálculos de Deuda (Solo pedidos 'on_account' y 'verifying')
  const deudaTotal = orders
    .filter(
      (o) => o.payment_status === "on_account" || o.payment_status === "unpaid",
    )
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans text-gray-900">
      {/* HEADER SIMPLE */}
      <div className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
        <Link
          href="/"
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="font-black text-lg">Mi Historial</h1>
      </div>

      <div className="max-w-md mx-auto p-4 md:p-6">
        {/* BUSCADOR */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 mb-8">
          <h2 className="text-xl font-black mb-1">Consulta tus consumos</h2>
          <p className="text-sm text-gray-400 mb-6">
            Ingresa tu número para ver tu estado de cuenta.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="999 999 999"
              className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-center text-xl outline-none focus:ring-2 focus:ring-orange-500/20 border border-transparent focus:border-orange-500 transition-all"
            />
            <button
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all shadow-lg hover:bg-black disabled:opacity-50"
            >
              {loading ? "Buscando..." : "Ver Mis Pedidos"}
            </button>
          </form>
        </div>

        {/* RESULTADOS */}
        {searched && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* RESUMEN DE DEUDA */}
            {deudaTotal > 0 ? (
              <div className="bg-orange-500 text-white p-6 rounded-[2rem] shadow-xl shadow-orange-500/30 mb-8 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                <p className="text-orange-100 font-bold uppercase tracking-widest text-xs mb-1">
                  Deuda Acumulada
                </p>
                <div className="text-5xl font-black mb-2">
                  S/ {deudaTotal.toFixed(2)}
                </div>
                <p className="text-sm text-orange-100 opacity-90">
                  Correspondiente a{" "}
                  {
                    orders.filter((o) => o.payment_status === "on_account")
                      .length
                  }{" "}
                  pedidos pendientes de pago.
                </p>
              </div>
            ) : (
              <div className="bg-green-500 text-white p-6 rounded-[2rem] shadow-xl shadow-green-500/30 mb-8 flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <p className="font-black text-xl">¡Estás al día!</p>
                  <p className="text-green-100 text-sm">
                    No tienes deudas pendientes.
                  </p>
                </div>
              </div>
            )}

            {/* LISTA DE PEDIDOS */}
            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4 ml-2">
              Últimos Movimientos
            </h3>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-lg">
                        {new Date(order.created_at).toLocaleDateString(
                          "es-PE",
                          { weekday: "short", day: "numeric", month: "short" },
                        )}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        order.payment_status === "on_account"
                          ? "bg-orange-100 text-orange-700"
                          : order.payment_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {order.payment_status === "on_account"
                        ? "Por Pagar"
                        : order.payment_status === "paid"
                          ? "Pagado"
                          : order.payment_status === "verifying"
                            ? "Verificando"
                            : "Pendiente"}
                    </span>
                  </div>

                  {/* Items Resumidos */}
                  <div className="space-y-1 mb-4">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          <span className="font-bold">{item.qty}x</span>{" "}
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-dashed border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">
                      {order.payment_method === "yape" ? "Yape" : "Fin de Mes"}
                    </span>
                    <span className="font-black text-xl text-gray-900">
                      S/ {order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  No se encontraron pedidos con este número.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
