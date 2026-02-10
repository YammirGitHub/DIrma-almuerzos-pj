import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import MenuList from "@/components/MenuList";
import { Suspense } from "react";
import { Clock, CalendarDays, MapPin } from "lucide-react"; // Iconos nuevos

export const revalidate = 0;

export default async function Home() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true)
    .order("category", { ascending: false });

  // Fecha bonita para el Hero
  const today = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="w-full pb-32 bg-gray-50 min-h-screen">
      {/* --- HERO SECTION (Impacto Visual) --- */}
      <div className="relative h-[60vh] min-h-[450px] w-full bg-gray-900 overflow-hidden rounded-b-[3rem] shadow-2xl shadow-gray-200">
        {/* Imagen de Fondo con Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070&auto=format&fit=crop"
            alt="Almuerzos Chiclayo"
            className="w-full h-full object-cover opacity-60 animate-in fade-in duration-1000 scale-105"
          />
          {/* Gradiente sutil para que el texto se lea perfecto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
        </div>

        {/* Contenido Hero */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 max-w-4xl mx-auto pt-10">
          {/* Badge Superior */}
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-6 hover:bg-white/30 transition-colors cursor-default">
            <MapPin size={12} className="text-orange-400" /> Exclusivo Poder
            Judicial
          </span>

          {/* Título Principal con Gradiente Naranja */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight mb-4 drop-shadow-lg leading-[0.9]">
            Almuerzos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
              Chiclayo
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-200 font-medium max-w-xl leading-relaxed opacity-90">
            Sazón casera premium entregada en tu despacho.
            <br className="hidden sm:block" /> La pausa perfecta para tu jornada
            judicial.
          </p>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL (Flotando sobre el Hero) --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-24 relative z-20">
        {/* GRID INFORMATIVO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Tarjeta de Aviso (Importante) */}
          <div className="md:col-span-1 bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-orange-500/10 border border-white flex flex-col justify-center gap-2 transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-3 text-orange-600 mb-1">
              <div className="p-2.5 bg-orange-100 rounded-2xl">
                <Clock size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black text-gray-900 leading-none">
                  Cierre 10:30 AM
                </h3>
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mt-0.5">
                  Horario Límite
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed pl-1">
              Agenda tu pedido temprano para asegurar disponibilidad.
            </p>
          </div>

          {/* Fecha Grande (Estilo Calendario) */}
          <div className="hidden md:flex md:col-span-2 bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 items-center justify-between text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"></div>

            <div className="relative z-10">
              <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                <CalendarDays size={14} /> Menú de Hoy
              </p>
              <h2 className="text-3xl font-black capitalize leading-none">
                {today}
              </h2>
            </div>

            <div className="relative z-10 text-right">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <span className="block text-2xl font-black">
                  {products?.length || 0}
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Platos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LISTA DE MENÚ (Contenedor Principal) */}
        <div className="bg-white rounded-[3rem] p-6 sm:p-10 shadow-xl shadow-gray-200/50 border border-gray-100 min-h-[400px]">
          {/* Título Móvil (Solo visible en cel) */}
          <div className="md:hidden mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                La Carta
              </h2>
              <p className="text-xs text-gray-400 font-bold capitalize">
                {today}
              </p>
            </div>
            <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full uppercase tracking-wider">
              Hoy
            </span>
          </div>

          <Suspense
            fallback={
              <div className="grid gap-4 animate-pulse">
                <div className="h-32 bg-gray-100 rounded-3xl w-full"></div>
                <div className="h-32 bg-gray-100 rounded-3xl w-full"></div>
              </div>
            }
          >
            {products && products.length > 0 ? (
              <MenuList products={products} />
            ) : (
              // --- EMPTY STATE MEJORADO ---
              <div className="text-center py-20 px-4">
                <div className="inline-flex justify-center items-center w-24 h-24 bg-orange-50 rounded-full mb-6 relative">
                  <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-20"></div>
                  <span className="text-4xl">👨‍🍳</span>
                </div>
                <h3 className="font-black text-gray-900 text-2xl mb-2 tracking-tight">
                  Menú no publicado
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
                  La señora Irma está seleccionando los mejores ingredientes del
                  mercado.
                  <br />
                  <span className="text-orange-500 font-bold text-sm block mt-2">
                    Vuelve a intentar en unos minutos.
                  </span>
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </main>
  );
}
