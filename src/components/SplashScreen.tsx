"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat } from "lucide-react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // La animación dura 2.5 segundos en total antes de desaparecer
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F8F9FA]"
        >
          {/* CONTENEDOR LOGO ANIMADO */}
          <div className="relative">
            {/* Efecto de onda (Pulse) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute inset-0 bg-orange-200 rounded-2xl"
            />

            {/* El Logo Principal */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.8,
              }}
              className="relative z-10 flex items-center justify-center w-24 h-24 bg-orange-500 rounded-3xl shadow-2xl shadow-orange-500/40"
            >
              <ChefHat size={48} className="text-white" strokeWidth={2} />
            </motion.div>
          </div>

          {/* TEXTOS CON ENTRADA ESCALONADA */}
          <div className="mt-8 text-center space-y-2 overflow-hidden">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-4xl font-black text-gray-900 tracking-tight"
            >
              D' Irma
            </motion.h1>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex items-center justify-center gap-2"
            >
              <div className="h-[1px] w-4 bg-orange-300"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
                Sazón Norteña
              </p>
              <div className="h-[1px] w-4 bg-orange-300"></div>
            </motion.div>
          </div>

          {/* FOOTER DE CARGA (Opcional, detalle técnico) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
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
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
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
