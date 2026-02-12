import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import MenuList from "@/components/MenuList";
import { Suspense } from "react";
import {
  Clock,
  CalendarDays,
  MapPin,
  ChefHat,
  Sparkles,
  Utensils,
} from "lucide-react";

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

  // Fechas y Textos
  const dateObj = new Date();
  const dayName = dateObj.toLocaleDateString("es-PE", { weekday: "long" });
  const dayNumber = dateObj.toLocaleDateString("es-PE", { day: "numeric" });
  const monthName = dateObj.toLocaleDateString("es-PE", { month: "long" });

  return (
    <main className="w-full pb-32 bg-[#F8F9FA] min-h-screen">
      {/* --- HERO SECTION (IMAGEN Y TEXTO) --- */}
      <div className="relative h-[65vh] min-h-[500px] w-full bg-gray-900 overflow-hidden rounded-b-[3rem] shadow-2xl shadow-gray-300">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070&auto=format&fit=crop"
            alt="Almuerzos Chiclayo"
            className="w-full h-full object-cover opacity-50 animate-in fade-in duration-1000 scale-105"
          />
          {/* Degradado oscuro para que el texto resalte */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-black/30" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 max-w-5xl mx-auto pt-10">
          {/* Badge Premium */}
          <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-700">
            <MapPin size={12} className="text-orange-400" /> Exclusivo Poder
            Judicial
          </div>

          {/* Título Vendedor */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white tracking-tight mb-6 drop-shadow-2xl leading-[0.9] animate-in fade-in zoom-in duration-700">
            Sazón <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500">
              Norteña
            </span>
          </h1>

          {/* Bajada Atractiva */}
          <p className="text-lg sm:text-xl text-gray-200 font-medium max-w-xl leading-relaxed opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Gastronomía casera premium en tu despacho.{" "}
            <br className="hidden sm:block" />
            Ingredientes selectos, sabor auténtico y entrega puntual.
          </p>
        </div>
      </div>

      {/* --- PANEL DE INFORMACIÓN (BENTO GRID RESPONSIVO) --- */}
      {/* Aquí arreglamos el problema del móvil */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 mb-8">
          {/* TARJETA 1: HORA (Pequeña en móvil, Grande en PC) */}
          <div className="col-span-1 md:col-span-1 bg-white/95 backdrop-blur-xl p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white flex flex-col justify-center gap-1 md:gap-2 hover:scale-[1.02] transition-transform">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-orange-600 mb-1">
              <div className="p-2 md:p-3 bg-orange-50 rounded-xl md:rounded-2xl border border-orange-100/50 w-fit">
                <Clock size={20} className="md:w-7 md:h-7" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-base md:text-lg leading-none">
                  10:30 AM
                </h3>
                <p className="text-[9px] md:text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-1">
                  Cierre
                </p>
              </div>
            </div>
            <p className="text-[10px] md:text-sm text-gray-400 font-medium leading-tight md:pl-1 hidden md:block">
              Agenda temprano para asegurar.
            </p>
          </div>

          {/* TARJETA 2: CANTIDAD PLATOS (Solo Móvil - Nuevo) */}
          {/* Esto reemplaza la info perdida en el celular */}
          <div className="md:hidden col-span-1 bg-orange-500 text-white p-4 rounded-[1.5rem] shadow-xl shadow-orange-500/20 flex flex-col justify-center gap-1 border border-orange-400">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Utensils size={16} />
              </div>
              <span className="text-xs font-bold opacity-90 uppercase tracking-wider">
                Hoy
              </span>
            </div>
            <div className="text-3xl font-black leading-none">
              {products?.length || 0}
            </div>
            <div className="text-[10px] font-bold opacity-80">
              Opciones Ricas
            </div>
          </div>

          {/* TARJETA 3: FECHA PREMIUM (Visible siempre, adaptada) */}
          {/* En móvil ocupa ancho completo (col-span-2), en PC ocupa 2 columnas */}
          <div className="col-span-2 bg-gradient-to-br from-[#151515] to-black rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 flex items-center justify-between text-white shadow-2xl shadow-gray-900/20 relative overflow-hidden group border border-white/5">
            {/* Brillo de fondo */}
            <div className="absolute -right-10 -top-10 w-40 md:w-64 h-40 md:h-64 bg-orange-600 rounded-full blur-[60px] md:blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>

            <div className="relative z-10 flex gap-4 md:gap-6 items-center w-full">
              {/* Cuadrado del Día */}
              <div className="bg-white/10 backdrop-blur-md h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center border border-white/10 shadow-inner shrink-0">
                <span className="text-2xl md:text-4xl font-black text-white leading-none">
                  {dayNumber}
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-orange-400 uppercase tracking-wider mt-0.5 md:mt-1">
                  {monthName.slice(0, 3)}
                </span>
              </div>

              {/* Texto Fecha */}
              <div className="flex-1">
                <p className="text-[10px] md:text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-0.5 md:mb-1 flex items-center gap-1.5">
                  <CalendarDays size={12} className="md:w-3.5 md:h-3.5" />
                  <span className="hidden sm:inline">Menú del Día</span>
                  <span className="sm:hidden">Menú Hoy</span>
                </p>
                <h2 className="text-2xl md:text-4xl font-black capitalize tracking-tight leading-none text-white">
                  {dayName}
                </h2>
                {/* Contador de platos versión PC */}
                <div className="hidden md:flex items-center gap-2 mt-2 text-gray-400 text-xs font-medium">
                  <Sparkles size={12} className="text-orange-500" />
                  {products?.length || 0} platos disponibles para ordenar ahora.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- LISTA DE MENÚ --- */}
        <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-5 sm:p-12 shadow-xl shadow-gray-200/50 border border-white min-h-[400px]">
          {/* Cabecera de Sección (Visible y bonita en ambos) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                Nuestra Carta
              </h2>
              <p className="text-gray-400 font-medium mt-1 text-sm md:text-base">
                Selecciona tus antojos favoritos para hoy.
              </p>
            </div>

            {/* Etiquetas (Visuales) */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <span className="px-4 py-2 rounded-full bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-200 whitespace-nowrap">
                Todo
              </span>
              <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200 whitespace-nowrap">
                Menú Ejecutivo
              </span>
              <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200 whitespace-nowrap">
                Extras
              </span>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                <div className="h-40 bg-gray-50 rounded-3xl w-full border border-gray-100"></div>
                <div className="h-40 bg-gray-50 rounded-3xl w-full border border-gray-100"></div>
              </div>
            }
          >
            {products && products.length > 0 ? (
              <MenuList products={products} />
            ) : (
              <div className="text-center py-20 px-4 flex flex-col items-center">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-30"></div>
                  <ChefHat size={32} className="text-orange-500" />
                </div>
                <h3 className="font-black text-gray-900 text-xl md:text-2xl mb-2 tracking-tight">
                  La cocina está preparándose
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto leading-relaxed text-sm md:text-base">
                  Estamos seleccionando los ingredientes más frescos en el
                  mercado.
                  <br />{" "}
                  <span className="text-orange-600 font-bold">
                    Vuelve en unos minutos.
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
