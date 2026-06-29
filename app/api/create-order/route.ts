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

  const orderId        = orderData.order?.id as number
  const orderStatusUrl = (orderData.order?.order_status_url as string) ?? ''
  console.log('[Order] created:', orderId, '| financial_status:', orderData.order?.financial_status)

  // ── 2. Poll fulfillments directly — DD may auto-fulfill immediately ───────
  // Check fulfillments first on every iteration so DD's auto-fulfillment is
  // caught right away without waiting for our fulfillment_request step.
  // On the first iteration where fulfillments are still empty, send
  // fulfillment_requests to handle products that are not auto-fulfilled.
  let createdFulfillments: FulfillmentRecord[] = []
  let foRequestsSent = false

  for (let attempt = 1; attempt <= 15; attempt++) {
    if (attempt > 1) await new Promise(r => setTimeout(r, 1000))

    const fulfRes  = await fetch(`${base}/orders/${orderId}/fulfillments.json`, { headers })
    const fulfData = await fulfRes.json()
    createdFulfillments = fulfData.fulfillments ?? []

    console.log(`[Poll] attempt ${attempt}/15: ${createdFulfillments.length} fulfillment(s) for ${items.length} item(s)`)
    for (const f of createdFulfillments) {
      console.log(`  fulfillment ${f.id} tracking_url: ${f.tracking_url} | items: ${JSON.stringify(f.line_items?.map(l => l.variant_id))}`)
    }

    if (createdFulfillments.length >= items.length) break

    // No fulfillments yet — send FO requests once as a fallback for products
    // that require an explicit fulfillment_request (not auto-fulfilled by DD).
    if (!foRequestsSent) {
      foRequestsSent = true
      const foRes  = await fetch(`${base}/orders/${orderId}/fulfillment_orders.json`, { headers })
      const foData = await foRes.json()
      const allFOs: ShopifyFulfillmentOrder[] = foData.fulfillment_orders ?? []

      console.log('[FulfillmentOrders]', JSON.stringify(allFOs.map(fo => ({
        id: fo.id, status: fo.status, request_status: fo.request_status, service: fo.fulfillment_service_handle,
      }))))

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
        console.log('[FulfillmentRequest] no open FOs — DD has likely auto-fulfilled, continuing to poll')
      }
    }
  }

  // ── 3. Build per-item download HTML ──────────────────────────────────────
  const variantToUrl = new Map<string, string>()
  for (const f of createdFulfillments) {
    const url = f.tracking_url || orderStatusUrl
    for (const li of (f.line_items ?? [])) {
      variantToUrl.set(String(li.variant_id), url)
    }
  }

  const downloadLinksHtml = items
    .map((item, idx) => {
      const isLast = idx === items.length - 1
      const url    = variantToUrl.get(item.shopifyVariantId) || orderStatusUrl
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

  // ── 4. Send branded purchase email via EmailJS ────────────────────────────
  console.log('[EmailJS] preparing to send | customer_email:', email)
  console.log('[EmailJS] service_id:', process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? 'MISSING')
  console.log('[EmailJS] template_id:', process.env.NEXT_PUBLIC_EMAILJS_PURCHASE_TEMPLATE_ID ?? 'MISSING')
  console.log('[EmailJS] user_id:', process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? 'SET' : 'MISSING')
  console.log('[EmailJS] download_links (first 300 chars):', downloadLinksHtml.slice(0, 300))

  try {
    const ejRes  = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        template_id:     process.env.NEXT_PUBLIC_EMAILJS_PURCHASE_TEMPLATE_ID,
        user_id:         process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
        template_params: { customer_email: email, download_links: downloadLinksHtml },
      }),
    })
    const ejBody = await ejRes.text()
    console.log('[EmailJS] response → HTTP', ejRes.status, '| body:', ejBody)
  } catch (err) {
    console.error('[EmailJS] fetch threw (non-blocking):', err)
  }

  return NextResponse.json({ orderId })
}
