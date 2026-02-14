module.exports = [
"[project]/src/app/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"602c3fb93d90a5fd8d2b3195e79f5a497220943f33":"createOrder"},"",""] */ __turbopack_context__.s([
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
    // --- 1. CAPTURAR HUELLA DIGITAL (SEGURIDAD) ---
    // Esto nos dice desde qué IP y qué celular (iPhone, Android, etc.) se hizo el pedido
    const ip = headerStore.get('x-forwarded-for') || 'IP Desconocida';
    const userAgent = headerStore.get('user-agent') || 'Dispositivo Desconocido';
    // EXTRAER DATOS DEL FORM
    const rawItems = formData.get('items');
    const items = JSON.parse(rawItems);
    const total = parseFloat(formData.get('total'));
    const method = formData.get('payment_method');
    const name = formData.get('name');
    const office = formData.get('office');
    const phone = formData.get('phone');
    const opCode = formData.get('operation_code');
    // 2. SEGURIDAD: VERIFICAR SI ESTÁ EN LISTA NEGRA
    const { data: customer } = await supabase.from('customers').select('is_blacklisted').eq('phone', phone).single();
    // SI ESTÁ BLOQUEADO, RECHAZAMOS EL PEDIDO AL INSTANTE
    if (customer?.is_blacklisted) {
        return {
            success: false,
            message: 'Lo sentimos, este número tiene restricciones administrativas. Contacte con soporte.'
        };
    }
    // 3. ACTUALIZAR O CREAR CLIENTE
    await supabase.from('customers').upsert({
        phone: phone,
        full_name: name,
        office: office
    }, {
        onConflict: 'phone'
    });
    // 4. ESTADO DEL PAGO
    let paymentStatus = 'unpaid';
    if (method === 'yape') paymentStatus = 'verifying';
    else if (method === 'monthly') paymentStatus = 'on_account';
    // 5. GUARDAR PEDIDO CON LA EVIDENCIA
    const { data, error } = await supabase.from('orders').insert({
        customer_name: name,
        customer_phone: phone,
        customer_office: office,
        items: items,
        total_amount: total,
        payment_method: method,
        payment_status: paymentStatus,
        operation_code: opCode || null,
        is_monthly_account: method === 'monthly',
        status: 'pending',
        // AQUÍ GUARDAMOS LA EVIDENCIA OCULTA
        metadata: {
            ip: ip,
            device: userAgent,
            timestamp: new Date().toISOString()
        }
    }).select().single();
    if (error) {
        console.error('Error:', error);
        return {
            success: false,
            message: 'Error al procesar. Intenta de nuevo.'
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/pedido/${data.id}`); // Redirige a la boleta
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createOrder
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createOrder, "602c3fb93d90a5fd8d2b3195e79f5a497220943f33", null);
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
    "602c3fb93d90a5fd8d2b3195e79f5a497220943f33",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createOrder"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$client$292f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/(client)/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_0adae0b3._.js.map