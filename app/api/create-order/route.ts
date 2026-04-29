import { NextRequest, NextResponse } from 'next/server'

interface OrderItem {
  id:               string
  name:             string
  price:            number
  shopifyVariantId: string
}

interface OrderBody {
  email:      string
  items:      OrderItem[]
  total:      number
  paymentId?: string
}

export async function POST(req: NextRequest) {
  const body: OrderBody = await req.json()
  const { email, items, total, paymentId } = body

  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const token  = process.env.SHOPIFY_ADMIN_API_TOKEN

  if (!domain) return NextResponse.json({ error: 'Store domain not configured' }, { status: 500 })
  if (!token)  return NextResponse.json({ error: 'SHOPIFY_ADMIN_API_TOKEN not set' }, { status: 500 })

  const headers = {
    'Content-Type':           'application/json',
    'X-Shopify-Access-Token': token,
  }

  const lineItems = items.map(item =>
    item.shopifyVariantId
      ? { variant_id: item.shopifyVariantId, quantity: 1 }
      : { title: item.name, price: item.price.toFixed(2), quantity: 1 },
  )

  const orderRes = await fetch(
    `https://${domain}/admin/api/2024-07/orders.json`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        order: {
          email,
          financial_status:         'paid',
          send_receipt:             true,
          send_fulfillment_receipt: true,
          line_items:               lineItems,
          note: paymentId
            ? `Paid via Moyasar. Payment ID: ${paymentId}. Total: SAR ${total}`
            : `Paid via Moyasar. Total: SAR ${total}`,
        },
      }),
    },
  )

  const orderData = await orderRes.json()

  if (!orderRes.ok) {
    console.error('[Order] creation failed:', orderData)
    return NextResponse.json(
      { error: 'Order creation failed', detail: orderData },
      { status: orderRes.status },
    )
  }

  const orderId = orderData.order?.id
  console.log('[Order] created and paid:', orderId)

  return NextResponse.json({ orderId })
}
