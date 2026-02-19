"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  ChefHat,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Receipt,
  User,
  CreditCard,
  Building,
  Phone,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- GENERADOR DE CÓDIGO ÚNICO (NIVEL ENTERPRISE) ---
// Formato: AAMMDD-HHMM-HASH (Ej: 260219-1430-B8X9)
// Garantiza que nunca se repita, es cronológico y fácil de buscar.
const formatOrderNumber = (id: string, dateStr: string) => {
  if (!dateStr || !id) return "CARGANDO...";
  const d = new Date(dateStr);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  // Extraemos 4 caracteres alfanuméricos únicos del UUID
  const shortHash = id
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase();

  return `${yy}${mm}${dd}-${hh}${min}-${shortHash}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "Calculando...";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export default function OrderStatusPage() {
  const { id } = useParams() as { id: string };
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // --- ENGINE REALTIME ---
  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error("Error al cargar orden:", error);
      else if (isMounted) setOrder(data);

      if (isMounted) setLoading(false);
    };

    fetchOrder();

    const channel = supabase
      .channel(`tracking-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setOrder((prev: any) => ({ ...prev, ...payload.new }));
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#F8F9FA] gap-4">
        <Loader2
          className="animate-spin text-orange-500"
          size={48}
          strokeWidth={2}
        />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
          Recuperando tu pedido...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#F8F9FA] text-slate-500 font-medium">
        <Receipt size={48} className="mb-4 text-slate-300" strokeWidth={1.5} />
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          Pedido no encontrado
        </h2>
        <p className="text-sm mt-1 mb-6">
          Asegúrate de tener el enlace correcto.
        </p>
        <Link
          href="/"
          className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-slate-800 transition-colors"
        >
          Volver a la Carta
        </Link>
      </div>
    );
  }

  // --- LÓGICA DE COLORES SEMÁNTICOS (UX SENIOR) ---
  const getStatusUI = () => {
    // 1. Entregado / Finalizado (Azul Premium)
    if (order.status === "delivered") {
      return {
        color: "bg-blue-600",
        glow: "shadow-blue-600/30",
        icon: (
          <CheckCircle size={64} className="text-white" strokeWidth={1.5} />
        ),
        title: "¡Pedido Entregado!",
        subtitle: "Gracias por tu preferencia. ¡Buen provecho!",
      };
    }
    // 2. Pagado / Aprobado (Verde Éxito)
    if (
      order.payment_status === "paid" ||
      order.payment_status === "on_account" ||
      order.status === "preparing"
    ) {
      return {
        color: "bg-emerald-500",
        glow: "shadow-emerald-500/30",
        icon: <ChefHat size={64} className="text-white" strokeWidth={1.5} />,
        title: "¡En Preparación!",
        subtitle: "Tu orden está confirmada y en manos de nuestros cocineros.",
      };
    }
    // 3. Validando Yape (Naranja Espera)
    if (order.payment_method === "yape" && order.payment_status === "pending") {
      return {
        color: "bg-orange-500",
        glow: "shadow-orange-500/30",
        icon: (
          <Clock
            size={64}
            className="text-white animate-pulse"
            strokeWidth={1.5}
          />
        ),
        title: "Validando Pago...",
        subtitle:
          "Estamos verificando tu código de operación Yape/Plin. Un momento por favor.",
      };
    }
    // 4. Fallback genérico
    return {
      color: "bg-slate-800",
      glow: "shadow-slate-800/30",
      icon: (
        <Loader2
          size={64}
          className="text-white animate-spin"
          strokeWidth={1.5}
        />
      ),
      title: "Procesando...",
      subtitle: "Registrando tu solicitud en el sistema.",
    };
  };

  const statusUI = getStatusUI();
  const orderNumber = formatOrderNumber(order.id, order.created_at);

  return (
    <div className="min-h-dvh bg-[#F8F9FA] pb-12 font-sans text-slate-900 flex flex-col selection:bg-orange-100">
      {/* 1. NAVBAR PREMIUM */}
      <div className="bg-white/80 backdrop-blur-2xl p-4 sticky top-0 z-40 border-b border-slate-200/50 flex items-center justify-between safe-area-top shadow-sm">
        <Link
          href="/"
          className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft size={20} className="text-slate-700" />
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Código de Seguimiento
          </span>
          <span className="text-sm font-black text-slate-900 font-mono tracking-tighter bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mt-0.5 shadow-inner">
            {orderNumber}
          </span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* 2. LAYOUT MAESTRO */}
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start mt-2 md:mt-6 flex-1">
        {/* COLUMNA IZQUIERDA: HERO DEL ESTADO */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={statusUI.title}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`${statusUI.color} text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl ${statusUI.glow} relative overflow-hidden text-center transition-colors duration-700 isolate`}
            >
              <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-black/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="bg-white/20 p-6 rounded-[2rem] backdrop-blur-md shadow-inner ring-1 ring-white/40"
                >
                  {statusUI.icon}
                </motion.div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3 tracking-tight drop-shadow-sm">
                    {statusUI.title}
                  </h1>
                  <p className="text-white/90 font-medium text-sm md:text-base leading-relaxed max-w-[280px] mx-auto drop-shadow-sm">
                    {statusUI.subtitle}
                  </p>
                </div>

                {/* Info Extra si está validando Yape */}
                {order.payment_method === "yape" &&
                  order.payment_status === "pending" && (
                    <div className="mt-2 bg-black/20 px-6 py-4 rounded-2xl text-sm border border-white/10 backdrop-blur-sm w-full">
                      <span className="opacity-80 text-[10px] font-bold uppercase tracking-widest block mb-1">
                        Cód. Ingresado:
                      </span>
                      <span className="font-mono font-black tracking-[0.3em] text-xl">
                        {order.operation_code || "------"}
                      </span>
                    </div>
                  )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* COLUMNA DERECHA: DETALLES DEL TICKET */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. DATOS DE REGISTRO */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <User size={18} className="text-slate-500" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Datos de Registro
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Nombre Completo
                </p>
                <p className="font-bold text-slate-800 text-sm">
                  {order.customer_name}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  DNI Registrado
                </p>
                <p className="font-mono font-bold text-slate-800 text-sm bg-slate-50 w-fit px-2 py-0.5 rounded border border-slate-100">
                  {order.customer_dni}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <MapPin size={12} /> Área / Oficina
                </p>
                <p className="font-black text-slate-700 text-sm bg-slate-50 px-3 py-1 rounded-lg w-fit border border-slate-100">
                  {order.customer_office}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Phone size={12} /> Celular
                </p>
                <p className="font-mono font-bold text-slate-800 text-sm">
                  {order.customer_phone}
                </p>
              </div>
            </div>
          </div>

          {/* B. DETALLE DEL CONSUMO */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 relative">
            <div className="absolute top-0 inset-x-8 h-[2px] border-t-2 border-dashed border-slate-200"></div>

            <div className="flex justify-between items-end mb-6 mt-2">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Receipt size={18} className="text-slate-400" /> Detalle del
                  Pedido
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200 shadow-inner">
                {order.items?.reduce(
                  (acc: number, item: any) => acc + item.qty,
                  0,
                ) || 0}{" "}
                Items
              </span>
            </div>

            {/* Lista de Platos */}
            <div className="space-y-4 mb-6">
              {order.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-start text-sm bg-slate-50/50 p-4 rounded-2xl border border-slate-100"
                >
                  <div className="flex gap-4">
                    <span className="font-black text-white bg-slate-800 w-7 h-7 flex items-center justify-center rounded-lg text-xs mt-0.5 shadow-md">
                      {item.qty}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-black leading-tight text-base">
                        {item.name}
                      </span>
                      {item.options && (
                        <div className="flex flex-col gap-1 mt-2">
                          {item.options.entrada && (
                            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-100 w-fit">
                              <ArrowRight
                                size={10}
                                className="text-orange-400"
                              />{" "}
                              {item.options.entrada}
                            </span>
                          )}
                          {item.options.bebida && (
                            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-100 w-fit">
                              <ArrowRight
                                size={10}
                                className="text-orange-400"
                              />{" "}
                              {item.options.bebida}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 font-mono tracking-tight text-base mt-1">
                    S/ {(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* ESTADO FINANCIERO (Lógica Condicional Premium) */}
            <div className="bg-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-xl shadow-slate-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Estado Financiero
                </span>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  {order.payment_method === "yape" ? (
                    <>
                      <span className="flex items-center gap-1.5 bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-500/30">
                        <CreditCard size={14} /> Yape / Plin
                      </span>
                      {order.payment_status === "paid" ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-md">
                          <ShieldCheck size={14} /> Pago Verificado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-400 text-xs font-bold bg-orange-500/10 px-2 py-1 rounded-md">
                          <Clock size={14} /> Esperando Verificación
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-500/30">
                        <Building size={14} /> Cargo a Planilla
                      </span>
                      <span className="flex items-center gap-1 text-blue-400 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded-md">
                        <CalendarDays size={14} /> Cargo Diferido
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* LÓGICA DE TOTALES CONDICIONALES */}
              <div className="flex flex-col items-start sm:items-end border-t sm:border-t-0 sm:border-l border-slate-700 pt-4 sm:pt-0 sm:pl-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {order.payment_method === "monthly"
                    ? "Total a Cuenta"
                    : order.payment_status === "paid"
                      ? "Total Pagado"
                      : "Monto Declarado"}
                </span>
                <div
                  className={cn(
                    "flex items-baseline gap-1 drop-shadow-sm",
                    order.payment_method === "monthly"
                      ? "text-blue-400"
                      : order.payment_status === "paid"
                        ? "text-emerald-400"
                        : "text-orange-400",
                  )}
                >
                  <span className="text-sm font-bold">S/</span>
                  <span className="text-4xl font-black tracking-tighter leading-none">
                    {order.total_amount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
