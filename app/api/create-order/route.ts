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

interface ShopifyFulfillmentOrderLineItem {
  id:       number
  quantity: number
}

interface ShopifyFulfillmentOrder {
  id:                         number
  status:                     string
  request_status:             string
  assigned_location_id:       number
  fulfillment_service_handle: string | null
  line_items:                 ShopifyFulfillmentOrderLineItem[]
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

  // ── 1. Create order ───────────────────────────────────────────────────────
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

  // ── 2. Poll fulfillments — DD auto-fulfills on this store ─────────────────
  // Check fulfillments first on every iteration so DD's auto-fulfillment is
  // caught immediately. Send fulfillment_requests once on the first empty poll
  // as a fallback for any item DD does not auto-fulfill.
  let foRequestsSent = false

  for (let attempt = 1; attempt <= 15; attempt++) {
    if (attempt > 1) await new Promise(r => setTimeout(r, 1000))

    const fulfRes  = await fetch(`${base}/orders/${orderId}/fulfillments.json`, { headers })
    const fulfData = await fulfRes.json()
    const fulfillments: unknown[] = fulfData.fulfillments ?? []

    console.log(`[Poll] attempt ${attempt}/15: ${fulfillments.length} fulfillment(s) for ${items.length} item(s)`)

    if (fulfillments.length >= items.length) break

    if (!foRequestsSent) {
      foRequestsSent = true
      const foRes  = await fetch(`${base}/orders/${orderId}/fulfillment_orders.json`, { headers })
      const foData = await foRes.json()
      const allFOs: ShopifyFulfillmentOrder[] = foData.fulfillment_orders ?? []

      const requestable = allFOs.filter(fo =>
        fo.status === 'open' &&
        (fo.request_status === 'unsubmitted' || fo.request_status === 'submitted'),
      )

      for (const fo of requestable) {
        const foLineItems = fo.line_items ?? []
        for (const li of foLineItems) {
          const frRes = await fetch(`${base}/fulfillment_orders/${fo.id}/fulfillment_request.json`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              fulfillment_request: {
                message: 'Digital download — send files to customer.',
                fulfillment_order_line_items: [{ id: li.id, quantity: li.quantity }],
              },
            }),
          })
          console.log(`[FulfillmentRequest] FO ${fo.id} line item ${li.id} → HTTP ${frRes.status}`)
          if (foLineItems.indexOf(li) < foLineItems.length - 1) {
            await new Promise(r => setTimeout(r, 500))
          }
        }
      }

      if (requestable.length === 0) {
        console.log('[FulfillmentRequest] no open FOs — DD has auto-fulfilled')
      }
    }
  }

  return NextResponse.json({ orderId })
}
