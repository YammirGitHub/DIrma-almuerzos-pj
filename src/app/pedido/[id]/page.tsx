import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { CheckCircle2, MessageCircle, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrderSuccessPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params; // Next.js 15 requiere await en params
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    },
  );

  // 1. Buscamos el pedido
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) {
    redirect("/"); // Si no existe, volver al inicio
  }

  // 2. Generamos el mensaje de WhatsApp
  const whatsappMessage =
    `Hola D'Irma! 👩‍🍳 Acabo de hacer el pedido *#${order.id.slice(0, 4)}* por la web.%0A%0A` +
    `📋 *Mi Pedido:*%0A${order.items.map((i: any) => `- ${i.qty}x ${i.name}`).join("%0A")}%0A%0A` +
    `💰 *Total:* S/ ${order.total_amount}%0A` +
    `📍 *Oficina:* ${order.customer_office}%0A` +
    `📱 *Pago:* ${order.payment_method === "yape" ? "Yape (Verificando)" : `Efectivo (Vuelto para S/ ${order.total_amount + (order.cash_change_amount || 0)})`}`;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        {/* CABECERA VERDE */}
        <div className="bg-green-500 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-50 pattern-dots"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white text-green-500 p-3 rounded-full shadow-lg mb-4">
              <CheckCircle2 size={48} strokeWidth={3} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              ¡Pedido Recibido!
            </h1>
            <p className="text-green-100 font-medium mt-1">
              La cocina ya está notificada
            </p>
          </div>
        </div>

        {/* CUERPO DEL TICKET */}
        <div className="p-8 space-y-6">
          {/* Detalles de Entrega */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="bg-white p-2 rounded-xl shadow-sm text-gray-400">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Entregar en
              </p>
              <p className="text-gray-900 font-bold text-lg leading-tight">
                {order.customer_office}
              </p>
              <p className="text-gray-500 text-sm">{order.customer_name}</p>
            </div>
          </div>

          {/* Resumen de Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">
              Resumen
            </h3>
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">
                  <strong className="text-black">{item.qty}x</strong>{" "}
                  {item.name}
                </span>
                <span className="text-gray-900 font-bold">
                  S/ {(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
              <span className="font-black text-xl">Total</span>
              <span className="font-black text-2xl text-green-600">
                S/ {order.total_amount}
              </span>
            </div>
          </div>

          {/* BOTÓN WHATSAPP (Vital para UX) */}
          <a
            href={`https://wa.me/51974805994?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-[#25D366] text-white font-bold py-4 rounded-2xl text-center shadow-lg shadow-green-200 hover:bg-[#20bd5a] transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <MessageCircle
              size={24}
              fill="white"
              className="text-transparent"
            />
            Confirmar por WhatsApp
          </a>

          <Link
            href="/"
            className="block text-center text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
          >
            Volver al Menú
          </Link>
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-xs font-medium text-center max-w-xs">
        <Clock size={12} className="inline mr-1" />
        Tiempo estimado de entrega: 12:30 PM - 1:30 PM
      </p>
    </main>
  );
}
