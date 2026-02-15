"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

// Definimos la estructura esperada para TypeScript
type CartItem = {
  qty: number;
  options?: any;
  product: {
    id: string;
    name: string;
    price: number;
  };
};

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
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

export async function createOrder(prevState: any, formData: FormData) {
  const supabase = await getSupabase();
  const headerStore = await headers();

  const ip = headerStore.get("x-forwarded-for") || "IP Desconocida";
  const userAgent = headerStore.get("user-agent") || "Dispositivo Desconocido";

  const name = formData.get("name") as string;
  const office = formData.get("office") as string;
  const phone = formData.get("phone") as string;
  const dni = formData.get("dni") as string; // <--- DNI OBLIGATORIO
  const opCode = formData.get("operation_code") as string;
  const method = formData.get("payment_method") as string;

  // 1. PARSEO DE DATOS
  const rawItems = formData.get("items") as string;
  const clientItems: CartItem[] = JSON.parse(rawItems);

  // 2. SEGURIDAD: Obtener IDs desde la estructura correcta
  const productIds = clientItems.map((item) => item.product.id);

  // 3. CONSULTA A BASE DE DATOS (Single Source of Truth)
  const { data: dbProducts, error: prodError } = await supabase
    .from("products")
    .select("id, price, name")
    .in("id", productIds);

  if (prodError || !dbProducts) {
    return { success: false, message: "Error al verificar precios." };
  }

  let calculatedTotal = 0;

  // 4. VERIFICACIÓN Y RECONSTRUCCIÓN DE ITEMS
  const verifiedItems = clientItems.map((item) => {
    const realProduct = dbProducts.find((p) => p.id === item.product.id);

    if (!realProduct) {
      throw new Error(`Producto inválido: ${item.product.id}`);
    }

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

  // 5. GESTIÓN DE CLIENTES (LÓGICA ANTI-DUPLICADOS)
  // Primero buscamos por DNI (Identificador Único)
  let { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("dni", dni)
    .single();

  // Si no existe por DNI, buscamos por teléfono como respaldo
  if (!customer) {
     const { data: customerByPhone } = await supabase
        .from("customers")
        .select("*")
        .eq("phone", phone)
        .single();
     
     if (customerByPhone) customer = customerByPhone;
  }

  // Verificación de Lista Negra
  if (customer?.is_blacklisted) {
    return {
      success: false,
      message: "Número con restricciones. Contacte soporte.",
    };
  }

  // Actualizar o Crear Cliente
  if (customer) {
    await supabase
      .from("customers")
      .update({ 
          office: office, 
          full_name: name,
          phone: phone, // Actualizamos teléfono por si cambió
          dni: dni // Aseguramos que el DNI quede guardado
      })
      .eq("id", customer.id);
  } else {
    await supabase
      .from("customers")
      .insert({ 
          phone: phone, 
          full_name: name, 
          office: office,
          dni: dni 
      });
  }

  // 6. ESTADOS DE PAGO
  let paymentStatus = "unpaid";
  if (method === "yape") paymentStatus = "verifying";
  else if (method === "monthly") paymentStatus = "on_account";

  // 7. INSERCIÓN DEL PEDIDO
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: name,
      customer_phone: phone,
      customer_dni: dni, // <--- GUARDAMOS DNI EN EL PEDIDO
      customer_office: office,
      items: verifiedItems,
      total_amount: calculatedTotal,
      payment_method: method,
      payment_status: paymentStatus,
      operation_code: opCode || null,
      is_monthly_account: method === "monthly",
      status: "pending",
      metadata: {
        ip: ip,
        device: userAgent,
        timestamp: new Date().toISOString(),
      },
    })
    .select()
    .single();

  if (error) {
    console.error("Error al guardar pedido:", error);
    return { success: false, message: "Error al procesar. Intenta de nuevo." };
  }

  redirect(`/pedido/${data.id}`);
}

// --- NUEVA FUNCIÓN PARA BUSCAR DNI (Servidor seguro) ---
export async function searchDni(dni: string) {
  try {
    // Usamos el token público. Si falla, compra uno en apis.net.pe (es barato)
    const res = await fetch(`https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`, {
      headers: { Authorization: "Bearer apis-token-1.aT87s56d7s5" }
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null; // Si falla, no rompemos nada, solo devolvemos null
  }
}