import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import MenuList from "@/components/MenuList";
import SplashScreen from "@/components/SplashScreen";
import { Suspense } from "react";
import Image from "next/image";
import {
  Clock,
  CalendarDays,
  MapPin,
  ChefHat,
  Sparkles,
  Utensils,
  ArrowRight,
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

  // --- CONFIGURACIÓN REGIONAL ---
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { timeZone: "America/Lima" };

  const dayName = now.toLocaleDateString("es-PE", {
    ...options,
    weekday: "long",
  });
  const dayNumber = now.toLocaleDateString("es-PE", {
    ...options,
    day: "numeric",
  });
  const monthName = now.toLocaleDateString("es-PE", {
    ...options,
    month: "long",
  });

  return (
    <main className="w-full pb-32 bg-[#F8F9FA] min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900">
      <SplashScreen />

      {/* --- HERO SECTION PREMIUM --- */}
      <div className="relative w-full bg-[#111827] z-0">
        {/* Contenedor de Imagen con Curva Suave y Borde de Luz */}
        <div className="relative w-full overflow-hidden rounded-b-[3rem] md:rounded-b-[5rem] shadow-2xl shadow-gray-900/80 h-[55vh] min-h-[480px] md:h-[65vh] md:min-h-[600px] border-b border-white/5 ring-1 ring-white/5">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070&auto=format&fit=crop"
              alt="Almuerzos Chiclayo - Sazón Norteña"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-60 transform-gpu scale-105"
              quality={90}
            />
            {/* Gradiente cinemático para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
          </div>

          {/* --- ALINEACIÓN HERO --- */}
          <div className="relative z-10 h-full flex flex-col items-center text-center px-4 max-w-5xl mx-auto justify-end pb-24 pt-32 md:justify-center md:pb-20 md:pt-20">
            {/* Badge Exclusivo */}
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 shadow-lg shadow-black/20 animate-in fade-in slide-in-from-top-4 duration-700">
              <MapPin
                size={11}
                className="text-orange-400 fill-orange-400/20"
              />
              Exclusivo Poder Judicial
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight mb-5 drop-shadow-2xl leading-[0.9] animate-in fade-in zoom-in duration-700">
              Sazón <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-orange-500 to-amber-500">
                Norteña
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 font-medium max-w-xl leading-relaxed opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 px-4 text-balance drop-shadow-md">
              Dale a tu día el gusto que merece.{" "}
              <br className="hidden sm:block" />
              Ingredientes frescos y una experiencia que{" "}
              <span className="text-white font-semibold border-b border-orange-500/50">
                querrás repetir
              </span>
              .
            </p>
          </div>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL (Flotando sobre el Hero) --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-24 relative z-10">
        {/* BENTO GRID (Dashboard de Estado) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 mb-6">
          {/* 1. Tarjeta Hora (Blanco Glass) */}
          <div className="col-span-1 bg-white/90 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] shadow-xl shadow-gray-900/5 border border-white flex flex-col justify-center gap-1 md:gap-2 text-center md:text-left group transition-transform hover:scale-[1.02] duration-300">
            <div className="flex flex-col md:flex-row items-center md:justify-start gap-2 md:gap-4 text-orange-600 mb-1">
              <div className="p-2.5 bg-orange-50 rounded-2xl border border-orange-100 group-hover:bg-orange-100 transition-colors">
                <Clock size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-gray-900 text-base md:text-lg leading-none">
                  10:30 AM
                </h3>
                <p className="text-[9px] md:text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-1">
                  Cierre
                </p>
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-gray-400 font-medium leading-tight hidden md:block pl-1">
              Agenda temprano para asegurar disponibilidad.
            </p>
          </div>

          {/* 2. Tarjeta Cantidad (Móvil - Naranja Vibrante) */}
          <div className="md:hidden col-span-1 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-[2rem] shadow-xl shadow-orange-500/30 flex flex-col justify-center items-center text-center gap-1 border border-white/10 ring-1 ring-white/20">
            <div className="flex items-center gap-1.5 mb-0.5 justify-center opacity-90">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Utensils size={14} className="text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-50">
                Hoy
              </span>
            </div>
            <div className="text-3xl font-black leading-none tracking-tight">
              {products?.length || 0}
            </div>
            <div className="text-[9px] font-bold opacity-80 uppercase tracking-wide text-orange-100">
              Platos
            </div>
          </div>

          {/* 3. Tarjeta Fecha (Negro Premium) */}
          <div className="col-span-2 bg-[#0a0a0a] rounded-[2rem] p-5 md:px-8 md:py-6 flex items-center justify-between text-white shadow-2xl shadow-gray-900/20 relative overflow-hidden group border border-white/5 ring-1 ring-white/5">
            {/* Glow Effect Sutil */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500 rounded-full blur-[90px] opacity-[0.15] group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between w-full">
              {/* IZQUIERDA: Calendario */}
              <div className="flex items-center gap-4 md:gap-6">
                <div className="bg-white/5 backdrop-blur-xl h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center border border-white/10 shadow-inner shrink-0 group-hover:bg-white/10 transition-colors">
                  <span className="text-2xl md:text-3xl font-black text-white leading-none tracking-tighter">
                    {dayNumber}
                  </span>
                  <span className="text-[9px] md:text-[10px] font-bold text-orange-400 uppercase tracking-wider mt-0.5">
                    {monthName.slice(0, 3)}
                  </span>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1 opacity-70">
                    <CalendarDays className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] leading-none">
                      Menú de Hoy
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight capitalize truncate">
                    {dayName}
                  </h2>
                </div>
              </div>

              {/* DERECHA: Contador (Solo PC) */}
              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-2xl border border-white/5 backdrop-blur-md transition-all shadow-lg shadow-black/20 group-hover:scale-105">
                  <div className="bg-orange-500/20 p-1.5 rounded-full">
                    <Sparkles
                      size={14}
                      className="text-orange-400 fill-orange-400 animate-pulse"
                    />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-2xl font-black text-white tracking-tight">
                      {products?.length || 0}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Disp.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- LISTA DE PRODUCTOS --- */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-gray-200/50 border border-white ring-1 ring-gray-100 min-h-[400px] relative overflow-hidden">
          {/* Decoración sutil de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-[10rem] opacity-50 pointer-events-none" />

          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                <div className="h-40 bg-gray-50 rounded-[2rem] w-full"></div>
                <div className="h-40 bg-gray-50 rounded-[2rem] w-full"></div>
              </div>
            }
          >
            {products && products.length > 0 ? (
              <MenuList products={products} />
            ) : (
              <div className="text-center py-20 px-4 flex flex-col items-center">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 relative group cursor-default">
                  <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-30 group-hover:animate-none transition-all"></div>
                  <ChefHat size={32} className="text-orange-500" />
                </div>
                <h3 className="font-black text-gray-900 text-xl md:text-2xl mb-2 tracking-tight">
                  La cocina está preparándose
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto leading-relaxed text-sm md:text-base text-balance">
                  Estamos seleccionando los ingredientes más frescos. Vuelve en
                  unos minutos.
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </main>
  );
}
