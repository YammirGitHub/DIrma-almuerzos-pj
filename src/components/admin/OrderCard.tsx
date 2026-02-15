"use client";
import Image from "next/image";
import {
  CheckCircle,
  Loader2,
  Ban,
  Trash2,
  Smartphone,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

export default function OrderCard({
  order,
  isTrustedClient,
  processingId,
  onVerifyPayment,
  onMarkDelivered,
  onBlockUser,
  onDeleteOrder,
}: any) {
  return (
    <div
      className={`bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden ${order.status === "delivered" ? "opacity-70 grayscale" : ""}`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.status === "delivered" ? "bg-green-500" : "bg-orange-500"}`}
      ></div>

      {/* HEADER */}
      <div className="flex justify-between items-start mb-3 pl-2">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            {isTrustedClient ? (
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-[9px] font-black border border-green-200 flex items-center gap-1 uppercase tracking-wider shrink-0">
                <ShieldCheck size={10} /> Frecuente
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md text-[9px] font-black border border-yellow-200 flex items-center gap-1 uppercase tracking-wider animate-pulse shrink-0">
                <UserPlus size={10} /> Nuevo
              </span>
            )}
          </div>
          <h3 className="font-black text-lg leading-tight truncate">
            {order.customer_name}
          </h3>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded w-fit truncate max-w-[150px]">
              {order.customer_office}
            </span>
            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
              <Smartphone size={10} /> {order.customer_phone}
            </span>
          </div>
        </div>

        {/* MENU ACCIONES */}
        <div className="text-right flex flex-col items-end gap-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded">
            {new Date(order.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="flex gap-1 justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBlockUser();
              }}
              className="text-gray-300 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
            >
              <Ban size={16} />
            </button>
            <button
              onClick={() => onDeleteOrder()}
              className="text-gray-300 hover:text-orange-500 p-1.5 rounded hover:bg-orange-50 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ITEMS */}
      <div className="space-y-2 mb-4 pl-2 max-h-[150px] overflow-y-auto custom-scrollbar">
        {order.items.map((item: any, i: number) => (
          <div key={i} className="flex gap-2 text-sm">
            <span className="font-bold text-gray-900 bg-gray-100 px-1.5 rounded text-xs h-fit mt-0.5">
              {item.qty}
            </span>
            <div className="leading-tight">
              <span className="text-gray-700 font-medium">{item.name}</span>
              {item.options && (
                <div className="text-[10px] text-gray-400">
                  {item.options.entrada} {item.options.bebida}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER & ACCIONES */}
      <div className="pt-3 border-t border-gray-100 flex justify-between items-center pl-2">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Total</p>
          <p className="text-xl font-black">
            S/ {order.total_amount.toFixed(2)}
          </p>
        </div>
        <div className="w-[180px]">
          {order.payment_method === "yape" &&
          order.payment_status === "verifying" ? (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => onVerifyPayment()}
                className="w-full bg-purple-600 text-white py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-purple-700 flex flex-col items-center justify-center animate-pulse"
              >
                <span>CONFIRMAR YAPE</span>
                <span className="text-[9px] opacity-80 font-mono">
                  Cod: {order.operation_code}
                </span>
              </button>
              {new Date(order.created_at).toLocaleDateString() !==
                new Date().toLocaleDateString() && (
                <p className="text-[9px] text-orange-600 font-bold text-center bg-orange-50 rounded border border-orange-100 py-0.5">
                  ⚠️ Pago deuda antigua
                </p>
              )}
            </div>
          ) : order.status !== "delivered" ? (
            <button
              onClick={() => onMarkDelivered()}
              disabled={processingId === order.id}
              className={`w-full py-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-1 ${order.payment_status === "on_account" ? "bg-blue-600" : "bg-orange-600"}`}
            >
              {processingId === order.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <CheckCircle size={14} /> LISTO / ENVIAR
                </>
              )}
            </button>
          ) : (
            <div className="bg-gray-100 text-gray-400 py-2 rounded-xl text-xs font-bold text-center">
              Entregado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
