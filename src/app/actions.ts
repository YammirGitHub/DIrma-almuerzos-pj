'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Crear cliente seguro en servidor
async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Contexto de Server Component
          }
        },
      },
    }
  )
}

export async function createOrder(prevState: any, formData: FormData) {
  const supabase = await getSupabase()
  
  // 1. EXTRAER DATOS DEL FORMULARIO
  const rawItems = formData.get('items') as string
  const items = JSON.parse(rawItems)
  const total = parseFloat(formData.get('total') as string)
  const method = formData.get('payment_method') as string // 'yape' | 'monthly'
  
  const name = formData.get('name') as string
  const office = formData.get('office') as string
  const phone = formData.get('phone') as string
  const opCode = formData.get('operation_code') as string
  
  // 2. VALIDACIÓN DE SEGURIDAD (LISTA NEGRA)
  // Buscamos si el cliente ya existe por su teléfono
  const { data: customer } = await supabase
    .from('customers')
    .select('is_blacklisted')
    .eq('phone', phone)
    .single()

  // SI ESTÁ EN LISTA NEGRA: Bloqueamos todo tipo de pedido
  if (customer?.is_blacklisted) {
    return {
      success: false,
      message: 'Usuario con restricciones administrativas. Por favor contacte soporte.'
    }
  }

  // 3. REGISTRO/ACTUALIZACIÓN DE CLIENTE (CRÍTICO PARA EL REPORTE)
  // Usamos 'upsert': Si no existe, lo crea. Si existe, actualiza nombre y oficina.
  // Esto asegura que tu base de datos de clientes siempre tenga los datos frescos.
  const { error: customerError } = await supabase
    .from('customers')
    .upsert({ 
      phone: phone, // Clave única
      full_name: name, 
      office: office
      // Nota: No tocamos 'is_blacklisted', se mantiene su valor actual o false por defecto
    }, { onConflict: 'phone' })

  if (customerError) {
    console.error('Error actualizando cliente:', customerError)
    // No detenemos el pedido, pero lo logueamos
  }

  // 4. DEFINIR ESTADO DEL PAGO
  let paymentStatus = 'unpaid'
  
  if (method === 'yape') {
    paymentStatus = 'verifying' // Requiere que revises el código de operación
  } else if (method === 'monthly') {
    paymentStatus = 'on_account' // <--- ESTADO CLAVE PARA TU REPORTE DE DEUDA
  }

  // 5. INSERTAR EL PEDIDO EN SUPABASE
  const { data, error } = await supabase.from('orders').insert({
    customer_name: name,
    customer_phone: phone,
    customer_office: office,
    items: items,
    total_amount: total,
    payment_method: method,
    payment_status: paymentStatus,
    operation_code: opCode || null,
    is_monthly_account: method === 'monthly', // Flag útil para filtros rápidos
    status: 'pending' // Estado de la cocina (Pendiente, Cocinando, Entregado)
  }).select().single()

  if (error) {
    console.error('Error insertando pedido:', error)
    return { success: false, message: 'Ocurrió un error al guardar el pedido. Inténtalo de nuevo.' }
  }

  // 6. REDIRECCIÓN A PÁGINA DE ÉXITO
  redirect(`/pedido/${data.id}`)
}