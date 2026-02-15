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
  DollarSign,
  ChefHat,
  Truck,
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
  // Lógica para saber qué botón de ESTADO mostrar
  const renderDeliveryButton = () => {
    if (order.status === "delivered") {
      return (
        <div className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200">
          <CheckCircle size={16} /> Entregado
        </div>
      );
    }

    return (
      <button
        onClick={() => onMarkDelivered()}
        disabled={processingId === order.id}
        className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-200 flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        {processingId === order.id ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            <ChefHat size={16} /> COCINAR / ENTREGAR
          </>
        )}
      </button>
    );
  };

  // Lógica para botón de PAGO
  const renderPaymentButton = () => {
    // Si ya pagó (sea Yape o Efectivo validado)
    if (order.payment_status === "paid") {
      return (
        <div className="w-full py-3 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200">
          <DollarSign size={16} /> Pagado
        </div>
      );
    }

    // Si es cuenta corriente (Deuda)
    if (order.payment_status === "on_account") {
      return (
        <div className="w-full py-3 rounded-xl bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-2 border border-blue-200">
          <DollarSign size={16} /> A Cuenta
        </div>
      );
    }

    // Si es Yape por verificar
    if (
      order.payment_method === "yape" &&
      order.payment_status === "verifying"
    ) {
      return (
        <button
          onClick={() => onVerifyPayment()}
          className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200 flex flex-col items-center justify-center transition-all active:scale-95 animate-pulse border border-purple-500"
        >
          <span className="text-[9px] font-bold opacity-90 mb-0.5">
            VERIFICAR YAPE
          </span>
          {/* EL CÓDIGO SE VE GIGANTE AQUI */}
          <div className="flex items-center gap-2 bg-purple-800/30 px-3 py-0.5 rounded-lg">
            <span className="text-xl font-black tracking-widest">
              {order.operation_code}
            </span>
          </div>
        </button>
      );
    }

    // Si está pendiente (ej. Efectivo o Yape sin código)
    return (
      <button
        onClick={() => onVerifyPayment()} // Asumimos que si das click es porque pagaron
        className="w-full py-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <DollarSign size={16} /> MARCAR PAGADO
      </button>
    );
  };

  return (
    <div
      className={`bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 relative overflow-hidden flex flex-col h-full ${order.status === "delivered" ? "opacity-80" : ""}`}
    >
      {/* Barra lateral de color según estado */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.status === "delivered" ? "bg-gray-300" : "bg-orange-500"}`}
      ></div>

      {/* HEADER */}
      <div className="flex justify-between items-start mb-3 pl-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            {isTrustedClient ? (
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[9px] font-black border border-emerald-100 flex items-center gap-1 uppercase tracking-wider shrink-0">
                <ShieldCheck size={10} /> Frecuente
              </span>
            ) : (
              <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-md text-[9px] font-black border border-yellow-100 flex items-center gap-1 uppercase tracking-wider shrink-0">
                <UserPlus size={10} /> Nuevo
              </span>
            )}
          </div>
          <h3 className="font-black text-lg leading-tight truncate text-gray-900">
            {order.customer_name}
          </h3>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-xs text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded w-fit truncate max-w-[150px] border border-gray-100">
              {order.customer_office}
            </span>
          </div>
        </div>

        {/* INFO TIEMPO + ACCIONES RAPIDAS */}
        <div className="flex flex-col items-end gap-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded border border-gray-100">
            {new Date(order.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBlockUser();
              }}
              className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
              title="Bloquear Usuario"
            >
              <Ban size={16} />
            </button>
            <button
              onClick={() => onDeleteOrder()}
              className="text-gray-300 hover:text-orange-500 hover:bg-orange-50 p-1.5 rounded-lg transition-colors"
              title="Eliminar Pedido"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* LISTA DE ITEMS (Flexible para empujar footer abajo) */}
      <div className="flex-1 mb-4 pl-3 space-y-2.5">
        {order.items.map((item: any, i: number) => (
          <div key={i} className="flex gap-3 text-sm">
            <span className="font-black text-gray-800 bg-gray-100 min-w-[24px] h-6 flex items-center justify-center rounded text-xs mt-0.5">
              {item.qty}
            </span>
            <div className="leading-tight">
              <span className="text-gray-700 font-bold block">{item.name}</span>
              {item.options && (
                <div className="text-[10px] text-gray-400 font-medium mt-0.5 flex flex-wrap gap-1">
                  {item.options.entrada && (
                    <span>• {item.options.entrada}</span>
                  )}
                  {item.options.bebida && <span>• {item.options.bebida}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* TOTAL + BOTONES DE ACCIÓN */}
      <div className="pt-4 border-t border-dashed border-gray-200 pl-3">
        <div className="flex justify-between items-end mb-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Total
          </p>
          <p className="text-2xl font-black text-gray-900 tracking-tighter">
            S/ {order.total_amount.toFixed(2)}
          </p>
        </div>

        {/* GRID DE BOTONES: Aquí está la solución de alineación */}
        <div className="grid grid-cols-2 gap-3">
          {/* Botón 1: Estado del Pago */}
          {renderPaymentButton()}

          {/* Botón 2: Estado del Pedido (Cocina/Entrega) */}
          {renderDeliveryButton()}
        </div>
      </div>
    </div>
  );
}
