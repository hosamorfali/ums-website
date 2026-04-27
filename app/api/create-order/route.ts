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

  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const token  = process.env.SHOPIFY_ADMIN_API_TOKEN

  if (!domain) {
    return NextResponse.json({ error: 'Store domain not configured' }, { status: 500 })
  }
  if (!token) {
    return NextResponse.json(
      { error: 'SHOPIFY_ADMIN_API_TOKEN not set' },
      { status: 500 },
    )
  }

  const headers = {
    'Content-Type':           'application/json',
    'X-Shopify-Access-Token': token,
  }
  const base = `https://${domain}/admin/api/2024-07`

  // ── 1. Create order ──────────────────────────────────────────────────────
  const lineItems = items.map(item =>
    item.shopifyVariantId
      ? { variant_id: item.shopifyVariantId, quantity: 1 }
      : { title: item.name, price: item.price.toFixed(2), quantity: 1 },
  )

  const orderRes = await fetch(`${base}/orders.json`, {
    method:  'POST',
    headers,
    body: JSON.stringify({
      order: {
        email,
        financial_status:         'paid',
        send_receipt:             true,
        send_fulfillment_receipt: true,
        line_items:               lineItems,
        note:                     `Paid via Moyasar. Total: SAR ${total}`,
      },
    }),
  })

  const orderData = await orderRes.json()

  if (!orderRes.ok) {
    console.error('Shopify order creation failed:', orderData)
    return NextResponse.json(
      { error: 'Order creation failed', detail: orderData },
      { status: orderRes.status },
    )
  }

  const orderId = orderData.order?.id as number
  if (!orderId) {
    return NextResponse.json({ error: 'Order created but no ID returned' }, { status: 500 })
  }

  // ── 2. Get fulfillment orders (required for the new fulfillment API) ─────
  const foRes  = await fetch(`${base}/orders/${orderId}/fulfillment_orders.json`, { headers })
  const foData = await foRes.json()

  const fulfillmentOrderIds: number[] = (foData.fulfillment_orders ?? [])
    .filter((fo: { status: string }) => fo.status === 'open')
    .map((fo: { id: number }) => fo.id)

  if (fulfillmentOrderIds.length === 0) {
    // Order exists but nothing to fulfill (can happen with already-fulfilled items)
    console.warn('No open fulfillment orders found for order', orderId)
    return NextResponse.json({ orderId })
  }

  // ── 3. Fulfill — triggers Digital Downloads file delivery email ──────────
  const fulfillRes = await fetch(`${base}/fulfillments.json`, {
    method:  'POST',
    headers,
    body: JSON.stringify({
      fulfillment: {
        line_items_by_fulfillment_order: fulfillmentOrderIds.map(id => ({
          fulfillment_order_id: id,
        })),
        notify_customer: true,
      },
    }),
  })

  const fulfillData = await fulfillRes.json()

  if (!fulfillRes.ok) {
    // Non-fatal: order is paid, fulfillment failed — log and return orderId anyway
    console.error('Shopify fulfillment failed (order still created):', fulfillData)
  } else {
    console.log('Fulfillment created:', fulfillData.fulfillment?.id)
  }

  return NextResponse.json({ orderId })
}
