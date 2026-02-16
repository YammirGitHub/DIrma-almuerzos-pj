"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

// --- TIPOS ---
type CartItem = {
  qty: number;
  options?: any;
  product: { id: string; name: string; price: number };
};

// --- SUPABASE CLIENT ---
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}

// --- CREATE ORDER ---
export async function createOrder(prevState: any, formData: FormData) {
  const supabase = await getSupabase();
  const headerStore = await headers();

  const ip = headerStore.get("x-forwarded-for") || "IP Desconocida";
  const userAgent = headerStore.get("user-agent") || "Dispositivo Desconocido";

  const name = formData.get("name") as string;
  const office = formData.get("office") as string;
  const phone = formData.get("phone") as string;
  const dni = formData.get("dni") as string; 
  const opCode = formData.get("operation_code") as string;
  const method = formData.get("payment_method") as string;

  const rawItems = formData.get("items") as string;
  const clientItems: CartItem[] = JSON.parse(rawItems);
  const productIds = clientItems.map((item) => item.product.id);

  const { data: dbProducts, error: prodError } = await supabase
    .from("products")
    .select("id, price, name")
    .in("id", productIds);

  if (prodError || !dbProducts) {
    return { success: false, message: "Error al verificar precios." };
  }

  let calculatedTotal = 0;

  const verifiedItems = clientItems.map((item) => {
    const realProduct = dbProducts.find((p) => p.id === item.product.id);
    if (!realProduct) throw new Error(`Producto inválido: ${item.product.id}`);
    const realPrice = realProduct.price;
    calculatedTotal += realPrice * item.qty;
    return {
      qty: item.qty,
      options: item.options,
      price: realPrice,
      name: realProduct.name,
      id: realProduct.id,
    };
  });

  // GESTIÓN DE CLIENTES
  let { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("dni", dni)
    .single();

  if (!customer) {
     const { data: customerByPhone } = await supabase
        .from("customers")
        .select("*")
        .eq("phone", phone)
        .single();
     if (customerByPhone) customer = customerByPhone;
  }

  if (customer?.is_blacklisted) {
    return { success: false, message: "Número con restricciones. Contacte soporte." };
  }

  if (customer) {
    await supabase.from("customers").update({ office, full_name: name, phone, dni }).eq("id", customer.id);
  } else {
    await supabase.from("customers").insert({ phone, full_name: name, office, dni });
  }

  let paymentStatus = "unpaid";
  if (method === "yape") paymentStatus = "verifying";
  else if (method === "monthly") paymentStatus = "on_account";

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: name,
      customer_phone: phone,
      customer_dni: dni,
      customer_office: office,
      items: verifiedItems,
      total_amount: calculatedTotal,
      payment_method: method,
      payment_status: paymentStatus,
      operation_code: opCode || null,
      is_monthly_account: method === "monthly",
      status: "pending",
      metadata: { ip, device: userAgent, timestamp: new Date().toISOString() },
    })
    .select()
    .single();

  if (error) {
    console.error("Error al guardar pedido:", error);
    return { success: false, message: "Error al procesar. Intenta de nuevo." };
  }

  redirect(`/pedido/${data.id}`);
}


// --- FUNCIÓN BÚSQUEDA DNI: CACHE INDESTRUCTIBLE ---
export async function searchDni(dni: string) {
  const supabase = await getSupabase();

  try {
    // 1. PRIMERO: Buscamos en tu CAJA FUERTE (dni_cache)
    // Esta tabla NO se borra aunque borres clientes. Es tu "memoria eterna".
    console.log(`🔍 Consultando Cache Permanente para: ${dni}...`);
    
    const { data: cachedData } = await supabase
      .from("dni_cache")
      .select("*")
      .eq("dni", dni)
      .maybeSingle();

    if (cachedData) {
      console.log("💎 ¡DNI encontrado en Cache! Costo: S/ 0.00");
      return { 
        nombres: cachedData.nombres, 
        apellidoPaterno: cachedData.apellido_paterno, 
        apellidoMaterno: cachedData.apellido_materno 
      };
    }

    // 2. SEGUNDO: Si no existe, pagamos el crédito a Decolecta
    console.log("🌐 DNI nuevo. Consultando API externa...");
    const token = "sk_13346.2NoJq2xmBIBPOoGV96ZBVz7qlm8lmRuj"; 
    
    const res = await fetch(`https://api.decolecta.com/v1/reniec/dni?numero=${dni}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
        console.error("❌ Error API:", await res.text());
        return null;
    }

    const data = await res.json();
    
    // Normalizamos los datos (Manejando inglés/español de la API)
    const nombres = data.nombres || data.first_name;
    const pat = data.apellidoPaterno || data.first_last_name || data.apellido_paterno;
    const mat = data.apellidoMaterno || data.second_last_name || data.apellido_materno;

    // 3. TERCERO: ¡GUARDADO AUTOMÁTICO EN CAJA FUERTE!
    // Esto ocurre AHORA MISMO, no hay que esperar a que compre.
    // Si el usuario cierra la web sin comprar, IGUAL ya te guardaste el dato.
    const { error: saveError } = await supabase
      .from("dni_cache")
      .insert({
        dni: dni,
        nombres: nombres,
        apellido_paterno: pat,
        apellido_materno: mat
      });

    if (!saveError) {
        console.log("💾 ¡DNI guardado para siempre en dni_cache!");
    } else {
        console.error("⚠️ Error guardando en cache:", saveError);
    }

    return {
      nombres: nombres,
      apellidoPaterno: pat,
      apellidoMaterno: mat
    };

  } catch (e) {
    console.error("🔥 Error crítico:", e);
    return null;
  }
}