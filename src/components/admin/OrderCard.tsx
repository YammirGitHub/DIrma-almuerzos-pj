"use client";
import { CheckCircle, Loader2, Ban, Trash2, ShieldCheck, UserPlus, DollarSign, ChefHat, MapPin, Clock } from "lucide-react";

export default function OrderCard({ order, isTrustedClient, processingId, onVerifyPayment, onMarkDelivered, onBlockUser, onDeleteOrder }: any) {
  
  const isDelivered = order.status === "delivered";
  const isPaid = order.payment_status === "paid";
  const isYape = order.payment_method === 'yape';

  return (
    <div className={`relative bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 group flex flex-col h-full ${isDelivered ? "opacity-60 grayscale-[0.8]" : "hover:-translate-y-1"}`}>
      
      {/* Indicador Lateral de Estado */}
      <div className={`absolute left-0 top-8 bottom-8 w-1 rounded-r-full transition-colors ${isDelivered ? "bg-slate-200" : isPaid ? "bg-emerald-400" : "bg-orange-500"}`} />

      {/* HEADER: Cliente y Tiempo */}
      <div className="flex justify-between items-start pl-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {isTrustedClient ? (
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[9px] font-black border border-emerald-100 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={10}/> VIP
              </span>
            ) : (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg text-[9px] font-black border border-blue-100 uppercase tracking-wider flex items-center gap-1">
                <UserPlus size={10}/> Nuevo
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Clock size={10}/> {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          <h3 className="font-black text-slate-900 text-lg leading-tight line-clamp-1">{order.customer_name}</h3>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mt-1">
            <MapPin size={12} className="text-orange-400"/>
            {order.customer_office}
          </div>
        </div>
        
        {/* Menú de Acciones (Hover) */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={(e) => { e.stopPropagation(); onBlockUser(); }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Bloquear"><Ban size={16} /></button>
          <button onClick={() => onDeleteOrder()} className="p-2 text-slate-300 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors" title="Borrar"><Trash2 size={16} /></button>
        </div>
      </div>

      {/* LISTA DE ITEMS */}
      <div className="pl-4 space-y-3 mb-6 flex-1">
        {order.items.map((item: any, i: number) => (
          <div key={i} className="flex gap-3 text-sm">
            <span className="font-extrabold text-slate-700 bg-slate-50 min-w-[24px] h-6 flex items-center justify-center rounded-lg text-xs mt-0.5 border border-slate-100 shadow-sm">{item.qty}</span>
            <div className="leading-tight">
              <span className="text-slate-800 font-bold block">{item.name}</span>
              {item.options && (
                <div className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed pl-2 border-l-2 border-slate-100">
                  {item.options.entrada && <span className="block mb-0.5">Start: {item.options.entrada}</span>}
                  {item.options.bebida && <span className="block">Drink: {item.options.bebida}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER: Totales y Acciones */}
      <div className="pl-4 pt-4 border-t border-dashed border-slate-100 mt-auto">
        <div className="flex justify-between items-end mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monto Total</p>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-900 tracking-tighter">S/ {order.total_amount.toFixed(2)}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{order.payment_method === 'yape' ? 'Yape' : 'Efectivo / Cuenta'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            {/* BOTÓN PAGO */}
            {isPaid ? (
                <div className="w-full py-3 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-2xl flex items-center justify-center gap-1.5 border border-emerald-100/50 shadow-sm">
                    <CheckCircle size={14} strokeWidth={2.5}/> PAGADO
                </div>
            ) : isYape && order.payment_status === 'verifying' ? (
                <button onClick={onVerifyPayment} className="w-full py-3 bg-purple-600 text-white text-[10px] font-black rounded-2xl shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5">
                    <span>VERIFICAR</span>
                    <span className="font-mono text-xs opacity-90 tracking-widest">{order.operation_code}</span>
                </button>
            ) : order.payment_status === 'on_account' ? (
                <div className="w-full py-3 bg-blue-50 text-blue-600 text-[10px] font-black rounded-2xl flex items-center justify-center border border-blue-100">
                    A CUENTA
                </div>
            ) : (
                <button onClick={onVerifyPayment} className="w-full py-3 bg-slate-900 text-white text-[10px] font-black rounded-2xl hover:bg-black active:scale-95 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2">
                    <DollarSign size={14}/> COBRAR
                </button>
            )}

            {/* BOTÓN ENTREGA */}
            {isDelivered ? (
                <div className="w-full py-3 bg-slate-100 text-slate-400 text-[10px] font-black rounded-2xl flex items-center justify-center border border-slate-200">
                    ENTREGADO
                </div>
            ) : (
                <button onClick={onMarkDelivered} disabled={processingId === order.id} className="w-full py-3 bg-orange-500 text-white text-[10px] font-black rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2">
                    {processingId === order.id ? <Loader2 size={14} className="animate-spin"/> : <><ChefHat size={14}/> DESPACHAR</>}
                </button>
            )}
        </div>
      </div>
    </div>
  );
}