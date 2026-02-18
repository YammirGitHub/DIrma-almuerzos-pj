"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, Info, X, CheckCircle2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  type?: "danger" | "info" | "success";
};

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  type = "danger",
}: ConfirmationModalProps) {
  // Configuración de estilos Senior
  const styles = {
    danger: {
      iconBg: "bg-red-50 text-red-500",
      button: "bg-red-600 hover:bg-red-700 shadow-red-500/20 text-white",
      icon: AlertTriangle,
    },
    info: {
      iconBg: "bg-blue-50 text-blue-500",
      button: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 text-white",
      icon: Info,
    },
    success: {
      iconBg: "bg-emerald-50 text-emerald-600",
      button:
        "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 text-white",
      icon: CheckCircle2,
    },
  };

  const currentStyle = styles[type] || styles.danger;
  const Icon = currentStyle.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 isolate">
          {/* Backdrop estable */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={!isLoading ? onCancel : undefined}
          />

          {/* Modal Container */}
          <motion.div
            role="alertdialog"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white w-full max-w-[320px] rounded-[2rem] p-6 shadow-2xl shadow-black/10 ring-1 ring-black/5 overflow-hidden text-center"
          >
            {/* Botón Cerrar (X) */}
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-colors disabled:opacity-0"
            >
              <X size={20} />
            </button>

            {/* Icono Animado */}
            <div
              className={cn(
                "mx-auto w-16 h-16 rounded-3xl flex items-center justify-center mb-5 transition-colors duration-300",
                currentStyle.iconBg,
              )}
            >
              <Icon size={32} strokeWidth={2} />
            </div>

            {/* Textos */}
            <div className="mb-8 space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                {title}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                {message}
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="py-3.5 rounded-2xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors disabled:opacity-50 text-sm"
              >
                Cancelar
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  "py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed text-sm",
                  currentStyle.button,
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Espere...</span>
                  </>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
