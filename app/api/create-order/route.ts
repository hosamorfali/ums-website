import { NextRequest, NextResponse } from 'next/server'

interface OrderItem {
  id:               string
  name:             string
  price:            number
  shopifyVariantId: string
}

interface OrderBody {
  email: string
  items: OrderItem[]
  total: number
}

export async function POST(req: NextRequest) {
  const body: OrderBody = await req.json()
  const { email, items, total } = body

  const token  = process.env.SHOPIFY_ADMIN_API_TOKEN
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

  if (!token || !domain) {
    return NextResponse.json({ error: 'Shopify Admin API not configured' }, { status: 500 })
  }

  const lineItems = items.map(item => {
    if (item.shopifyVariantId) {
      return {
        variant_id: item.shopifyVariantId,
        quantity:   1,
      }
    }
    // Fallback: custom line item when variant ID not yet set
    return {
      title:    item.name,
      price:    item.price.toFixed(2),
      quantity: 1,
    }
  })

  const orderPayload = {
    order: {
      email,
      financial_status:            'paid',
      send_receipt:                true,
      send_fulfillment_receipt:    true,
      line_items:                  lineItems,
      note: `Paid via Moyasar. Total: SAR ${total}`,
    },
  }

  const res = await fetch(
    `https://${domain}/admin/api/2024-07/orders.json`,
    {
      method:  'POST',
      headers: {
        'Content-Type':               'application/json',
        'X-Shopify-Access-Token':     token,
      },
      body: JSON.stringify(orderPayload),
    },
  )

  const data = await res.json()

  if (!res.ok) {
    console.error('Shopify order creation failed:', data)
    return NextResponse.json({ error: 'Order creation failed', details: data }, { status: res.status })
  }

  return NextResponse.json({ orderId: data.order?.id })
}
