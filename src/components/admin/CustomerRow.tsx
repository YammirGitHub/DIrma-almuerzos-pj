"use client";
import { Wallet, ChevronRight, User } from "lucide-react";

export default function CustomerRow({ customer, onClick }: any) {
  const hasDebt = customer.total_debt > 0;

  return (
    <div onClick={onClick} className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-200 active:scale-[0.99] group">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black transition-colors shadow-sm ${hasDebt ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500"}`}>
          {customer.name.charAt(0).toUpperCase()}
        </div>
        
        {/* Info */}
        <div>
          <h3 className="font-bold text-slate-900 leading-tight group-hover:text-orange-700 transition-colors">{customer.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400 font-medium bg-slate-50 px-1.5 rounded-md border border-slate-100">{customer.office}</span>
            <span className="text-[10px] text-slate-300 font-mono">{customer.phone}</span>
          </div>
          
          {hasDebt && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full mt-1.5 border border-red-100">
              <Wallet size={10} /> Deuda: S/ {customer.total_debt.toFixed(2)}
            </span>
          )}
        </div>
      </div>
      
      {/* Columna Derecha */}
      <div className="text-right flex flex-col justify-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mb-0.5">Total</p>
        <div className="flex items-center justify-end gap-1 text-slate-900">
            <span className="font-black text-lg tracking-tight">S/ {customer.total_spent.toFixed(2)}</span>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
        </div>
      </div>
    </div>
  );
}