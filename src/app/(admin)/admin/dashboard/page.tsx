"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "@/components/ui/ConfirmationModal"; // Asegúrate de tener la versión corregida
import OrderCard from "@/components/admin/OrderCard";
import ProductCard from "@/components/admin/ProductCard";
import CustomerRow from "@/components/admin/CustomerRow";
import {
  Bell,
  Utensils,
  Plus,
  RefreshCw,
  LogOut,
  X,
  Loader2,
  ChefHat,
  Search,
  Coffee,
  Salad,
  Soup,
  GlassWater,
  Users,
  Wallet,
  UploadCloud,
  CheckCircle, // <--- ¡AQUÍ ESTÁ EL IMPORT QUE FALTABA!
} from "lucide-react";

// --- TIPOS ---
type Order = {
  id: string;
  customer_name: string;
  customer_office: string;
  customer_phone: string;
  customer_dni?: string;
  items: any[];
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  operation_code?: string;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
};

type CustomerSummary = {
  phone: string;
  dni?: string;
  name: string;
  office: string;
  total_debt: number;
  total_spent: number;
  orders_count: number;
  last_order: string;
  history: Order[];
};

export default function AdminDashboard() {
  // Estado UI
  const [activeTab, setActiveTab] = useState("orders");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  // Datos
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [officialCustomers, setOfficialCustomers] = useState<any[]>([]);
  const [deliveredHistory, setDeliveredHistory] = useState<string[]>([]);

  // Selecciones y Procesos
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSummary | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal de Confirmación Global
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger" as "danger" | "info" | "success",
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "menu",
    image_url: "",
  });

  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // --- EFECTOS & REALTIME ---
  useEffect(() => {
    audioRef.current = new Audio(
      "https://cdn.freesound.org/previews/536/536108_1415754-lq.mp3",
    );

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) router.push("/admin");
      await fetchData();
    };
    init();

    const channel = supabase
      .channel("admin_dashboard_root")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        handleRealtimeOrder,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        handleRealtimeProduct,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- LOGICA DE DATOS ---
  const fetchData = async () => {
    const [ord, prod, cust, hist] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("customers").select("phone, full_name, dni"),
      supabase
        .from("orders")
        .select("customer_phone")
        .eq("status", "delivered"),
    ]);

    if (ord.data) setOrders(ord.data);
    if (prod.data) setProducts(prod.data);
    if (cust.data) setOfficialCustomers(cust.data);
    if (hist.data)
      setDeliveredHistory([
        ...new Set(hist.data.map((o: any) => o.customer_phone)),
      ]);
  };

  const handleRealtimeOrder = (payload: any) => {
    if (payload.eventType === "INSERT") {
      setOrders((prev) => [payload.new, ...prev]);
      audioRef.current?.play().catch(() => {});
    } else if (payload.eventType === "UPDATE") {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === payload.new.id ? { ...o, ...payload.new } : o,
        ),
      );
    } else if (payload.eventType === "DELETE") {
      setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
    }
  };

  const handleRealtimeProduct = (payload: any) => {
    if (payload.eventType === "INSERT")
      setProducts((prev) => [payload.new, ...prev]);
    else if (payload.eventType === "UPDATE")
      setProducts((prev) =>
        prev.map((p) => (p.id === payload.new.id ? payload.new : p)),
      );
    else if (payload.eventType === "DELETE")
      setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
  };

  const customersList = useMemo(() => {
    const map = new Map<string, CustomerSummary>();
    orders.forEach((order) => {
      const key = order.customer_dni || order.customer_phone;
      if (!map.has(key)) {
        const official = officialCustomers.find(
          (c) =>
            c.dni === order.customer_dni || c.phone === order.customer_phone,
        );
        map.set(key, {
          phone: order.customer_phone,
          dni: order.customer_dni,
          name: official ? official.full_name : order.customer_name,
          office: order.customer_office,
          total_debt: 0,
          total_spent: 0,
          orders_count: 0,
          last_order: order.created_at,
          history: [],
        });
      }
      const c = map.get(key)!;
      c.history.push(order);
      c.orders_count++;
      c.total_spent += order.total_amount;
      if (["on_account", "unpaid"].includes(order.payment_status))
        c.total_debt += order.total_amount;
      if (new Date(order.created_at) > new Date(c.last_order)) {
        c.last_order = order.created_at;
        c.phone = order.customer_phone;
        c.office = order.customer_office;
      }
    });
    return Array.from(map.values())
      .filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.phone.includes(customerSearch) ||
          (c.dni && c.dni.includes(customerSearch)),
      )
      .sort((a, b) => b.total_debt - a.total_debt);
  }, [orders, officialCustomers, customerSearch]);

  // --- ACTIONS ---
  const askConfirmation = (
    title: string,
    message: string,
    action: () => Promise<void>,
    type: "danger" | "info" = "danger",
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        setIsSubmitting(true);
        await action();
        setIsSubmitting(false);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      type,
    });
  };

  const handleActions = {
    verifyPayment: async (id: string) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, payment_status: "paid" } : o)),
      ); // Optimistic
      await supabase
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", id);
    },
    markDelivered: async (id: string) => {
      setProcessingId(id);
      await supabase
        .from("orders")
        .update({ status: "delivered" })
        .eq("id", id);
      setProcessingId(null);
    },
    deleteOrder: async (id: string) => {
      await supabase.from("orders").delete().eq("id", id);
    },
    blockUser: async (phone: string) => {
      await supabase
        .from("customers")
        .update({ is_blacklisted: true })
        .eq("phone", phone);
    },
    toggleProduct: async (id: string, current: boolean) => {
      setTogglingId(id);
      await supabase
        .from("products")
        .update({ is_available: !current })
        .eq("id", id);
      setTogglingId(null);
    },
    deleteProduct: async (id: string) => {
      await supabase.from("products").delete().eq("id", id);
    },
    addProduct: async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      await supabase.from("products").insert([
        {
          ...newProduct,
          price: parseFloat(newProduct.price),
          is_available: true,
        },
      ]);
      setIsAddOpen(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "menu",
        image_url: "",
      });
      setIsSubmitting(false);
    },
    payDebt: async (customer: CustomerSummary) => {
      const pending = customer.history.filter((o) =>
        ["on_account", "unpaid"].includes(o.payment_status),
      );
      const ids = pending.map((o) => o.id);
      if (ids.length) {
        await supabase
          .from("orders")
          .update({ payment_status: "paid", payment_method: "cash_collected" })
          .in("id", ids);
        // Actualización optimista local para feedback inmediato
        setOrders((prev) =>
          prev.map((o) =>
            ids.includes(o.id) ? { ...o, payment_status: "paid" } : o,
          ),
        );
      }
      setSelectedCustomer(null);
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 text-slate-800 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* HEADER STICKY (Glassmorphism) */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 text-white p-2 rounded-xl shadow-lg shadow-orange-500/20">
            <ChefHat size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-black text-lg leading-none tracking-tight text-slate-900">
              D' Irma Admin
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                En Línea
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors active:scale-90"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() =>
              askConfirmation(
                "Cerrar Sesión",
                "¿Salir del sistema?",
                async () => {
                  await supabase.auth.signOut();
                  router.push("/admin");
                },
                "info",
              )
            }
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-90"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="px-4 mt-6 max-w-[1400px] mx-auto space-y-8">
        {/* SEGMENTED CONTROL (TABS) */}
        <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
          {[
            { id: "orders", label: "Pedidos", icon: Bell },
            { id: "customers", label: "Clientes", icon: Users },
            { id: "menu", label: "Gestión Menú", icon: Utensils },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 relative ${activeTab === tab.id ? "text-orange-600 bg-orange-50/50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100 -z-10"
                />
              )}
              <tab.icon size={16} strokeWidth={2.5} /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: PEDIDOS */}
        {activeTab === "orders" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {orders.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center text-slate-400"
                >
                  <Coffee size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No hay pedidos pendientes hoy.</p>
                </motion.div>
              )}
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <OrderCard
                    order={order}
                    isTrustedClient={deliveredHistory.includes(
                      order.customer_phone,
                    )}
                    processingId={processingId}
                    onVerifyPayment={() =>
                      askConfirmation(
                        "Pago Recibido",
                        `¿Confirmar S/ ${order.total_amount.toFixed(2)}?`,
                        async () => handleActions.verifyPayment(order.id),
                        "info",
                      )
                    }
                    onMarkDelivered={() =>
                      handleActions.markDelivered(order.id)
                    }
                    onBlockUser={() =>
                      askConfirmation(
                        "Bloquear",
                        "El usuario no podrá pedir más.",
                        async () =>
                          handleActions.blockUser(order.customer_phone),
                      )
                    }
                    onDeleteOrder={() =>
                      askConfirmation(
                        "Eliminar",
                        "Esta acción es irreversible.",
                        async () => handleActions.deleteOrder(order.id),
                      )
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* TAB: CLIENTES */}
        {activeTab === "customers" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="relative group">
              <input
                placeholder="Buscar cliente..."
                className="w-full p-4 pl-12 bg-white rounded-2xl shadow-sm border border-slate-200 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors"
                size={20}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {customersList.map((customer) => (
                <CustomerRow
                  key={customer.phone}
                  customer={customer}
                  onClick={() => setSelectedCustomer(customer)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB: MENÚ */}
        {activeTab === "menu" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full bg-white border-2 border-dashed border-slate-300 hover:border-orange-400 p-6 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50/30 transition-all group"
            >
              <div className="bg-slate-100 group-hover:bg-orange-100 p-3 rounded-full transition-colors">
                <Plus size={24} />
              </div>
              <span className="font-bold text-sm">Agregar Nuevo Producto</span>
            </button>

            {[
              {
                id: "menu",
                title: "Menú Ejecutivo",
                icon: ChefHat,
                color: "bg-orange-500",
              },
              { id: "plato", title: "Carta", icon: Soup, color: "bg-red-500" },
              {
                id: "diet",
                title: "Dietas",
                icon: Salad,
                color: "bg-green-500",
              },
              {
                id: "extra",
                title: "Extras",
                icon: Coffee,
                color: "bg-yellow-500",
              },
              {
                id: "bebida",
                title: "Bebidas",
                icon: GlassWater,
                color: "bg-blue-500",
              },
            ].map((section) => {
              const sectionProducts = products.filter(
                (p) => p.category === section.id,
              );
              if (!sectionProducts.length) return null;
              return (
                <div key={section.id}>
                  <div className="flex items-center gap-3 mb-4 pl-1">
                    <div
                      className={`p-2 rounded-lg ${section.color} text-white shadow-md`}
                    >
                      <section.icon size={18} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800">
                      {section.title}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sectionProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onToggleStatus={handleActions.toggleProduct}
                        // FIX: Explicitly typed 'id' as string to fix TypeScript build error
                        onDelete={(id: string) =>
                          askConfirmation(
                            "Borrar Producto",
                            "¿Estás seguro?",
                            async () => handleActions.deleteProduct(id),
                          )
                        }
                        isToggling={togglingId === p.id}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* --- MODALES --- */}

      {/* 1. Modal Nuevo Producto */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 isolate">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl ring-1 ring-black/5"
            >
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <UploadCloud className="text-orange-500" /> Nuevo Plato
              </h2>
              <form onSubmit={handleActions.addProduct} className="space-y-4">
                <input
                  required
                  placeholder="Nombre del plato"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all"
                />
                <textarea
                  placeholder="Descripción (Ingredientes)"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-4 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-orange-500 outline-none text-sm font-medium transition-all resize-none h-24"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">
                      S/
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      className="w-full p-4 pl-10 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-orange-500 outline-none text-sm font-black transition-all"
                    />
                  </div>
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-4 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-orange-500 outline-none text-sm font-bold transition-all appearance-none"
                  >
                    <option value="menu">Menú</option>
                    <option value="plato">Carta</option>
                    <option value="diet">Dieta</option>
                    <option value="extra">Extra</option>
                    <option value="bebida">Bebida</option>
                  </select>
                </div>
                <input
                  placeholder="URL de la Imagen (Opcional)"
                  value={newProduct.image_url}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, image_url: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-orange-500 outline-none text-xs font-mono transition-all text-slate-500"
                />
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-orange-600 text-white rounded-xl font-bold py-3.5 shadow-lg shadow-orange-500/30 hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      "Guardar"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal Detalle Cliente */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 isolate">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header Modal Cliente */}
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {selectedCustomer.name}
                  </h2>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 w-fit">
                      <Users size={12} /> {selectedCustomer.office}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {selectedCustomer.phone}{" "}
                      {selectedCustomer.dni
                        ? `• DNI: ${selectedCustomer.dni}`
                        : ""}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Body Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {/* Tarjeta de Estado */}
                <div
                  className={`p-6 rounded-3xl mb-8 text-center relative overflow-hidden ${selectedCustomer.total_debt > 0 ? "bg-red-50 border border-red-100" : "bg-emerald-50 border border-emerald-100"}`}
                >
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedCustomer.total_debt > 0 ? "text-red-400" : "text-emerald-500"}`}
                  >
                    {selectedCustomer.total_debt > 0
                      ? "Deuda Pendiente"
                      : "Estado de Cuenta"}
                  </p>
                  <p
                    className={`text-5xl font-black mt-2 tracking-tighter ${selectedCustomer.total_debt > 0 ? "text-red-600" : "text-emerald-600"}`}
                  >
                    S/ {selectedCustomer.total_debt.toFixed(2)}
                  </p>

                  {selectedCustomer.total_debt > 0 ? (
                    <button
                      onClick={() =>
                        askConfirmation(
                          "Cobrar Deuda",
                          `¿Confirmar pago total de S/ ${selectedCustomer.total_debt.toFixed(2)}?`,
                          async () => handleActions.payDebt(selectedCustomer),
                          "info",
                        )
                      }
                      className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Wallet size={18} /> REGISTRAR PAGO TOTAL
                    </button>
                  ) : (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-emerald-700 text-xs font-bold">
                      <CheckCircle size={14} /> Cliente al día
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 px-2">
                  Historial Reciente
                </h3>
                <div className="space-y-3">
                  {selectedCustomer.history
                    .slice()
                    .reverse()
                    .map((o) => (
                      <div
                        key={o.id}
                        className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
                      >
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {new Date(o.created_at).toLocaleDateString()} •{" "}
                            {new Date(o.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="font-bold text-slate-700 mt-0.5">
                            {o.items.length} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">
                            S/ {o.total_amount.toFixed(2)}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${o.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {o.payment_status === "paid" ? "Pagado" : "Deuda"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        isLoading={isSubmitting}
        type={confirmModal.type}
      />
    </div>
  );
}
