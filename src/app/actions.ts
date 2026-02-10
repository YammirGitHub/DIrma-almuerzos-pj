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
            // Server Component context
          }
        },
      },
    }
  )
}

export async function createOrder(prevState: any, formData: FormData) {
  const supabase = await getSupabase()
  
  // 1. Extraer datos del FormData
  const rawItems = formData.get('items') as string
  const items = JSON.parse(rawItems)
  const total = parseFloat(formData.get('total') as string)
  const method = formData.get('payment_method') as string
  const opCode = formData.get('operation_code') as string
  const cashAmount = formData.get('cash_amount') as string
  
  // Datos del Cliente (Podrían venir de cookies si ya pidió antes)
  const name = formData.get('name') as string
  const office = formData.get('office') as string
  const phone = formData.get('phone') as string

  // 2. Definir estado inicial del pago
  let paymentStatus = 'unpaid'
  let changeNeeded = null
  
  if (method === 'yape') {
    paymentStatus = 'verifying' // A la cola de la señora
  } else if (method === 'cash') {
    if (cashAmount) {
        changeNeeded = parseFloat(cashAmount) - total
    }
  }

  // 3. Insertar en Supabase
  const { data, error } = await supabase.from('orders').insert({
    customer_name: name,
    customer_phone: phone,
    customer_office: office,
    items: items,
    total_amount: total,
    payment_method: method,
    payment_status: paymentStatus,
    operation_code: opCode || null,
    cash_change_amount: changeNeeded,
    status: 'pending'
  }).select().single()

  if (error) {
    console.error(error)
    return { success: false, message: 'Error guardando pedido' }
  }

  // 4. Redirigir a página de éxito
  redirect(`/pedido/${data.id}`)
}