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

      {/* --- HERO SECTION --- */}
      <div className="relative w-full bg-gray-900 overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-2xl shadow-gray-300 z-0 h-[60vh] min-h-[500px] md:h-[70vh] md:min-h-[650px]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070&auto=format&fit=crop"
            alt="Almuerzos Chiclayo - Sazón Norteña"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50 transform-gpu"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-black/40" />
        </div>

        {/* --- ALINEACIÓN HERO --- */}
        <div className="relative z-10 h-full flex flex-col items-center text-center px-4 max-w-5xl mx-auto justify-end pb-28 pt-32 md:justify-center md:pb-32 md:pt-20">
          <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 shadow-lg animate-in fade-in slide-in-from-top-4 duration-700">
            <MapPin size={12} className="text-orange-400" /> Exclusivo Poder
            Judicial
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white tracking-tight mb-4 drop-shadow-2xl leading-[0.9] animate-in fade-in zoom-in duration-700">
            Sazón <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500">
              Norteña
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-200 font-medium max-w-xl leading-relaxed opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 px-4 text-balance">
            Dale a tu día el gusto que merece.{" "}
            <br className="hidden sm:block" />
            Sazón norteña auténtica, ingredientes frescos y una experiencia que{" "}
            <span className="text-orange-300 font-bold tracking-wide">
              querrás repetir mañana
            </span>
            .
          </p>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 relative z-10">
        {/* BENTO GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-8">
          {/* 1. Tarjeta Hora */}
          <div className="col-span-1 bg-white/95 backdrop-blur-xl p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white flex flex-col justify-center gap-1 md:gap-2 hover:transform hover:scale-[1.02] transition-all text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:justify-start gap-2 md:gap-4 text-orange-600 mb-1">
              <div className="p-2.5 md:p-3 bg-orange-50 rounded-xl md:rounded-2xl border border-orange-100/50 w-fit mx-auto md:mx-0">
                <Clock size={20} className="md:w-7 md:h-7" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-gray-900 text-base md:text-lg leading-none truncate">
                  10:30 AM
                </h3>
                <p className="text-[9px] md:text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-1">
                  Cierre
                </p>
              </div>
            </div>
            <p className="text-[10px] md:text-sm text-gray-400 font-medium leading-tight hidden md:block pl-1">
              Agenda temprano para asegurar disponibilidad.
            </p>
          </div>

          {/* 2. Tarjeta Cantidad (REGRESÓ LA TARJETA NARANJA EN MÓVIL) */}
          <div className="md:hidden col-span-1 bg-orange-500 text-white p-4 rounded-[1.5rem] shadow-xl shadow-orange-500/20 flex flex-col justify-center items-center text-center gap-1 border border-orange-400">
            <div className="flex items-center gap-1.5 mb-0.5 justify-center opacity-90">
              <div className="p-1 bg-white/20 rounded-lg">
                <Utensils size={14} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Hoy
              </span>
            </div>
            <div className="text-3xl font-black leading-none">
              {products?.length || 0}
            </div>
            <div className="text-[9px] font-bold opacity-80 uppercase tracking-wide">
              Platos
            </div>
          </div>

          {/* 3. Tarjeta Fecha (Negra) */}
          <div className="col-span-2 bg-gradient-to-br from-[#111111] via-black to-[#050505] rounded-[1.5rem] md:rounded-[2rem] p-5 md:px-8 md:py-6 flex items-center justify-between text-white shadow-2xl shadow-gray-900/50 relative overflow-hidden group border border-white/5">
            {/* EFECTO DE FONDO */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-600 rounded-full blur-[80px] opacity-[0.15] group-hover:opacity-25 transition-opacity duration-700 pointer-events-none"></div>

            {/* CONTENEDOR PRINCIPAL */}
            <div className="relative z-10 flex items-center justify-between w-full">
              {/* --- GRUPO IZQUIERDA --- */}
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
                  <div className="flex items-center gap-2 mb-1 opacity-80">
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

              {/* --- GRUPO DERECHA: Contador --- */}
              {/* CORRECCIÓN: 'hidden md:flex' para que SOLO aparezca en PC y NO en móvil */}
              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 md:gap-3 bg-white/5 hover:bg-white/10 px-3 py-2 md:px-5 md:py-3 rounded-2xl border border-white/5 backdrop-blur-md transition-all shadow-lg shadow-black/20">
                  <div className="bg-orange-500/20 p-1.5 rounded-full">
                    <Sparkles
                      size={14}
                      className="text-orange-400 fill-orange-400 animate-pulse"
                    />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-lg md:text-2xl font-black text-white tracking-tight">
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
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-5 sm:p-10 shadow-xl shadow-gray-200/50 border border-white min-h-[400px]">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                <div className="h-40 bg-gray-100 rounded-[1.5rem] w-full"></div>
                <div className="h-40 bg-gray-100 rounded-[1.5rem] w-full"></div>
              </div>
            }
          >
            {products && products.length > 0 ? (
              <MenuList products={products} />
            ) : (
              <div className="text-center py-20 px-4 flex flex-col items-center">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-30"></div>
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
