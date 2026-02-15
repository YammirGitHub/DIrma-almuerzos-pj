"use client";
import { Wallet, ChevronRight } from "lucide-react";

export default function CustomerRow({
  customer,
  onClick,
}: {
  customer: any;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shadow-inner ${customer.total_debt > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}
        >
          {customer.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 leading-tight">
            {customer.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {customer.office} • {customer.phone}
          </p>
          {customer.total_debt > 0 && (
            <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-bold mt-1">
              <Wallet size={10} /> Debe S/ {customer.total_debt.toFixed(2)}
            </span>
          )}
        </div>
      </div>
      <div className="text-right flex flex-col items-end">
        <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">
          Consumo
        </p>
        <div className="flex items-center gap-2">
          <p className="font-black text-gray-900 text-lg">
            S/ {customer.total_spent.toFixed(2)}
          </p>
          <ChevronRight size={18} className="text-gray-300" />
        </div>
      </div>
    </div>
  );
}
