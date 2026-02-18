"use client";
import { Wallet, ChevronRight, User } from "lucide-react";

export default function CustomerRow({ customer, onClick }: any) {
  const hasDebt = customer.total_debt > 0;

  return (
    <div
      onClick={onClick}
      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-orange-200 hover:shadow-md transition-all active:scale-[0.99] group"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black transition-colors ${hasDebt ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500"}`}
        >
          {customer.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 leading-tight group-hover:text-orange-700 transition-colors">
            {customer.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            {customer.office}
          </p>
          {hasDebt && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded mt-1">
              <Wallet size={10} /> Deuda: S/ {customer.total_debt.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div className="text-right">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
          Gastado
        </p>
        <div className="flex items-center justify-end gap-1 text-slate-900">
          <span className="font-black text-lg">
            S/ {customer.total_spent.toFixed(2)}
          </span>
          <ChevronRight
            size={16}
            className="text-slate-300 group-hover:text-orange-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
