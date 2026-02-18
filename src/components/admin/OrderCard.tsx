"use client";
import {
  CheckCircle,
  Loader2,
  Ban,
  Trash2,
  ShieldCheck,
  UserPlus,
  DollarSign,
  ChefHat,
  Eye,
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
  const isDelivered = order.status === "delivered";
  const isPaid = order.payment_status === "paid";

  return (
    <div
      className={`relative bg-white rounded-[1.75rem] p-5 shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:shadow-orange-500/5 group ${isDelivered ? "opacity-60 grayscale-[0.5]" : ""}`}
    >
      {/* Barra Estado Lateral */}
      <div
        className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${isDelivered ? "bg-slate-200" : "bg-orange-500"}`}
      />

      {/* Header */}
      <div className="flex justify-between items-start pl-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {isTrustedClient ? (
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[9px] font-black border border-emerald-100 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={10} /> VIP
              </span>
            ) : (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[9px] font-black border border-blue-100 uppercase tracking-wider flex items-center gap-1">
                <UserPlus size={10} /> Nuevo
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-400">
              {new Date(order.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <h3 className="font-black text-slate-900 text-lg leading-tight line-clamp-1">
            {order.customer_name}
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            {order.customer_office}
          </p>
        </div>

        {/* Acciones Rápidas (Hover) */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBlockUser();
            }}
            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Ban size={16} />
          </button>
          <button
            onClick={() => onDeleteOrder()}
            className="p-1.5 text-slate-300 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Lista Items */}
      <div className="pl-3 space-y-3 mb-5">
        {order.items.map((item: any, i: number) => (
          <div key={i} className="flex gap-3 text-sm">
            <span className="font-extrabold text-slate-700 bg-slate-100 min-w-[24px] h-6 flex items-center justify-center rounded-md text-xs mt-0.5 border border-slate-200">
              {item.qty}
            </span>
            <div className="leading-tight">
              <span className="text-slate-800 font-bold block">
                {item.name}
              </span>
              {item.options && (
                <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-relaxed">
                  {item.options.entrada && (
                    <span>+ {item.options.entrada}</span>
                  )}
                  {item.options.bebida && (
                    <span className="block">+ {item.options.bebida}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Acciones */}
      <div className="pl-3 pt-4 border-t border-dashed border-slate-100 grid grid-cols-2 gap-3 items-end">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total
          </p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter">
            S/ {order.total_amount.toFixed(2)}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {/* Botón Estado Pago */}
          {isPaid ? (
            <div className="w-full py-2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 border border-emerald-100">
              <CheckCircle size={12} /> PAGADO
            </div>
          ) : order.payment_method === "yape" &&
            order.payment_status === "verifying" ? (
            <button
              onClick={onVerifyPayment}
              className="w-full py-2 bg-purple-600 text-white text-[10px] font-bold rounded-xl shadow-md shadow-purple-200 hover:bg-purple-700 transition-colors animate-pulse"
            >
              VERIFICAR {order.operation_code}
            </button>
          ) : order.payment_status === "on_account" ? (
            <div className="w-full py-2 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-xl flex items-center justify-center border border-blue-100">
              A CUENTA
            </div>
          ) : (
            <button
              onClick={onVerifyPayment}
              className="w-full py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl hover:bg-black transition-colors"
            >
              MARCAR PAGADO
            </button>
          )}

          {/* Botón Cocina/Entrega */}
          {isDelivered ? (
            <div className="w-full py-2 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-xl flex items-center justify-center border border-slate-200">
              ENTREGADO
            </div>
          ) : (
            <button
              onClick={onMarkDelivered}
              disabled={processingId === order.id}
              className="w-full py-2 bg-orange-600 text-white text-[10px] font-bold rounded-xl shadow-md shadow-orange-200 hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              {processingId === order.id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <>
                  <ChefHat size={12} /> ENTREGAR
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
