"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error";
  isVisible: boolean;
  onClose: () => void;
};

export default function Toast({ message, type = "error", isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000); // Desaparece en 3 segundos
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed top-6 left-0 right-0 z-[10000] flex justify-center px-4 pointer-events-none"
        >
          <div className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-full shadow-2xl backdrop-blur-xl border ${
            type === "error" 
              ? "bg-white/90 text-red-600 border-red-100 shadow-red-500/10" 
              : "bg-white/90 text-emerald-600 border-emerald-100 shadow-emerald-500/10"
          }`}>
            {type === "error" ? (
              <AlertCircle size={20} strokeWidth={2.5} />
            ) : (
              <CheckCircle size={20} strokeWidth={2.5} />
            )}
            
            <p className="text-sm font-bold text-gray-800 pr-2">{message}</p>
            
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X size={14} className="text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}