"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat } from "lucide-react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // VELOCIDAD: 1000ms (1 segundo exacto).
    // Es el tiempo perfecto: suficiente para ver la marca, rápido para no molestar.
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          // FLUIDEZ PREMIUM: Al salir, la pantalla se agranda un poco y se desenfoca.
          // Esto crea un efecto de "apertura" muy suave hacia el contenido.
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F8F9FA]"
        >
          {/* CONTENEDOR LOGO ANIMADO */}
          <div className="relative">
            {/* Efecto de onda (Pulse) - Más rápido */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 0.8, // Onda más rápida
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute inset-0 bg-orange-200 rounded-2xl"
            />

            {/* El Logo Principal - Entrada 'Snap' (elástica) */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 300, // Más rigidez = movimiento más rápido y seco
                damping: 20,
                duration: 0.5,
              }}
              className="relative z-10 flex items-center justify-center w-24 h-24 bg-orange-500 rounded-3xl shadow-2xl shadow-orange-500/40"
            >
              <ChefHat size={48} className="text-white" strokeWidth={2} />
            </motion.div>
          </div>

          {/* TEXTOS - Aparecen casi al instante */}
          <div className="mt-8 text-center space-y-2 overflow-hidden">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }} // Delay mínimo
              className="text-4xl font-black text-gray-900 tracking-tight"
            >
              D' Irma
            </motion.h1>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }} // Seguido inmediatamente
              className="flex items-center justify-center gap-2"
            >
              <div className="h-[1px] w-4 bg-orange-300"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
                Sazón Norteña
              </p>
              <div className="h-[1px] w-4 bg-orange-300"></div>
            </motion.div>
          </div>

          {/* FOOTER DE CARGA - Acelerado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-10"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.6, // Ciclo de carga muy rápido
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="w-2 h-2 bg-orange-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
