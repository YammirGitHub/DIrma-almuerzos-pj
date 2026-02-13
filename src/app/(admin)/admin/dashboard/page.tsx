"use client";
import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle,
  MapPin,
  Utensils,
  Plus,
  RefreshCw,
  LogOut,
  X,
  Image as ImageIcon,
  DollarSign,
  AlignLeft,
  Tag,
  Loader2,
  Trash2,
  ChefHat,
  CreditCard,
  CalendarDays,
  Hash,
  Search,
  Coffee,
  Salad,
} from "lucide-react";

// Tipado estricto
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

export default function AdminDashboard() {
  // --- 1. ESTADOS (HOOKS) ---
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Estados de carga UI
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Estados del Modal Eliminar
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Formulario Nuevo Plato
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

  // --- 2. EFECTOS ---
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
    fetchOrders();
    fetchProducts();

    // REAL-TIME
    const channel = supabase
      .channel("admin_dashboard_realtime")
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

  // --- LOGICA REAL-TIME ---
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
    }
  };

  const handleRealtimeProduct = (payload: any) => {
    if (payload.eventType === "INSERT") {
      setProducts((prev) => [payload.new, ...prev]);
    } else if (payload.eventType === "UPDATE") {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === payload.new.id ? { ...p, ...payload.new } : p,
        ),
      );
    } else if (payload.eventType === "DELETE") {
      setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
    }
  };

  // --- FETCHING ---
  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
  };

  // --- HANDLERS PRODUCTOS ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from("products").insert([
      {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        image_url: newProduct.image_url || null,
        is_available: true,
      },
    ]);

    if (error) alert("Error al guardar: " + error.message);
    else {
      setIsAddOpen(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "menu",
        image_url: "",
      });
    }
    setIsSubmitting(false);
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    const newStatus = !currentStatus;
    // Optimistic
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, is_available: newStatus } : p,
      ),
    );
    // DB
    const { error } = await supabase
      .from("products")
      .update({ is_available: newStatus })
      .eq("id", id);

    if (error) {
      alert("Error actualizando stock.");
      // Rollback
      setProducts(
        products.map((p) =>
          p.id === id ? { ...p, is_available: currentStatus } : p,
        ),
      );
    }
    setTogglingId(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este plato?")) return;
    const prevProducts = [...products];
    setProducts(products.filter((p) => p.id !== id));

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("Error al eliminar: " + error.message);
      setProducts(prevProducts);
    }
  };

  // --- HANDLERS PEDIDOS ---
  const markOrderDelivered = async (id: string) => {
    setProcessingId(id);
    const prevOrders = [...orders];
    setOrders(
      orders.map((o) => (o.id === id ? { ...o, status: "delivered" } : o)),
    );
    const { error } = await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Error al despachar: " + error.message);
      setOrders(prevOrders);
    }
    setProcessingId(null);
  };

  // --- HANDLERS ELIMINAR PEDIDO ---
  const confirmDeleteOrder = (id: string) => {
    setOrderToDelete(id);
    setIsDeleteOpen(true);
  };

  const executeDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsSubmitting(true);
    const prevOrders = [...orders];
    setOrders(orders.filter((o) => o.id !== orderToDelete));
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderToDelete);

    if (error) {
      alert("Error al eliminar: " + error.message);
      setOrders(prevOrders);
    }
    setIsSubmitting(false);
    setIsDeleteOpen(false);
    setOrderToDelete(null);
  };

  const handleLogout = async () => {
    if (!window.confirm("¿Cerrar sesión?")) return;
    await supabase.auth.signOut();
    router.push("/admin");
  };

  // --- HELPER PARA FILTRAR CATEGORÍAS ---
  const renderProductSection = (
    title: string,
    categoryFilter: string,
    icon: any,
  ) => {
    const filteredProducts = products.filter(
      (p) => p.category === categoryFilter,
    );
    if (filteredProducts.length === 0) return null;

    return (
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4 pl-1">
          <div className="bg-white p-2 rounded-lg text-gray-400 shadow-sm border border-gray-100">
            {icon}
          </div>
          <h3 className="text-xl font-black text-gray-800 tracking-tight">
            {title}
          </h3>
          <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-full">
            {filteredProducts.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 transition-all duration-300 hover:shadow-lg ${
                !product.is_available ? "opacity-60 bg-gray-50" : ""
              }`}
            >
              {/* Imagen del Producto */}
              <div className="relative w-24 h-24 shrink-0 bg-gray-100 rounded-2xl overflow-hidden shadow-inner group">
                <img
                  src={
                    product.image_url ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                  }
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    !product.is_available
                      ? "grayscale"
                      : "group-hover:scale-110"
                  }`}
                />
                {!product.is_available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <span className="text-[9px] font-black text-white bg-black/50 px-2 py-1 rounded uppercase tracking-widest border border-white/20">
                      Agotado
                    </span>
                  </div>
                )}
              </div>

              {/* Info del Producto */}
              <div className="flex-1 min-w-0 py-1 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3
                      className={`font-bold text-base text-gray-900 leading-tight truncate pr-2 ${!product.is_available && "line-through text-gray-400"}`}
                    >
                      {product.name}
                    </h3>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-gray-300 hover:text-red-500 p-1.5 -mr-1.5 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-lg font-black text-gray-900 mt-0.5">
                    S/ {product.price}
                  </p>
                </div>

                <div className="flex items-end justify-between mt-2">
                  <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg uppercase font-bold tracking-wider border border-gray-200">
                    {product.category}
                  </span>

                  {/* Switch */}
                  <button
                    onClick={() =>
                      toggleProductStatus(product.id, product.is_available)
                    }
                    disabled={togglingId === product.id}
                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none shadow-inner ${
                      product.is_available ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                        product.is_available ? "translate-x-5" : "translate-x-0"
                      }`}
                    >
                      {togglingId === product.id ? (
                        <Loader2
                          size={10}
                          className="animate-spin text-gray-400"
                        />
                      ) : product.is_available ? (
                        <CheckCircle size={10} className="text-green-500" />
                      ) : (
                        <X size={10} className="text-gray-400" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 font-sans text-gray-900 selection:bg-orange-100 selection:text-orange-900">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2.5 rounded-xl text-white shadow-lg shadow-orange-600/30">
            <ChefHat size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-gray-900 leading-none">
              D' Irma
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Admin
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-3 text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        <div className="flex p-1.5 bg-gray-200/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 max-w-md mx-auto sm:mx-0 relative">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all relative z-10 ${activeTab === "orders" ? "bg-white text-gray-900 shadow-md" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Bell
              size={18}
              className={activeTab === "orders" ? "text-orange-500" : ""}
            />
            Pedidos
            {orders.filter((o) => o.status !== "delivered").length > 0 && (
              <span className="bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black shadow-sm ml-1">
                {orders.filter((o) => o.status !== "delivered").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all relative z-10 ${activeTab === "menu" ? "bg-white text-gray-900 shadow-md" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Utensils
              size={18}
              className={activeTab === "menu" ? "text-orange-500" : ""}
            />
            Menú
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        {/* === VISTA PEDIDOS === */}
        {activeTab === "orders" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {orders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 opacity-50">
                <div className="bg-white p-6 rounded-full mb-4 shadow-sm border border-gray-100">
                  <Bell size={48} className="text-gray-300" />
                </div>
                <p className="font-bold text-gray-500 text-xl">
                  Sin pedidos pendientes
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`relative bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between transition-all hover:shadow-xl ${order.status === "delivered" ? "opacity-60 grayscale bg-gray-50/50" : ""}`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.status === "delivered" ? "bg-green-500" : "bg-orange-500"}`}
                  ></div>

                  <div className="pl-3">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black text-xl text-gray-900 leading-none">
                          {order.customer_name}
                        </h3>
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-bold bg-gray-50 w-fit px-2 py-1 rounded-lg">
                            <MapPin size={14} className="text-orange-500" />
                            {order.customer_office}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono pl-1">
                            <Search size={10} />
                            {order.customer_phone}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100 uppercase tracking-wide">
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteOrder(order.id);
                          }}
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                          title="Eliminar pedido"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                      {order.items.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="flex gap-3 text-sm items-start border-b border-dashed border-gray-100 pb-2 last:border-0"
                        >
                          <span className="font-black text-xs bg-gray-900 text-white px-2 py-1 rounded-md min-w-[28px] text-center shadow-sm">
                            {item.qty}x
                          </span>
                          <div className="flex flex-col">
                            <span className="text-gray-800 font-bold leading-tight pt-0.5">
                              {item.name}
                            </span>
                            {item.options && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {item.options.entrada && (
                                  <span className="text-[9px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-100 font-medium">
                                    {item.options.entrada}
                                  </span>
                                )}
                                {item.options.bebida && (
                                  <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                                    {item.options.bebida}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pl-3 mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          Total
                        </span>
                        <div className="text-2xl font-black text-gray-900 leading-none mt-0.5">
                          S/ {order.total_amount.toFixed(2)}
                        </div>
                      </div>

                      {order.payment_method === "yape" ? (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                            <CreditCard
                              size={14}
                              className="fill-purple-700/20"
                            />
                            <span className="text-[10px] font-black uppercase tracking-wide">
                              YAPE
                            </span>
                          </div>
                          {order.operation_code ? (
                            <span className="text-[10px] font-mono text-purple-500 mt-1 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-purple-100">
                              <Hash size={10} /> {order.operation_code}
                            </span>
                          ) : (
                            <span className="text-[10px] text-red-400 font-bold mt-1 animate-pulse">
                              Sin código ⚠️
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                            <CalendarDays
                              size={14}
                              className="fill-blue-700/20"
                            />
                            <span className="text-[10px] font-black uppercase tracking-wide">
                              CUENTA
                            </span>
                          </div>
                          <span className="text-[10px] text-blue-400 mt-1 font-medium">
                            Fin de Mes
                          </span>
                        </div>
                      )}
                    </div>

                    {order.status !== "delivered" ? (
                      <button
                        onClick={() => markOrderDelivered(order.id)}
                        disabled={processingId === order.id}
                        className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-orange-200 hover:bg-orange-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {processingId === order.id ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <>
                            <CheckCircle size={20} /> DESPACHAR PEDIDO
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="w-full bg-green-50 text-green-700 py-3.5 rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-2 border border-green-100 cursor-not-allowed opacity-80">
                        <CheckCircle size={16} className="fill-green-200" />{" "}
                        Entregado
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === VISTA MENÚ (SEPARADA POR CATEGORÍAS) === */}
        {activeTab === "menu" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* BOTÓN GRANDE PARA AGREGAR */}
            <div className="mb-8">
              <button
                onClick={() => setIsAddOpen(true)}
                className="w-full md:w-auto md:min-w-[300px] group bg-orange-50 border-2 border-dashed border-orange-300 rounded-[2rem] p-6 flex items-center justify-center gap-4 hover:bg-orange-100 hover:border-orange-500 transition-all active:scale-95"
              >
                <div className="bg-white p-3 rounded-full text-orange-600 shadow-md group-hover:scale-110 transition-transform">
                  <Plus size={24} strokeWidth={3} />
                </div>
                <div className="text-left">
                  <span className="block font-black text-orange-900 text-lg leading-none">
                    Agregar Nuevo Plato
                  </span>
                  <span className="text-xs text-orange-600 font-medium">
                    Actualiza tu carta del día
                  </span>
                </div>
              </button>
            </div>

            {/* SECCIÓN 1: MENÚ EJECUTIVO (PLATOS DE FONDO) */}
            {renderProductSection(
              "Platos de Fondo",
              "menu",
              <ChefHat size={20} />,
            )}

            {/* SECCIÓN 2: DIETAS */}
            {renderProductSection("Dietas", "diet", <Salad size={20} />)}

            {/* SECCIÓN 3: EXTRAS Y BEBIDAS */}
            {renderProductSection(
              "Extras y Bebidas",
              "extra",
              <Coffee size={20} />,
            )}

            {/* MENSAJE SI NO HAY NADA */}
            {products.length === 0 && (
              <div className="text-center py-20 opacity-50">
                <p className="text-xl font-bold text-gray-400">
                  La carta está vacía.
                </p>
                <p className="text-sm text-gray-300">
                  Agrega platos para empezar a vender.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL AGREGAR PLATO */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-opacity animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                Nuevo Plato
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Nombre
                </label>
                <input
                  required
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full pl-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl font-bold text-gray-900 outline-none transition-all text-lg"
                  placeholder="Ej: Seco de Cabrito"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Ingredientes
                </label>
                <input
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full pl-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl font-medium text-gray-900 outline-none transition-all"
                  placeholder="Con frejoles y arroz..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Precio
                  </label>
                  <input
                    required
                    type="number"
                    step="0.10"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    className="w-full pl-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl font-bold text-gray-900 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Categoría
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className="w-full pl-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl font-bold text-gray-900 outline-none cursor-pointer"
                  >
                    <option value="menu">Menú (Plato de Fondo)</option>
                    <option value="diet">Dieta</option>
                    <option value="extra">Extra / Bebida</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Foto URL
                </label>
                <input
                  value={newProduct.image_url}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, image_url: e.target.value })
                  }
                  className="w-full pl-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl font-medium text-gray-900 outline-none transition-all text-sm"
                  placeholder="https://..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-200 mt-4 hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Plus size={24} strokeWidth={3} /> GUARDAR PLATO
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN DE ELIMINACIÓN */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 isolate">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsDeleteOpen(false)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl ring-1 ring-black/5 flex flex-col items-center text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="mb-5 relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20"></div>
              <div className="relative bg-red-50 text-red-500 w-20 h-20 rounded-full flex items-center justify-center shadow-inner">
                <Trash2 size={32} strokeWidth={2} className="drop-shadow-sm" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
              ¿Eliminar Pedido?
            </h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed px-4 mb-8">
              Estás a punto de borrar este pedido de forma permanente. <br />
              <span className="text-red-500 font-bold">
                Esta acción no se puede deshacer.
              </span>
            </p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="w-full py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={executeDeleteOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl font-bold text-white bg-red-500 shadow-lg shadow-red-200 hover:bg-red-600 hover:shadow-red-300 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
