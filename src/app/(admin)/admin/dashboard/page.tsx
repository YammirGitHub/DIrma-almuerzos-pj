"use client";
import { useState, useEffect } from "react";
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
  Search,
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "menu",
    image_url: "",
  });

  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleLogout = async () => {
    if (!window.confirm("¿Cerrar sesión de cocina?")) return;
    await supabase.auth.signOut();
    router.push("/admin");
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) router.push("/admin");
    };
    checkSession();
    fetchOrders();
    fetchProducts();

    const channel = supabase
      .channel("orders_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) => [payload.new, ...prev]);
          new Audio(
            "https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3",
          )
            .play()
            .catch(() => {});
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          image_url: newProduct.image_url || null,
          is_available: true,
        },
      ])
      .select()
      .single();

    if (error) alert("Error: " + error.message);
    else {
      setProducts([data, ...products]);
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
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, is_available: !currentStatus } : p,
      ),
    );
    await supabase
      .from("products")
      .update({ is_available: !currentStatus })
      .eq("id", id);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Borrar este plato?")) return;
    setProducts(products.filter((p) => p.id !== id));
    await supabase.from("products").delete().eq("id", id);
  };

  const markOrderDelivered = async (id: string) => {
    setOrders(
      orders.map((o) => (o.id === id ? { ...o, status: "delivered" } : o)),
    );
    await supabase.from("orders").update({ status: "delivered" }).eq("id", id);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 font-sans text-gray-900">
      {/* --- BARRA SUPERIOR (Sticky & Clean) --- */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
        {/* Marca */}
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-xl text-white shadow-md shadow-orange-200">
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

        {/* Botones de Acción */}
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
            title="Actualizar"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95"
            title="Salir"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* --- TABS DE NAVEGACIÓN (Grandes y Claros) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === "orders"
                ? "bg-orange-500 text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Bell
              size={18}
              className={activeTab === "orders" ? "fill-white" : ""}
            />
            Pedidos
            {orders.filter((o) => o.status !== "delivered").length > 0 && (
              <span className="bg-white text-orange-600 text-xs px-2 py-0.5 rounded-full font-black shadow-sm">
                {orders.filter((o) => o.status !== "delivered").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === "menu"
                ? "bg-orange-500 text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Utensils
              size={18}
              className={activeTab === "menu" ? "fill-white" : ""}
            />
            Menú
          </button>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        {/* VISTA PEDIDOS */}
        {activeTab === "orders" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {orders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 opacity-50">
                <div className="bg-gray-200 p-6 rounded-full mb-4 text-gray-400">
                  <Bell size={48} />
                </div>
                <p className="font-bold text-gray-500 text-xl">
                  Sin pedidos pendientes
                </p>
                <p className="text-gray-400">La cocina está tranquila 🧘‍♂️</p>
              </div>
            )}

            {/* GRID RESPONSIVO: 1 col en Móvil, 2 en Tablet, 3 en PC */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between transition-all hover:shadow-lg ${order.status === "delivered" ? "opacity-60 grayscale bg-gray-50" : "border-l-4 border-l-orange-500"}`}
                >
                  {/* Cabecera Pedido */}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black text-xl text-gray-900 leading-tight">
                          {order.customer_name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mt-1">
                          <div className="bg-orange-50 p-1 rounded text-orange-600">
                            <MapPin size={14} />
                          </div>
                          {order.customer_office}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Lista de Items (Scrollable si es muy larga) */}
                    <div className="space-y-3 mb-6 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                      {order.items.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="flex gap-3 text-sm items-start border-b border-dashed border-gray-100 pb-2 last:border-0"
                        >
                          <span className="font-bold text-xs bg-gray-900 text-white px-2 py-1 rounded-md min-w-[28px] text-center shadow-sm">
                            {item.qty}x
                          </span>
                          <span className="text-gray-700 font-medium leading-tight pt-0.5">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Totales y Botón */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Total
                        </span>
                        <span className="text-2xl font-black text-gray-900">
                          S/ {order.total_amount}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-2 border bg-white ${order.payment_method === "yape" ? "text-purple-600 border-purple-100" : "text-green-600 border-green-100"}`}
                      >
                        {order.payment_method === "yape"
                          ? "📱 Yape"
                          : "💵 Efectivo"}
                      </div>
                    </div>

                    {order.status !== "delivered" ? (
                      <button
                        onClick={() => markOrderDelivered(order.id)}
                        className="w-full bg-[#10B981] text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-green-100 hover:bg-[#059669]"
                      >
                        <CheckCircle size={20} /> MARCAR ENTREGADO
                      </button>
                    ) : (
                      <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 border border-gray-200">
                        <CheckCircle size={16} /> Pedido Completado
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA MENÚ */}
        {activeTab === "menu" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* GRID RESPONSIVO PARA EL MENÚ */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* TARJETA ESPECIAL: AGREGAR NUEVO (Siempre primera) */}
              <button
                onClick={() => setIsAddOpen(true)}
                className="group min-h-[160px] border-2 border-dashed border-orange-300 bg-orange-50/50 rounded-[20px] flex flex-col items-center justify-center gap-3 hover:bg-orange-50 hover:border-orange-500 transition-all active:scale-95"
              >
                <div className="bg-orange-100 p-4 rounded-full text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-sm">
                  <Plus size={32} />
                </div>
                <span className="font-bold text-orange-800 text-lg">
                  Agregar Plato
                </span>
              </button>

              {products.map((product) => (
                <div
                  key={product.id}
                  className={`bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-md ${!product.is_available && "opacity-60 bg-gray-50"}`}
                >
                  {/* Imagen Grande */}
                  <div className="relative w-24 h-24 shrink-0 bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
                    <img
                      src={
                        product.image_url ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                      }
                      alt={product.name}
                      className={`w-full h-full object-cover ${!product.is_available && "grayscale"}`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start">
                      <h3
                        className={`font-bold text-lg text-gray-900 leading-tight truncate pr-2 ${!product.is_available && "line-through text-gray-400"}`}
                      >
                        {product.name}
                      </h3>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-gray-300 hover:text-red-500 p-2 -mr-2 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="text-lg font-black text-gray-900 mt-1">
                      S/ {product.price}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg uppercase font-bold tracking-wider">
                        {product.category}
                      </span>

                      {/* Switch Toggle (Grande) */}
                      <button
                        onClick={() =>
                          toggleProductStatus(product.id, product.is_available)
                        }
                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative shadow-inner ${product.is_available ? "bg-green-500" : "bg-gray-300"}`}
                      >
                        <div
                          className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${product.is_available ? "translate-x-6" : "translate-x-0"}`}
                        ></div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL AGREGAR (Moderno y Centrado) --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Nuevo Plato
                </h2>
                <p className="text-sm text-gray-400">
                  Completa los detalles del menú
                </p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Nombre del Plato
                </label>
                <div className="relative group">
                  <Utensils
                    className="absolute left-4 top-4 text-gray-400 group-focus-within:text-orange-500 transition-colors"
                    size={20}
                  />
                  <input
                    required
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    placeholder="Ej: Arroz con Pato"
                    className="w-full pl-12 p-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl font-bold text-gray-900 outline-none transition-all text-lg placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Ingredientes
                </label>
                <div className="relative group">
                  <AlignLeft
                    className="absolute left-4 top-4 text-gray-400 group-focus-within:text-orange-500 transition-colors"
                    size={20}
                  />
                  <input
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    placeholder="Arroz + Pato + Sarsa"
                    className="w-full pl-12 p-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl font-medium text-gray-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Precio
                  </label>
                  <div className="relative group">
                    <DollarSign
                      className="absolute left-4 top-4 text-gray-400 group-focus-within:text-orange-500 transition-colors"
                      size={20}
                    />
                    <input
                      required
                      type="number"
                      step="0.10"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      placeholder="0.00"
                      className="w-full pl-12 p-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl font-bold text-gray-900 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Categoría
                  </label>
                  <div className="relative group">
                    <Tag
                      className="absolute left-4 top-4 text-gray-400 group-focus-within:text-orange-500 transition-colors"
                      size={20}
                    />
                    <select
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          category: e.target.value,
                        })
                      }
                      className="w-full pl-12 p-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl font-bold text-gray-900 outline-none appearance-none cursor-pointer"
                    >
                      <option value="menu">Menú</option>
                      <option value="diet">Dieta</option>
                      <option value="extra">Extra</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Foto URL
                </label>
                <div className="relative">
                  <ImageIcon
                    className="absolute left-4 top-4 text-gray-400"
                    size={18}
                  />
                  <input
                    value={newProduct.image_url}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        image_url: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full pl-12 p-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl font-medium text-gray-900 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-200 flex items-center justify-center gap-3 mt-4 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Plus size={24} /> GUARDAR PLATO
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
