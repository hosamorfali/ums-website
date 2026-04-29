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

interface ShopifyFulfillmentOrder {
  id:                         number
  status:                     string
  request_status:             string
  assigned_location_id:       number
  fulfillment_service_handle: string | null
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

  // ── 1. Create order — embed the transaction so Shopify records SAR amount ─
  // Including transactions[] in the creation payload is the correct way to
  // record an externally-processed payment. This fires orders/paid webhook AND
  // shows the correct paid amount in Shopify admin (not SAR 0.00).
  const orderRes = await fetch(`${base}/orders.json`, {
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
        transactions: [
          {
            kind:          'sale',
            status:        'success',
            amount:        total.toFixed(2),
            currency:      'SAR',
            gateway:       'manual',
            authorization: paymentId ?? '',
          },
        ],
      },
    }),
  })

  const orderData = await orderRes.json()

  if (!orderRes.ok) {
    console.error('[Order] creation failed:', JSON.stringify(orderData))
    return NextResponse.json(
      { error: 'Order creation failed', detail: orderData },
      { status: orderRes.status },
    )
  }

  const orderId = orderData.order?.id as number
  console.log('[Order] created:', orderId, '| financial_status:', orderData.order?.financial_status)

  // ── 2. Fetch ALL fulfillment orders (not just open) ──────────────────────
  const foRes  = await fetch(`${base}/orders/${orderId}/fulfillment_orders.json`, { headers })
  const foData = await foRes.json()
  const allFOs: ShopifyFulfillmentOrder[] = foData.fulfillment_orders ?? []

  console.log('[FulfillmentOrders] all FOs:', JSON.stringify(allFOs.map(fo => ({
    id: fo.id,
    status: fo.status,
    request_status: fo.request_status,
    service: fo.fulfillment_service_handle,
  }))))

  // ── 3. Send fulfillment request to Digital Downloads service ─────────────
  // Digital Downloads registers as an external fulfillment service.
  // We must send a fulfillment_request to it (not create a fulfillment directly).
  // This is what triggers the "Automatically send files" per-product setting.
  const requestable = allFOs.filter(fo =>
    fo.status === 'open' && fo.request_status === 'unsubmitted',
  )

  for (const fo of requestable) {
    console.log(`[FulfillmentRequest] sending request to FO ${fo.id} (service: ${fo.fulfillment_service_handle})`)

    const frRes  = await fetch(`${base}/fulfillment_orders/${fo.id}/fulfillment_request.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fulfillment_request: { message: 'Digital download — send files to customer.' } }),
    })
    const frData = await frRes.json()

    console.log(`[FulfillmentRequest] FO ${fo.id} → status ${frRes.status}:`, JSON.stringify(frData))
  }

  if (requestable.length === 0) {
    console.warn('[FulfillmentRequest] no requestable FOs found — DD may have auto-processed or FOs have unexpected status')
  }

  return NextResponse.json({ orderId })
}
