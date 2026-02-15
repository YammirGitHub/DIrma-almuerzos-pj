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

export const revalidate = 60; // Actualiza el menú cada 60 segundos, no en cada visita.
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

  // --- CONFIGURACIÓN DE FECHA ---
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
    <main className="w-full pb-40 bg-[#F8F9FA] min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900">
      <SplashScreen />

      {/* --- HERO SECTION CINEMÁTICO --- */}
      {/* Usamos -mt-safe para que la imagen suba detrás de la hora del celular */}
      <div className="relative w-full bg-[#0f172a] z-0 -mt-[env(safe-area-inset-top)] pt-[env(safe-area-inset-top)]">
        {/* Contenedor de Imagen */}
        <div className="relative w-full h-[60vh] min-h-[550px] md:h-[70vh] rounded-b-[3rem] md:rounded-b-[5rem] overflow-hidden shadow-2xl shadow-slate-900/20 border-b border-white/5">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070&auto=format&fit=crop"
              alt="Almuerzos Chiclayo - Sazón Norteña"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-80" // Más visibilidad a la foto
              quality={90}
            />

            {/* Gradiente Superior: Para que se lea la hora y batería */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent opacity-90" />

            {/* Gradiente Inferior: Fusión suave con el contenido */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent" />
          </div>

          {/* --- COPYWRITING HERO --- */}
          <div className="relative z-10 h-full flex flex-col items-center text-center px-6 max-w-4xl mx-auto justify-end pb-28 md:justify-center md:pb-20">
            {/* Badge Premium */}
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-700">
              <MapPin size={12} className="text-orange-400" />
              Exclusivo Poder Judicial
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight mb-4 drop-shadow-lg leading-[0.95] animate-in fade-in zoom-in duration-700">
              Sazón <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-orange-400 to-amber-400">
                Norteña
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-lg leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 text-balance">
              Ingredientes frescos, tradición chiclayana y ese gusto casero que
              <span className="text-white font-semibold border-b border-orange-500/40 mx-1">
                te hace sentir en casa
              </span>
              .
            </p>
          </div>
        </div>
      </div>

      {/* --- DASHBOARD FLOTANTE (Overlap Effect) --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        {/* Tarjetas de Estado */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {/* 1. Hora (Blanco Puro) */}
          <div className="col-span-1 bg-white p-5 rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-center gap-1 group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <div className="p-2 bg-orange-50 rounded-xl">
                <Clock size={18} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Cierre
              </span>
            </div>
            <h3 className="font-black text-slate-900 text-xl leading-none">
              10:30 AM
            </h3>
            <p className="text-[10px] text-slate-400 font-medium leading-tight mt-1">
              Reserva antes de la hora.
            </p>
          </div>

          {/* 2. Cantidad (Naranja Sólido - Acento) */}
          <div className="md:hidden col-span-1 bg-orange-600 text-white p-5 rounded-[1.5rem] shadow-xl shadow-orange-600/30 flex flex-col justify-center items-center text-center gap-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full -mr-8 -mt-8"></div>
            <div className="flex items-center gap-1.5 mb-1 opacity-90">
              <Utensils size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Carta de Hoy
              </span>
            </div>
            <div className="text-4xl font-black leading-none">
              {products?.length || 0}
            </div>
            <div className="text-[9px] font-medium opacity-80">Opciones</div>
          </div>

          {/* 3. Fecha (Negro Mate) */}
          <div className="col-span-2 bg-[#1e293b] rounded-[1.5rem] p-6 flex items-center justify-between text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
            {/* Glow Light */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"></div>

            <div className="relative z-10 flex items-center gap-5">
              <div className="bg-white/10 backdrop-blur-md h-16 w-16 rounded-2xl flex flex-col items-center justify-center border border-white/10">
                <span className="text-2xl font-black">{dayNumber}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">
                  {monthName.slice(0, 3)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 text-orange-400">
                  <CalendarDays size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Disponible Ahora
                  </span>
                </div>
                <h2 className="text-3xl font-black leading-none capitalize">
                  {dayName}
                </h2>
              </div>
            </div>

            {/* Solo PC: Contador Extra */}
            <div className="hidden md:flex flex-col items-end">
              <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
                <span className="text-2xl font-black">
                  {products?.length || 0}
                </span>
                <span className="text-[10px] text-slate-400 ml-2">Platos</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- LISTA DE PRODUCTOS (Contenedor Limpio) --- */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 min-h-[400px]">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 animate-pulse">
                <div className="h-32 bg-slate-100 rounded-3xl w-full"></div>
                <div className="h-32 bg-slate-100 rounded-3xl w-full"></div>
              </div>
            }
          >
            {products && products.length > 0 ? (
              <MenuList products={products} />
            ) : (
              <div className="text-center py-20">
                <div className="inline-block p-6 bg-slate-50 rounded-full mb-4">
                  <ChefHat size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Preparando el menú...
                </h3>
                <p className="text-slate-500 mt-2 text-sm">
                  Vuelve en unos minutos.
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </main>
  );
}
