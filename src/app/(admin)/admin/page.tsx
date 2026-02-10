"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Correo o contraseña incorrectos.");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    // CAMBIO 1: Fondo Gris Neutro (Clean UI standard)
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* CAMBIO 2: Sombra gris suave en lugar de naranja */}
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 border border-white animate-in fade-in zoom-in duration-500">
        {/* Logo / Icono (Aquí SÍ mantenemos el naranja como marca) */}
        <div className="flex justify-center mb-8">
          <div className="bg-orange-500 text-white p-5 rounded-2xl shadow-lg shadow-orange-200 transform rotate-3 hover:rotate-0 transition-all duration-300">
            <ChefHat size={40} strokeWidth={2} />
          </div>
        </div>

        {/* Textos */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">
            D' Irma
          </h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Acceso a Cocina
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Input Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase ml-2">
              Correo
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                placeholder="admin@dirma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-medium outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-gray-400 text-gray-800"
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase ml-2">
              Contraseña
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-medium outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-gray-400 text-gray-800"
              />
            </div>
          </div>

          {/* Mensaje de Error */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl animate-pulse border border-red-100">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {/* Botón Principal (El único toque fuerte de color) */}
          <button
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-orange-200 hover:bg-orange-600 hover:shadow-orange-300 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Entrando...
              </>
            ) : (
              "Entrar al Sistema"
            )}
          </button>
        </form>

        {/* Footer discreto */}
        <p className="text-center text-gray-300 text-xs mt-8 font-medium">
          Panel exclusivo para administradores
        </p>
      </div>
    </div>
  );
}
