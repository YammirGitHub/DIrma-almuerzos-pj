"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import OrderCard from "@/components/admin/OrderCard";
import ProductCard from "@/components/admin/ProductCard"; // NUEVO
import CustomerRow from "@/components/admin/CustomerRow"; // NUEVO
import {
  Bell,
  CheckCircle,
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
} from "lucide-react";

// --- TIPOS ---
type Order = {
  id: string;
  customer_name: string;
  customer_office: string;
  customer_phone: string;
  items: any[];
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  operation_code?: string;
  created_at: string;
  metadata?: { device: string; ip: string };
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveredHistory, setDeliveredHistory] = useState<string[]>([]);
  const [officialCustomers, setOfficialCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSummary | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger" as "danger" | "info",
  });

  const askConfirmation = (
    title: string,
    message: string,
    action: () => void,
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

  useEffect(() => {
    audioRef.current = new Audio(
      "https://cdn.freesound.org/previews/536/536108_1415754-lq.mp3",
    );
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) router.push("/admin");
    };
    checkSession();
    fetchData();

    const channel = supabase
      .channel("admin_realtime_v9")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => handleRealtimeOrder(payload),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => handleRealtimeProduct(payload),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const customersList = useMemo(() => {
    const map = new Map<string, CustomerSummary>();
    orders.forEach((order) => {
      if (!map.has(order.customer_phone)) {
        const officialEntry = officialCustomers.find(
          (c) => c.phone === order.customer_phone,
        );
        const realName = officialEntry
          ? officialEntry.full_name
          : order.customer_name;
        map.set(order.customer_phone, {
          phone: order.customer_phone,
          name: realName,
          office: order.customer_office,
          total_debt: 0,
          total_spent: 0,
          orders_count: 0,
          last_order: order.created_at,
          history: [],
        });
      }
      const customer = map.get(order.customer_phone)!;
      customer.history.push(order);
      customer.orders_count += 1;
      customer.total_spent += order.total_amount;
      if (
        order.payment_status === "on_account" ||
        order.payment_status === "unpaid"
      )
        customer.total_debt += order.total_amount;
      if (new Date(order.created_at) > new Date(customer.last_order)) {
        customer.last_order = order.created_at;
        customer.office = order.customer_office;
      }
    });
    return Array.from(map.values())
      .filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.phone.includes(customerSearch),
      )
      .sort((a, b) => {
        if (b.total_debt !== a.total_debt) return b.total_debt - a.total_debt;
        return (
          new Date(b.last_order).getTime() - new Date(a.last_order).getTime()
        );
      });
  }, [orders, customerSearch, officialCustomers]);

  const fetchData = async () => {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (ordersData) setOrders(ordersData);
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (productsData) setProducts(productsData);
    const { data: customersData } = await supabase
      .from("customers")
      .select("phone, full_name");
    if (customersData) setOfficialCustomers(customersData);
    const { data: historyData } = await supabase
      .from("orders")
      .select("customer_phone")
      .eq("status", "delivered");
    if (historyData)
      setDeliveredHistory(
        Array.from(new Set(historyData.map((o: any) => o.customer_phone))),
      );
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

  const handleManualDebtPayment = async (customerPhone: string) => {
    const pendingOrders = orders.filter(
      (o) =>
        o.customer_phone === customerPhone &&
        (o.payment_status === "on_account" || o.payment_status === "unpaid"),
    );
    const idsToUpdate = pendingOrders.map((o) => o.id);
    await supabase
      .from("orders")
      .update({ payment_status: "paid", payment_method: "cash_collected" })
      .in("id", idsToUpdate);
    setOrders((prev) =>
      prev.map((o) =>
        idsToUpdate.includes(o.id) ? { ...o, payment_status: "paid" } : o,
      ),
    );
    setSelectedCustomer(null);
  };

  const verifyPayment = async (id: string, amount: number) => {
    setOrders(
      orders.map((o) => (o.id === id ? { ...o, payment_status: "paid" } : o)),
    );
    await supabase
      .from("orders")
      .update({ payment_status: "paid" })
      .eq("id", id);
    const audio = new Audio(
      "https://cdn.freesound.org/previews/172/172205_3244838-lq.mp3",
    );
    audio.play().catch(() => {});
  };

  const blockUser = async (phone: string, name: string) => {
    await supabase
      .from("customers")
      .update({ is_blacklisted: true })
      .eq("phone", phone);
  };

  const deleteOrder = async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    await supabase.from("orders").delete().eq("id", id);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await supabase
      .from("products")
      .insert([
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
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, is_available: !currentStatus } : p,
      ),
    );
    await supabase
      .from("products")
      .update({ is_available: !currentStatus })
      .eq("id", id);
    setTogglingId(null);
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    await supabase.from("products").delete().eq("id", id);
  };

  const markOrderDelivered = async (id: string) => {
    setProcessingId(id);
    setOrders(
      orders.map((o) => (o.id === id ? { ...o, status: "delivered" } : o)),
    );
    await supabase.from("orders").update({ status: "delivered" }).eq("id", id);
    setProcessingId(null);
  };

  const renderProductSection = (
    title: string,
    categoryFilter: string,
    icon: any,
    colorClass: string,
  ) => {
    const filteredProducts = products.filter(
      (p) => p.category === categoryFilter,
    );
    if (filteredProducts.length === 0) return null;
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 pl-1">
          <div className={`p-2 rounded-lg ${colorClass} text-white`}>
            {icon}
          </div>
          <h3 className="text-lg font-black text-gray-800">{title}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToggleStatus={toggleProductStatus}
              onDelete={(id) =>
                askConfirmation(
                  "¿Borrar?",
                  "Esta acción es irreversible.",
                  () => handleDeleteProduct(id),
                )
              }
              isToggling={togglingId === product.id}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[#F8F9FA] pb-32 font-sans text-gray-900">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 flex items-center justify-between shadow-sm safe-area-top">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-xl text-white">
            <ChefHat size={20} />
          </div>
          <div>
            <h1 className="font-black text-lg leading-none">D' Irma</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              Admin
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-gray-500 bg-gray-100 rounded-lg"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() =>
              askConfirmation(
                "Salir",
                "¿Cerrar sesión?",
                () => {
                  supabase.auth.signOut();
                  router.push("/admin");
                },
                "info",
              )
            }
            className="p-2 text-red-500 bg-red-50 rounded-lg"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="px-4 mt-4">
        <div className="flex p-1 bg-gray-200/50 rounded-xl">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${activeTab === "orders" ? "bg-white shadow-sm text-orange-600" : "text-gray-500"}`}
          >
            <Bell size={16} /> Pedidos
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${activeTab === "customers" ? "bg-white shadow-sm text-orange-600" : "text-gray-500"}`}
          >
            <Users size={16} /> Clientes
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${activeTab === "menu" ? "bg-white shadow-sm text-orange-600" : "text-gray-500"}`}
          >
            <Utensils size={16} /> Menú
          </button>
        </div>
      </div>

      <div className="px-4 mt-6 max-w-7xl mx-auto">
        {activeTab === "orders" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in">
            {orders.length === 0 && (
              <div className="text-center py-20 text-gray-400 w-full col-span-3">
                Sin pedidos aún
              </div>
            )}
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isTrustedClient={deliveredHistory.includes(
                  order.customer_phone,
                )}
                processingId={processingId}
                onVerifyPayment={() =>
                  askConfirmation(
                    "Confirmar Pago",
                    `¿Recibiste S/ ${order.total_amount.toFixed(2)}?`,
                    () => verifyPayment(order.id, order.total_amount),
                    "info",
                  )
                }
                onMarkDelivered={() => markOrderDelivered(order.id)}
                onBlockUser={() =>
                  askConfirmation("Bloquear", "¿Bloquear usuario?", () =>
                    blockUser(order.customer_phone, order.customer_name),
                  )
                }
                onDeleteOrder={() =>
                  askConfirmation("Eliminar", "Irreversible.", () =>
                    deleteOrder(order.id),
                  )
                }
              />
            ))}
          </div>
        )}

        {activeTab === "customers" && (
          <div className="animate-in fade-in">
            <div className="relative mb-6">
              <input
                placeholder="Buscar cliente..."
                className="w-full p-4 pl-12 bg-white rounded-2xl shadow-sm border border-gray-100 outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-medium"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
            <div className="space-y-3 pb-20">
              {customersList.map((customer) => (
                <CustomerRow
                  key={customer.phone}
                  customer={customer}
                  onClick={() => setSelectedCustomer(customer)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="animate-in fade-in pb-20">
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full bg-orange-50 border-2 border-dashed border-orange-300 p-4 rounded-2xl flex items-center justify-center gap-2 text-orange-700 font-bold mb-6 hover:bg-orange-100 transition-colors"
            >
              <Plus size={20} /> Agregar Nuevo Plato
            </button>
            {renderProductSection(
              "Menú Ejecutivo",
              "menu",
              <ChefHat size={20} />,
              "bg-orange-500",
            )}
            {renderProductSection(
              "Carta",
              "plato",
              <Soup size={20} />,
              "bg-red-500",
            )}
            {renderProductSection(
              "Dietas Saludables",
              "diet",
              <Salad size={20} />,
              "bg-green-500",
            )}
            {renderProductSection(
              "Extras",
              "extra",
              <Coffee size={20} />,
              "bg-yellow-500",
            )}
            {renderProductSection(
              "Bebidas",
              "bebida",
              <GlassWater size={20} />,
              "bg-blue-500",
            )}
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 isolate">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {selectedCustomer.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedCustomer.office} • {selectedCustomer.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div
              className={`p-6 rounded-3xl mb-6 text-center ${selectedCustomer.total_debt > 0 ? "bg-red-50 border border-red-100" : "bg-green-50 border border-green-100"}`}
            >
              <p
                className={`text-xs font-bold uppercase tracking-widest ${selectedCustomer.total_debt > 0 ? "text-red-400" : "text-green-500"}`}
              >
                {selectedCustomer.total_debt > 0
                  ? "Deuda Pendiente"
                  : "Estado de Cuenta"}
              </p>
              <p
                className={`text-4xl font-black mt-1 ${selectedCustomer.total_debt > 0 ? "text-red-600" : "text-green-600"}`}
              >
                S/ {selectedCustomer.total_debt.toFixed(2)}
              </p>
              {selectedCustomer.total_debt > 0 ? (
                <button
                  onClick={() =>
                    askConfirmation(
                      "Cobrar Deuda",
                      "¿Recibiste todo el pago?",
                      () => handleManualDebtPayment(selectedCustomer.phone),
                      "info",
                    )
                  }
                  disabled={isSubmitting}
                  className="mt-4 bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg w-full flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Wallet size={20} /> COBRAR TODO AHORA
                    </>
                  )}
                </button>
              ) : (
                <p className="text-green-600 text-sm font-bold mt-2 flex items-center justify-center gap-1">
                  <CheckCircle size={16} /> Al día
                </p>
              )}
            </div>
            <div className="space-y-3">
              {selectedCustomer.history
                .slice()
                .reverse()
                .map((o) => (
                  <div
                    key={o.id}
                    className="flex justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-400">
                        {new Date(o.created_at).toLocaleDateString()}
                      </p>
                      <p className="font-bold text-sm">
                        {o.items.length} productos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black">
                        S/ {o.total_amount.toFixed(2)}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${o.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {o.payment_status === "paid" ? "Pagado" : "Pendiente"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black mb-4">Nuevo Plato</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input
                required
                placeholder="Nombre"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
              />
              <input
                placeholder="Descripción"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  required
                  placeholder="Precio"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                />
                <select
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                >
                  <option value="menu">Menú</option>
                  <option value="plato">Carta</option>
                  <option value="diet">Dieta</option>
                  <option value="extra">Extra</option>
                  <option value="bebida">Bebida</option>
                </select>
              </div>
              <input
                placeholder="URL Foto"
                value={newProduct.image_url}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image_url: e.target.value })
                }
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-orange-500 text-xs"
              />
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-3 text-gray-500 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-600 text-white rounded-xl font-bold py-3"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
