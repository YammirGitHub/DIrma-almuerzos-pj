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
  MessageCircle,
  Loader2,
  Receipt,
} from "lucide-react";
import { motion } from "framer-motion";

export default function OrderStatusPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    // 1. CARGA DE DATOS INICIAL
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al cargar:", error);
      } else {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();

    // 2. SUSCRIPCIÓN REALTIME (Separada para estabilidad)
    const channel = supabase
      .channel(`tracking-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`, // Escucha solo ESTE pedido
        },
        (payload) => {
          console.log("⚡ Cambio detectado:", payload.new);
          // Actualizamos el estado fusionando los nuevos datos
          setOrder((prev: any) => ({ ...prev, ...payload.new }));
        },
      )
      .subscribe();

    // 3. LIMPIEZA (Vital para que no se cuelgue)
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, supabase]);

  if (loading)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );

  if (!order)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-gray-400 font-bold">
        Pedido no encontrado
      </div>
    );

  // --- LÓGICA DE ESTADOS VISUALES ---
  const getStatusColor = () => {
    if (order.status === "delivered") return "bg-green-500";
    if (
      order.payment_status === "paid" ||
      order.payment_status === "on_account"
    )
      return "bg-emerald-500";
    return "bg-orange-500";
  };

  const getStatusIcon = () => {
    if (order.status === "delivered") return <CheckCircle size={56} />;
    if (order.payment_status === "paid") return <ChefHat size={56} />;
    if (order.payment_status === "on_account") return <ChefHat size={56} />;
    return <Clock size={56} className="animate-pulse" />;
  };

  const getStatusTitle = () => {
    if (order.status === "delivered") return "¡Entregado!";
    if (order.payment_status === "paid") return "¡Confirmado!";
    if (order.payment_status === "on_account") return "¡Confirmado!";
    if (order.payment_method === "yape") return "Verificando...";
    return "Procesando...";
  };

  const getStatusMessage = () => {
    if (order.status === "delivered")
      return "Gracias por tu preferencia. ¡Hasta la próxima!";
    if (order.payment_status === "paid")
      return "Tu orden está en cocina. ¡Buen provecho!";
    if (order.payment_status === "on_account")
      return "El monto ha sido cargado a tu cuenta corriente.";
    if (order.payment_method === "yape")
      return "Estamos revisando el código de operación. No cierres esta ventana si deseas.";
    return "Hemos recibido tu orden.";
  };

  return (
    <div className="min-h-[100dvh] bg-[#F8F9FA] pb-12 font-sans text-gray-900 flex flex-col">
      {/* NAVBAR */}
      <div className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-20 border-b border-gray-200/50 flex items-center justify-between safe-area-top shadow-sm">
        <Link
          href="/"
          className="p-2.5 bg-gray-100/80 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Pedido N°
          </span>
          <span className="text-sm font-black text-gray-900 font-mono tracking-tighter">
            {order.id.slice(0, 6).toUpperCase()}
          </span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* LAYOUT RESPONSIVO (GRID) */}
      <div className="max-w-5xl mx-auto p-4 md:p-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start mt-4 flex-1">
        {/* COLUMNA IZQUIERDA: ESTADO GIGANTE (Sticky en PC) */}
        <div className="lg:sticky lg:top-28">
          <motion.div
            layout
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${getStatusColor()} text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-orange-900/10 relative overflow-hidden text-center transition-colors duration-500`}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-3xl"></div>

            {/* Círculos decorativos de fondo */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="bg-white/20 p-5 rounded-full backdrop-blur-md shadow-inner ring-1 ring-white/30">
                {getStatusIcon()}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3 tracking-tight">
                  {getStatusTitle()}
                </h1>
                <p className="text-white/90 font-medium text-base md:text-lg leading-relaxed max-w-[300px] mx-auto">
                  {getStatusMessage()}
                </p>
              </div>

              {/* Código de verificación Yape */}
              {order.payment_method === "yape" &&
                order.payment_status === "verifying" && (
                  <div className="mt-4 bg-black/20 px-5 py-3 rounded-2xl text-sm font-mono border border-white/10 backdrop-blur-sm animate-pulse">
                    <span className="opacity-70 text-xs block mb-1">
                      Código enviado:
                    </span>
                    <span className="font-black tracking-widest text-lg">
                      {order.operation_code}
                    </span>
                  </div>
                )}
            </div>
          </motion.div>

          {/* Botón WhatsApp (Visible en PC debajo del estado) */}
          <div className="hidden lg:block mt-8 text-center">
            <p className="text-sm text-gray-400 mb-3 font-medium">
              ¿Necesitas ayuda con este pedido?
            </p>
            <a
              href={`https://wa.me/51974805994?text=Hola, tengo una duda con mi pedido #${order.id.slice(0, 6)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-gray-200 hover:shadow-xl hover:scale-105 transition-all border border-gray-100"
            >
              <MessageCircle size={20} /> Contactar Soporte
            </a>
          </div>
        </div>

        {/* COLUMNA DERECHA: DETALLES (Scrollable en PC) */}
        <div className="space-y-6">
          {/* DATOS DE ENTREGA */}
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <MapPin size={14} /> Datos de Entrega
            </h3>
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 p-4 rounded-2xl text-orange-600">
                <MapPin size={24} />
              </div>
              <div>
                <p className="font-black text-gray-900 text-xl leading-none mb-1">
                  {order.customer_name}
                </p>
                <div className="flex items-center gap-2 text-gray-500 font-bold bg-gray-50 px-2 py-1 rounded-lg w-fit text-sm mt-1">
                  {order.customer_office}
                </div>
              </div>
            </div>
          </div>

          {/* RESUMEN DEL PEDIDO */}
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
            {/* Decoración Ticket */}
            <div className="absolute top-0 left-6 w-12 h-1 bg-orange-500 rounded-b-lg"></div>

            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 mt-2">
              <Receipt size={14} /> Detalle del Consumo
            </h3>

            <div className="space-y-5 mb-6 border-b border-gray-100 pb-6 border-dashed">
              {order.items.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-start text-sm md:text-base"
                >
                  <div className="flex gap-4">
                    <span className="font-black text-gray-900 bg-gray-100 w-7 h-7 flex items-center justify-center rounded-lg text-xs mt-0.5">
                      {item.qty}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-bold leading-tight">
                        {item.name}
                      </span>
                      {item.options && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.options.entrada && (
                            <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-100 font-bold">
                              {item.options.entrada}
                            </span>
                          )}
                          {item.options.bebida && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-bold">
                              {item.options.bebida}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 font-mono">
                    S/ {(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
              <span className="font-bold text-gray-500 text-sm uppercase tracking-wide">
                Total a Pagar
              </span>
              <span className="font-black text-3xl text-gray-900 tracking-tighter">
                S/ {order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botón WhatsApp (Solo Móvil) */}
          <div className="lg:hidden text-center pt-4 pb-8">
            <a
              href={`https://wa.me/51974805994?text=Hola, tengo una duda con mi pedido #${order.id.slice(0, 6)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-full font-bold text-sm shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <MessageCircle size={18} /> ¿Problemas? Escribir al WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
