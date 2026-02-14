'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers' // IMPORTAR HEADERS
import { redirect } from 'next/navigation'

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
          } catch {}
        },
      },
    }
  )
}

export async function createOrder(prevState: any, formData: FormData) {
  const supabase = await getSupabase()
  const headerStore = await headers()

  // --- 1. CAPTURAR HUELLA DIGITAL (SEGURIDAD) ---
  // Esto nos dice desde qué IP y qué celular (iPhone, Android, etc.) se hizo el pedido
  const ip = headerStore.get('x-forwarded-for') || 'IP Desconocida';
  const userAgent = headerStore.get('user-agent') || 'Dispositivo Desconocido';
  
  // EXTRAER DATOS DEL FORM
  const rawItems = formData.get('items') as string
  const items = JSON.parse(rawItems)
  const total = parseFloat(formData.get('total') as string)
  const method = formData.get('payment_method') as string
  
  const name = formData.get('name') as string
  const office = formData.get('office') as string
  const phone = formData.get('phone') as string
  const opCode = formData.get('operation_code') as string
  
  // 2. SEGURIDAD: VERIFICAR SI ESTÁ EN LISTA NEGRA
  const { data: customer } = await supabase
    .from('customers')
    .select('is_blacklisted')
    .eq('phone', phone)
    .single()

  // SI ESTÁ BLOQUEADO, RECHAZAMOS EL PEDIDO AL INSTANTE
  if (customer?.is_blacklisted) {
    return {
      success: false,
      message: 'Lo sentimos, este número tiene restricciones administrativas. Contacte con soporte.'
    }
  }

  // 3. ACTUALIZAR O CREAR CLIENTE
  await supabase
    .from('customers')
    .upsert({ 
      phone: phone, 
      full_name: name, 
      office: office
    }, { onConflict: 'phone' })

  // 4. ESTADO DEL PAGO
  let paymentStatus = 'unpaid'
  if (method === 'yape') paymentStatus = 'verifying'
  else if (method === 'monthly') paymentStatus = 'on_account'

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
  }).select().single()

  if (error) {
    console.error('Error:', error)
    return { success: false, message: 'Error al procesar. Intenta de nuevo.' }
  }

  redirect(`/pedido/${data.id}`) // Redirige a la boleta
}