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

interface FulfillmentLineItem {
  variant_id: number
  name:       string
}

interface FulfillmentRecord {
  id:           number
  tracking_url: string | null
  line_items:   FulfillmentLineItem[]
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

  // ── 2. Poll for fulfillment orders until count matches line item count ────
  // Shopify/Digital Downloads creates FOs asynchronously after order creation.
  // Fetching immediately misses FOs that aren't ready yet, causing multi-item
  // orders to only deliver the first item. Retry until all FOs are present.
  const MAX_ATTEMPTS    = 10
  const POLL_INTERVAL   = 1000
  let allFOs: ShopifyFulfillmentOrder[] = []

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) await new Promise(r => setTimeout(r, POLL_INTERVAL))

    const foRes  = await fetch(`${base}/orders/${orderId}/fulfillment_orders.json`, { headers })
    const foData = await foRes.json()
    allFOs = foData.fulfillment_orders ?? []

    console.log(`[FulfillmentOrders] attempt ${attempt}/${MAX_ATTEMPTS}: ${allFOs.length} FO(s) for ${items.length} line item(s)`)

    if (allFOs.length >= items.length) break
  }

  console.log('[FulfillmentOrders] final:', JSON.stringify(allFOs.map(fo => ({
    id: fo.id,
    status: fo.status,
    request_status: fo.request_status,
    service: fo.fulfillment_service_handle,
  }))))

  // ── 3. Send one fulfillment request per line item ────────────────────────
  // Digital Downloads creates one email per fulfillment (not per order).
  // Sending a separate request scoped to each individual line item via
  // fulfillment_order_line_items ensures each template gets its own email.
  const requestable = allFOs.filter(fo =>
    fo.status === 'open' &&
    (fo.request_status === 'unsubmitted' || fo.request_status === 'submitted'),
  )

  let requestCount = 0

  for (const fo of requestable) {
    const lineItems = fo.line_items ?? []

    for (const li of lineItems) {
      console.log(`[FulfillmentRequest] FO ${fo.id} → line item ${li.id} (service: ${fo.fulfillment_service_handle})`)

      const frRes  = await fetch(`${base}/fulfillment_orders/${fo.id}/fulfillment_request.json`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fulfillment_request: {
            message: 'Digital download — send files to customer.',
            fulfillment_order_line_items: [{ id: li.id, quantity: li.quantity }],
          },
        }),
      })
      const frData = await frRes.json()

      console.log(`[FulfillmentRequest] line item ${li.id} → HTTP ${frRes.status}:`, JSON.stringify(frData))
      requestCount++

      // Brief pause so Shopify can process any FO split before the next request
      if (lineItems.indexOf(li) < lineItems.length - 1) {
        await new Promise(r => setTimeout(r, 500))
      }
    }
  }

  if (requestCount === 0) {
    console.warn('[FulfillmentRequest] no requestable FOs found — DD may have auto-processed or all FOs have unexpected status')
  }

  // ── 4. Poll for created fulfillments to get per-item download URLs ────────
  // Digital Downloads creates a fulfillment per request asynchronously.
  // Poll until we have as many fulfillments as items, or give up after 5s.
  const orderStatusUrl = (orderData.order?.order_status_url as string) ?? ''
  let createdFulfillments: FulfillmentRecord[] = []

  for (let attempt = 1; attempt <= 5; attempt++) {
    await new Promise(r => setTimeout(r, 1000))
    const fulfRes  = await fetch(`${base}/orders/${orderId}/fulfillments.json`, { headers })
    const fulfData = await fulfRes.json()
    createdFulfillments = fulfData.fulfillments ?? []
    console.log(`[Fulfillments] attempt ${attempt}/5: ${createdFulfillments.length} fulfillment(s)`)
    if (createdFulfillments.length >= items.length) break
  }

  // ── 5. Build per-item download HTML ──────────────────────────────────────
  // Map shopify variant_id → download URL extracted from DD fulfillment tracking_url.
  // Falls back to order_status_url if DD hasn't populated tracking_url yet.
  const variantToUrl = new Map<string, string>()
  for (const f of createdFulfillments) {
    const url = f.tracking_url || orderStatusUrl
    for (const li of (f.line_items ?? [])) {
      variantToUrl.set(String(li.variant_id), url)
    }
  }

  const downloadLinksHtml = items
    .map((item, idx) => {
      const isLast  = idx === items.length - 1
      const url     = variantToUrl.get(item.shopifyVariantId) || orderStatusUrl
      return (
        `<div style="margin-bottom:16px;padding-bottom:16px;${isLast ? '' : 'border-bottom:1px solid #f0f0f0;'}">` +
        `<div style="font-size:11px;letter-spacing:0.1em;color:#999999;margin-bottom:4px;">FRAMEWORK NAME</div>` +
        `<div style="font-size:14px;font-weight:500;color:#1a1a1a;margin-bottom:8px;">${item.name}</div>` +
        `<div style="font-size:11px;letter-spacing:0.1em;color:#999999;margin-bottom:4px;">DOWNLOAD LINK</div>` +
        `<a href="${url}" style="font-size:13px;color:#1a1a1a;text-decoration:underline;">Download your file →</a>` +
        `</div>`
      )
    })
    .join('')

  // ── 6. Send branded purchase email via EmailJS (Digital Downloads = backup) ─
  try {
    const ejRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        template_id:     process.env.NEXT_PUBLIC_EMAILJS_PURCHASE_TEMPLATE_ID,
        user_id:         process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
        template_params: { customer_email: email, download_links: downloadLinksHtml },
      }),
    })
    console.log('[EmailJS] purchase email → HTTP', ejRes.status, await ejRes.text())
  } catch (err) {
    console.error('[EmailJS] failed (non-blocking):', err)
  }

  return NextResponse.json({ orderId })
}
