"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  type?: "danger" | "info"; // Para cambiar color (rojo o azul)
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
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 isolate">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onCancel : undefined}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-center overflow-hidden"
          >
            <div
              className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${type === "danger" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"}`}
            >
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
              {message}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="py-3.5 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-70 ${type === "danger" ? "bg-red-500 shadow-red-200 hover:bg-red-600" : "bg-blue-600 shadow-blue-200 hover:bg-blue-700"}`}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Confirmar"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
