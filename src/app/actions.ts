"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers"; // IMPORTAR HEADERS
import { redirect } from "next/navigation";

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

  // 1. Datos del Cliente y Dispositivo
  const ip = headerStore.get("x-forwarded-for") || "IP Desconocida";
  const userAgent = headerStore.get("user-agent") || "Dispositivo Desconocido";

  const name = formData.get("name") as string;
  const office = formData.get("office") as string;
  const phone = formData.get("phone") as string;
  const opCode = formData.get("operation_code") as string;
  const method = formData.get("payment_method") as string;

  // 2. SEGURIDAD DE PRECIOS (CRÍTICO)
  const rawItems = formData.get("items") as string;
  const clientItems = JSON.parse(rawItems); // Items que envía el cliente

  // Extraemos los IDs de los productos que pide el cliente
  const productIds = clientItems.map((item: any) => item.product.id);

  // Consultamos a la BD los precios REALES de esos IDs
  const { data: dbProducts, error: prodError } = await supabase
    .from("products")
    .select("id, price, name")
    .in("id", productIds);

  if (prodError || !dbProducts) {
    return { success: false, message: "Error al verificar precios." };
  }

  // Recalculamos el total nosotros mismos
  let calculatedTotal = 0;

  // Reconstruimos los items con el precio real de la BD
  const verifiedItems = clientItems.map((item: any) => {
    const realProduct = dbProducts.find((p) => p.id === item.product.id);

    if (!realProduct) {
      // Si alguien intenta pedir un producto que no existe, ignoramos o lanzamos error
      throw new Error(`Producto inválido: ${item.product.id}`);
    }

    // Usamos el precio de la BD, no el del JSON
    const realPrice = realProduct.price;
    calculatedTotal += realPrice * item.qty;

    return {
      ...item,
      product: {
        ...item.product,
        price: realPrice, // Forzamos el precio real
        name: realProduct.name,
      },
      price: realPrice, // Guardamos el precio unitario histórico
    };
  });

  // 3. SEGURIDAD: VERIFICAR LISTA NEGRA
  const { data: customer } = await supabase
    .from("customers")
    .select("is_blacklisted")
    .eq("phone", phone)
    .single();

  if (customer?.is_blacklisted) {
    return {
      success: false,
      message: "Número con restricciones. Contacte soporte.",
    };
  }

  // 4. ACTUALIZAR O CREAR CLIENTE (Lógica inteligente que te di antes)
  if (customer) {
    await supabase
      .from("customers")
      .update({ office: office })
      .eq("phone", phone);
  } else {
    await supabase
      .from("customers")
      .insert({ phone: phone, full_name: name, office: office });
  }

  // 5. ESTADO DEL PAGO
  let paymentStatus = "unpaid";
  if (method === "yape") paymentStatus = "verifying";
  else if (method === "monthly") paymentStatus = "on_account";

  // 6. GUARDAR PEDIDO (Usando calculatedTotal y verifiedItems)
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: name,
      customer_phone: phone,
      customer_office: office,
      items: verifiedItems, // <--- ITEMS VERIFICADOS
      total_amount: calculatedTotal, // <--- TOTAL CALCULADO POR EL SERVIDOR
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
    console.error("Error:", error);
    return { success: false, message: "Error al procesar. Intenta de nuevo." };
  }

  redirect(`/pedido/${data.id}`);
}
