import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import MenuList from "@/components/MenuList";
import { Suspense } from "react";

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

  return (
    <main className="pb-32 font-sans w-full bg-white">
      {/* HERO SECTION RESPONSIVO */}
      {/* sm:h-80 lg:h-96 -> Crece en pantallas grandes */}
      <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-900 overflow-hidden group">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070&auto=format&fit=crop"
            alt="Almuerzos Chiclayo"
            // scale-105 group-hover:scale-100 -> Efecto zoom suave al pasar mouse
            className="w-full h-full object-cover opacity-60 transition-transform duration-700 ease-in-out scale-105 group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-8 sm:px-10 sm:pb-12 max-w-5xl mx-auto w-full">
          <span className="w-fit bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 border border-white/10">
            Menú Ejecutivo
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-2 drop-shadow-lg">
            Almuerzos PJ <br /> <span className="text-green-400">Chiclayo</span>{" "}
            ⚖️
          </h1>
          <p className="text-gray-300 text-sm sm:text-lg font-medium max-w-lg leading-relaxed">
            La mejor sazón casera, entregada puntualmente en tu despacho o
            juzgado.
          </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="px-4 sm:px-8 -mt-8 relative z-20 w-full max-w-5xl mx-auto">
        {/* LAYOUT GRID: En PC, el aviso va al lado del título */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-end">
          {/* Aviso (Ocupa 1 columna en PC) */}
          <div className="md:col-span-1 bg-white rounded-2xl p-5 shadow-xl shadow-gray-200/50 border border-gray-100 flex items-start gap-4 hover:shadow-2xl transition-shadow">
            <div className="bg-orange-50 p-3 rounded-xl text-orange-600 shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                Cierre: 10:30 AM
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Anticipa tu pedido para asegurar cupo.
              </p>
            </div>
          </div>

          {/* Fecha y Título (Ocupa 2 columnas en PC) */}
          <div className="md:col-span-2 flex flex-col md:items-end justify-end pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              Mostrando menú para
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                La Carta de Hoy
              </h2>
              <span className="text-xs font-bold text-white bg-black px-3 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                {new Date().toLocaleDateString("es-PE", { weekday: "long" })}
              </span>
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
          }
        >
          {products && products.length > 0 ? (
            // Pasamos los productos al componente lista
            <MenuList products={products} />
          ) : (
            <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-4 opacity-50">👨‍🍳</div>
              <h3 className="font-bold text-gray-900 text-xl">
                Menú no publicado
              </h3>
              <p className="text-gray-500 mt-2">
                Estamos preparando las fotos de hoy...
              </p>
            </div>
          )}
        </Suspense>
      </div>
    </main>
  );
}
