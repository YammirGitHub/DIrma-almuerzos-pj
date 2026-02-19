"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
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
  Package,
  ListFilter,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  stock?: number | null;
  options?: { entradas?: string[]; bebidas?: string[] } | null;
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
  const [activeTab, setActiveTab] = useState("orders");
  const [orderView, setOrderView] = useState<"today" | "all">("today");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [officialCustomers, setOfficialCustomers] = useState<any[]>([]);
  const [deliveredHistory, setDeliveredHistory] = useState<string[]>([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSummary | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger" as "danger" | "info" | "success",
  });

  // ESTADO DEL PRODUCTO CON OPCIONES DINÁMICAS
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "menu",
    image_url: "",
    stock: "",
    entradas: "",
    bebidas: "", // Se manejarán como strings separadas por comas en el form
  });

  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

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
    } else if (payload.eventType === "UPDATE")
      setOrders((prev) =>
        prev.map((o) =>
          o.id === payload.new.id ? { ...o, ...payload.new } : o,
        ),
      );
    else if (payload.eventType === "DELETE")
      setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
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

  const filteredOrders = useMemo(() => {
    if (orderView === "all") return orders;
    const today = new Date().toDateString();
    return orders.filter(
      (o) => new Date(o.created_at).toDateString() === today,
    );
  }, [orders, orderView]);

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
      type,
      onConfirm: async () => {
        setIsSubmitting(true);
        await action();
        setIsSubmitting(false);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleActions = {
    verifyPayment: async (id: string) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, payment_status: "paid" } : o)),
      );
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
        setOrders((prev) =>
          prev.map((o) =>
            ids.includes(o.id) ? { ...o, payment_status: "paid" } : o,
          ),
        );
      }
      setSelectedCustomer(null);
    },
    // GUARDAR PRODUCTO CON OPCIONES (JSONB)
    saveProduct: async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const finalStock =
          newProduct.stock === "" || newProduct.stock === null
            ? null
            : parseInt(newProduct.stock as string);
        const parsedPrice = parseFloat(newProduct.price as string);
        if (isNaN(parsedPrice)) throw new Error("Precio inválido");

        // Convertir strings separadas por coma en Arrays limpios
        const optionsObj = {
          entradas: newProduct.entradas
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          bebidas: newProduct.bebidas
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };

        const productData = {
          name: newProduct.name,
          description: newProduct.description,
          price: parsedPrice,
          category: newProduct.category,
          image_url: newProduct.image_url,
          stock: finalStock,
          options: optionsObj, // Se guarda en PostgreSQL como JSONB
          is_available: true,
        };

        if (editingId) {
          const { error } = await supabase
            .from("products")
            .update(productData)
            .eq("id", editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("products")
            .insert([productData]);
          if (error) throw error;
        }

        setIsAddOpen(false);
        setEditingId(null);
        setNewProduct({
          name: "",
          description: "",
          price: "",
          category: "menu",
          image_url: "",
          stock: "",
          entradas: "",
          bebidas: "",
        });
      } catch (err: any) {
        console.error("Error al guardar:", err);
        alert("Ocurrió un error al guardar el producto.");
      } finally {
        setIsSubmitting(false);
      }
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 text-slate-800 font-sans selection:bg-orange-100">
      {/* HEADER STICKY */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-orange-600 text-white h-10 w-10 rounded-xl shadow-lg shadow-orange-500/30">
            <ChefHat size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-black tracking-tighter text-slate-900 leading-none text-lg">
              D' Irma <span className="text-orange-600">Admin</span>
            </h1>
            <p className="font-bold text-[9px] text-slate-400 uppercase tracking-[0.2em] mt-0.5">
              Panel de Control
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
          >
            <RefreshCw size={18} strokeWidth={2.5} />
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
            className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors active:scale-95"
          >
            <LogOut size={18} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="px-4 md:px-8 mt-6 max-w-[1400px] mx-auto space-y-8">
        {/* TABS */}
        <div className="flex p-1.5 bg-white rounded-[1.25rem] w-full md:w-fit mx-auto overflow-x-auto no-scrollbar border border-slate-200 shadow-sm">
          {[
            { id: "orders", label: "Monitor en Vivo", icon: Bell },
            { id: "customers", label: "Directorio", icon: Users },
            { id: "menu", label: "Catálogo", icon: Utensils },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 min-w-max",
                activeTab === tab.id
                  ? "text-white shadow-md shadow-orange-500/20"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="adminTab"
                  className="absolute inset-0 bg-orange-600 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
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
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 tracking-tight">
                    Centro de Recepción
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Gestiona y cobra los pedidos al instante.
                  </p>
                </div>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto">
                <button
                  onClick={() => setOrderView("today")}
                  className={cn(
                    "flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                    orderView === "today"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500",
                  )}
                >
                  Solo Hoy (
                  {
                    orders.filter(
                      (o) =>
                        new Date(o.created_at).toDateString() ===
                        new Date().toDateString(),
                    ).length
                  }
                  )
                </button>
                <button
                  onClick={() => setOrderView("all")}
                  className={cn(
                    "flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                    orderView === "all"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500",
                  )}
                >
                  Historial Total
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredOrders.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-24 text-center text-slate-400"
                  >
                    <Coffee size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold tracking-tight text-lg">
                      {orderView === "today"
                        ? "Aún no hay pedidos hoy."
                        : "No hay historial."}
                    </p>
                  </motion.div>
                )}
                {filteredOrders.map((order) => (
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
            </div>
          </motion.div>
        )}

        {/* TAB: CLIENTES */}
        {activeTab === "customers" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <div className="relative group">
              <input
                placeholder="Buscar por nombre, DNI o celular..."
                className="w-full p-4 pl-12 bg-white rounded-2xl shadow-sm border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors"
                size={20}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* TAB: MENÚ Y STOCK */}
        {activeTab === "menu" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            <button
              onClick={() => {
                setEditingId(null);
                setNewProduct({
                  name: "",
                  description: "",
                  price: "",
                  category: "menu",
                  image_url: "",
                  stock: "",
                  entradas: "",
                  bebidas: "",
                });
                setIsAddOpen(true);
              }}
              className="w-full bg-orange-50 border-2 border-dashed border-orange-200 hover:border-orange-500 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-orange-600 hover:bg-orange-100 transition-all group"
            >
              <div className="bg-white group-hover:bg-orange-600 group-hover:text-white text-orange-500 p-4 rounded-full shadow-sm transition-colors">
                <Plus size={24} strokeWidth={2.5} />
              </div>
              <span className="font-black text-sm tracking-widest uppercase drop-shadow-sm">
                Crear Nuevo Producto
              </span>
            </button>

            {[
              {
                id: "menu",
                title: "Menú Ejecutivo",
                icon: ChefHat,
                color: "bg-orange-500",
              },
              {
                id: "plato",
                title: "Platos a la Carta",
                icon: Soup,
                color: "bg-red-500",
              },
              {
                id: "diet",
                title: "Dietas Saludables",
                icon: Salad,
                color: "bg-green-500",
              },
              {
                id: "adicional",
                title: "Adicionales",
                icon: Coffee,
                color: "bg-yellow-500",
              },
            ].map((section) => {
              const sectionProducts = products.filter(
                (p) => p.category === section.id,
              );
              if (!sectionProducts.length) return null;
              return (
                <div key={section.id}>
                  <div className="flex items-center gap-3 mb-6 pl-1 border-b border-slate-200 pb-3">
                    <div
                      className={cn(
                        "p-2 rounded-xl text-white shadow-sm",
                        section.color,
                      )}
                    >
                      <section.icon size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                      {section.title}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                    {sectionProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onToggleStatus={handleActions.toggleProduct}
                        onDelete={(id: string) =>
                          askConfirmation(
                            "Borrar Producto",
                            "¿Estás seguro de eliminar este ítem permanentemente?",
                            async () => handleActions.deleteProduct(id),
                          )
                        }
                        onEdit={(prod: any) => {
                          setEditingId(prod.id);
                          setNewProduct({
                            name: prod.name,
                            description: prod.description || "",
                            price: prod.price.toString(),
                            category: prod.category,
                            image_url: prod.image_url || "",
                            stock:
                              prod.stock === null ? "" : prod.stock.toString(),
                            entradas: prod.options?.entradas?.join(", ") || "",
                            bebidas: prod.options?.bebidas?.join(", ") || "",
                          });
                          setIsAddOpen(true);
                        }}
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

      {/* --- MODAL CREAR / EDITAR PRODUCTO (CON OPCIONES DINÁMICAS) --- */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 isolate overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl shadow-black/10 ring-1 ring-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                <ChefHat className="text-orange-500" />{" "}
                {editingId ? "Editar Plato" : "Nuevo Plato"}
              </h2>

              <form onSubmit={handleActions.saveProduct} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">
                    Nombre
                  </label>
                  <input
                    required
                    placeholder="Ej: Arroz con Pato"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm font-bold text-slate-900 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">
                      Precio (S/)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm font-black text-slate-900 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">
                      Categoría
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm font-bold text-slate-900 transition-all cursor-pointer"
                    >
                      <option value="menu">Menú Ejecutivo</option>
                      <option value="menu">Menú Ejecutivo</option>
                      <option value="plato">A la Carta</option>
                      <option value="diet">Dieta</option>
                      <option value="adicional">Adicional / Extra</option>{" "}
                      {/* Cambiamos "extra" y borramos "bebida" */}
                    </select>
                  </div>
                </div>

                {/* PANEL DE OPCIONES DINÁMICAS (Solo para Menú y Dietas) */}
                {["menu", "diet"].includes(newProduct.category) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3"
                  >
                    <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5">
                      <SlidersHorizontal size={12} /> Configurar Opciones
                      (Opcional)
                    </h4>
                    <div>
                      <input
                        placeholder="Entradas (ej: Sopa, Ensalada Rusa)"
                        value={newProduct.entradas}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            entradas: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-orange-500"
                      />
                      <p className="text-[9px] text-orange-400/80 mt-1 ml-1">
                        Sepáralas con una coma (,)
                      </p>
                    </div>
                    <div>
                      <input
                        placeholder="Bebidas (ej: Chicha, Maracuyá)"
                        value={newProduct.bebidas}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            bebidas: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-orange-500"
                      />
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1">
                    <Package size={12} className="text-orange-500" /> Límite de
                    Platos
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Dejar vacío si es ilimitado"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm font-bold text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    placeholder="Ingredientes..."
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm font-medium text-slate-700 transition-all resize-none h-16"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">
                    Imagen URL
                  </label>
                  <input
                    placeholder="https://..."
                    value={newProduct.image_url}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        image_url: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-xs font-mono text-slate-500 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 py-4 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-orange-600 text-white rounded-xl font-bold py-4 hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : editingId ? (
                      "Guardar Cambios"
                    ) : (
                      "Crear Plato"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resto de modales (Customer Detail, Confirmation) se mantienen... */}
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

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
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
                      <CheckCircle2 size={14} /> Cliente al día
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
