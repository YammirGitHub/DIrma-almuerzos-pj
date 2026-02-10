"use client";

import { createOrder } from "@/app/actions"; // Server Action
import { useState, useActionState } from "react"; // <--- IMPORTANTE: Importamos el hook

export default function CheckoutModal({ close, cart, products, total }: any) {
  const [method, setMethod] = useState("yape");

  // 1. CONFIGURAMOS EL HOOK
  // [estadoActual, accionDelFormulario, estaCargando] = useActionState(tuFuncionServer, estadoInicial)
  const [state, formAction, isPending] = useActionState(createOrder, null);

  // Preparamos los items para enviar
  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const p = products.find((x: any) => x.id === id);
    return { id, name: p.name, price: p.price, qty };
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Confirmar Pedido</h2>
          <button onClick={close} className="text-gray-400 font-bold text-2xl">
            &times;
          </button>
        </div>

        {/* 2. USAMOS 'formAction' EN LUGAR DE 'createOrder' DIRECTAMENTE */}
        <form action={formAction} className="space-y-6">
          {/* Datos Ocultos (Payload) */}
          <input type="hidden" name="items" value={JSON.stringify(cartItems)} />
          <input type="hidden" name="total" value={total} />
          <input type="hidden" name="payment_method" value={method} />

          {/* Datos del Cliente */}
          <div className="space-y-3">
            <input
              name="name"
              required
              placeholder="Tu Nombre y Apellido"
              className="w-full p-3 border rounded-xl"
            />
            <input
              name="phone"
              required
              placeholder="Celular (WhatsApp)"
              type="tel"
              className="w-full p-3 border rounded-xl"
            />
            <input
              name="office"
              required
              placeholder="Oficina / Juzgado (Ej: Civil 2)"
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {/* Selector de Pago */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("yape")}
              className={`p-3 rounded-xl border-2 font-bold ${method === "yape" ? "border-purple-600 bg-purple-50 text-purple-700" : "border-gray-200"}`}
            >
              YAPE / PLIN
            </button>
            <button
              type="button"
              onClick={() => setMethod("cash")}
              className={`p-3 rounded-xl border-2 font-bold ${method === "cash" ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200"}`}
            >
              EFECTIVO
            </button>
          </div>

          {/* Lógica Condicional */}
          {method === "yape" ? (
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <p className="text-sm text-center mb-2">
                Yapear S/{total.toFixed(2)} al <strong>999-888-777</strong>
              </p>
              <input
                name="operation_code"
                placeholder="Últimos 4 dígitos operación"
                className="w-full p-2 text-center border rounded font-mono"
                required
              />
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-sm mb-2">¿Con cuánto pagas?</p>
              <input
                name="cash_amount"
                type="number"
                step="0.10"
                placeholder="Ej: 50"
                className="w-full p-2 text-center border rounded font-bold"
              />
            </div>
          )}

          {/* 3. MENSAJE DE ERROR SI ALGO FALLA EN EL SERVIDOR */}
          {state?.message && !state.success && (
            <p className="text-red-500 text-center text-sm font-bold bg-red-50 p-2 rounded">
              {state.message}
            </p>
          )}

          {/* 4. BOTÓN DESHABILITADO MIENTRAS CARGA (isPending) */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isPending ? "Procesando..." : "Realizar Pedido"}
          </button>
        </form>
      </div>
    </div>
  );
}
