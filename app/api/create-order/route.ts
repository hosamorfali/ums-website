import { NextRequest, NextResponse } from 'next/server'

interface OrderItem {
  id:               string
  name:             string
  price:            number
  shopifyVariantId: string
}

interface OrderBody {
  email:          string
  items:          OrderItem[]
  total:          number
  paymentId?:     string   // Moyasar payment ID for reference
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
  const base = `https://${domain}/admin/api/2024-07`

  const lineItems = items.map(item =>
    item.shopifyVariantId
      ? { variant_id: item.shopifyVariantId, quantity: 1 }
      : { title: item.name, price: item.price.toFixed(2), quantity: 1 },
  )

  // ── 1. Create order as PENDING — no financial_status set yet ─────────────
  // Deliberately omit financial_status so Shopify treats it as pending.
  // We'll record a transaction next, which properly fires orders/paid webhook.
  const orderRes = await fetch(`${base}/orders.json`, {
    method:  'POST',
    headers,
    body: JSON.stringify({
      order: {
        email,
        send_receipt:             false,   // suppress until transaction fires it
        send_fulfillment_receipt: true,
        line_items:               lineItems,
        note: paymentId
          ? `Paid via Moyasar. Payment ID: ${paymentId}. Total: SAR ${total}`
          : `Paid via Moyasar. Total: SAR ${total}`,
        // Gateway label shown in Shopify admin
        gateway: 'Moyasar',
      },
    }),
  })

  const orderData = await orderRes.json()

  if (!orderRes.ok) {
    console.error('[Order] creation failed:', orderData)
    return NextResponse.json(
      { error: 'Order creation failed', detail: orderData },
      { status: orderRes.status },
    )
  }

  const orderId = orderData.order?.id as number
  console.log('[Order] created:', orderId)

  // ── 2. Record transaction — this fires the orders/paid webhook ───────────
  // Digital Downloads subscribes to orders/paid to send download link emails.
  // Setting financial_status directly on the order bypasses this webhook.
  const txRes = await fetch(`${base}/orders/${orderId}/transactions.json`, {
    method:  'POST',
    headers,
    body: JSON.stringify({
      transaction: {
        kind:     'sale',
        status:   'success',
        amount:   total.toFixed(2),
        currency: 'SAR',
        gateway:  'Moyasar',
        message:  paymentId ? `Moyasar payment ${paymentId}` : 'Moyasar payment',
      },
    }),
  })

  const txData = await txRes.json()

  if (!txRes.ok) {
    console.error('[Transaction] failed:', txData)
    // Order exists but not marked paid — return error so client knows
    return NextResponse.json(
      { error: 'Order created but payment recording failed', orderId, detail: txData },
      { status: 500 },
    )
  }

  console.log('[Transaction] recorded:', txData.transaction?.id, '| financial_status should now be paid')

  return NextResponse.json({ orderId })
}
