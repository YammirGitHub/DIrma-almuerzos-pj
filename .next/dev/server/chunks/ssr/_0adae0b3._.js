module.exports = [
"[project]/src/app/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"6061af35b7effceb1b03519a0f5b0411506813e76e":"createOrder"},"",""] */ __turbopack_context__.s([
    "createOrder",
    ()=>createOrder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)"); // IMPORTAR HEADERS
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
async function getSupabase() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://qmpymxajjxlfnlfybaqt.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtcHlteGFqanhsZm5sZnliYXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTI4NjIsImV4cCI6MjA4NjI2ODg2Mn0.Oo4KnFI-Y6xkeI2xbEQ8zQBE7y63ZaztwbQvbU7bgiE"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {}
            }
        }
    });
}
async function createOrder(prevState, formData) {
    const supabase = await getSupabase();
    const headerStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])();
    // 1. Datos del Cliente y Dispositivo
    const ip = headerStore.get("x-forwarded-for") || "IP Desconocida";
    const userAgent = headerStore.get("user-agent") || "Dispositivo Desconocido";
    const name = formData.get("name");
    const office = formData.get("office");
    const phone = formData.get("phone");
    const opCode = formData.get("operation_code");
    const method = formData.get("payment_method");
    // 2. SEGURIDAD DE PRECIOS (CRÍTICO)
    const rawItems = formData.get("items");
    const clientItems = JSON.parse(rawItems); // Items que envía el cliente
    // Extraemos los IDs de los productos que pide el cliente
    const productIds = clientItems.map((item)=>item.product.id);
    // Consultamos a la BD los precios REALES de esos IDs
    const { data: dbProducts, error: prodError } = await supabase.from("products").select("id, price, name").in("id", productIds);
    if (prodError || !dbProducts) {
        return {
            success: false,
            message: "Error al verificar precios."
        };
    }
    // Recalculamos el total nosotros mismos
    let calculatedTotal = 0;
    // Reconstruimos los items con el precio real de la BD
    const verifiedItems = clientItems.map((item)=>{
        const realProduct = dbProducts.find((p)=>p.id === item.product.id);
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
                price: realPrice,
                name: realProduct.name
            },
            price: realPrice
        };
    });
    // 3. SEGURIDAD: VERIFICAR LISTA NEGRA
    const { data: customer } = await supabase.from("customers").select("is_blacklisted").eq("phone", phone).single();
    if (customer?.is_blacklisted) {
        return {
            success: false,
            message: "Número con restricciones. Contacte soporte."
        };
    }
    // 4. ACTUALIZAR O CREAR CLIENTE (Lógica inteligente que te di antes)
    if (customer) {
        await supabase.from("customers").update({
            office: office
        }).eq("phone", phone);
    } else {
        await supabase.from("customers").insert({
            phone: phone,
            full_name: name,
            office: office
        });
    }
    // 5. ESTADO DEL PAGO
    let paymentStatus = "unpaid";
    if (method === "yape") paymentStatus = "verifying";
    else if (method === "monthly") paymentStatus = "on_account";
    // 6. GUARDAR PEDIDO (Usando calculatedTotal y verifiedItems)
    const { data, error } = await supabase.from("orders").insert({
        customer_name: name,
        customer_phone: phone,
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
            timestamp: new Date().toISOString()
        }
    }).select().single();
    if (error) {
        console.error("Error:", error);
        return {
            success: false,
            message: "Error al procesar. Intenta de nuevo."
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/pedido/${data.id}`);
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createOrder
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createOrder, "6061af35b7effceb1b03519a0f5b0411506813e76e", null);
}),
"[project]/.next-internal/server/app/(client)/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/(client)/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "6061af35b7effceb1b03519a0f5b0411506813e76e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createOrder"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$client$292f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/(client)/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_0adae0b3._.js.map