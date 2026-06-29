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
  id:              number
  tracking_url:    string | null
  tracking_number: string | null
  line_items:      FulfillmentLineItem[]
}

// Extracts a direct file URL from a Shopify metafields array.
// Digital Downloads stores files under namespace "digital_downloads" with
// key "file_attachment" or "files". The value may be a raw URL string,
// a JSON object with a "url" property, or a Shopify File GID with a src.
interface ShopifyMetafield {
  namespace: string
  key:       string
  value:     string
}

function extractFileUrl(metafields: ShopifyMetafield[]): string | null {
  const candidates = metafields.filter(mf =>
    mf.namespace === 'digital_downloads' ||
    mf.namespace === 'digital_download'   ||
    mf.key       === 'file_attachment'    ||
    mf.key       === 'files'
  )

  for (const mf of candidates) {
    const raw = mf.value
    if (!raw) continue

    // Try JSON first
    try {
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const obj = parsed as Record<string, unknown>
        const url = obj.url || obj.src || obj.download_url
        if (typeof url === 'string' && url.startsWith('http')) return url
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0] as Record<string, unknown>
        const u = first?.url || first?.src || first?.download_url
        if (typeof u === 'string' && u.startsWith('http')) return u
      }
    } catch {
      if (raw.startsWith('http')) return raw
    }
  }

  return null
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

  // ── 3. Resolve per-item Digital Downloads page URLs ─────────────────────
  // Fetch the full order to expose ALL fields where DD might store the token:
  // note_attributes, line_item properties, and raw fulfillment receipt/tracking.
  const fullOrderRes  = await fetch(`${base}/orders/${orderId}.json`, { headers })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fullOrder: any = (await fullOrderRes.json()).order ?? {}

  // Log raw data so we can see exactly what DD stores
  console.log('[RawOrder] note_attributes:', JSON.stringify(fullOrder.note_attributes))
  console.log('[RawOrder] line_items props:', JSON.stringify(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fullOrder.line_items ?? []).map((li: any) => ({ variant_id: li.variant_id, name: li.name, properties: li.properties }))
  ))
  console.log('[RawOrder] fulfillments:', JSON.stringify(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fullOrder.fulfillments ?? []).map((f: any) => ({
      id: f.id,
      service: f.service,
      tracking_number: f.tracking_number,
      tracking_url: f.tracking_url,
      tracking_urls: f.tracking_urls,
      receipt: f.receipt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      line_items: (f.line_items ?? []).map((li: any) => ({ variant_id: li.variant_id, properties: li.properties })),
    }))
  ))

  // Build variant → download URL from every known DD storage location.
  // DD confirmed format: https://{shop}/a/downloads/-/{token}
  const variantToUrl = new Map<string, string>()

  // Detect any DD download URL regardless of exact path prefix
  const isDdUrl = (v: unknown): v is string =>
    typeof v === 'string' && (v.includes('/a/downloads/') || v.includes('/apps/downloads/'))

  // ── Source A: order.note_attributes ──────────────────────────────────────
  // DD stores per-item download URLs here. Attribute names may contain the
  // variant_id or line_item_id, or URLs may be positionally ordered.
  const noteUrls: Array<{ name: string; url: string }> = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const attr of (fullOrder.note_attributes ?? []) as any[]) {
    if (isDdUrl(attr.value)) {
      console.log('[Source A] note_attribute download URL:', attr.name, '→', attr.value)
      noteUrls.push({ name: String(attr.name ?? ''), url: attr.value })
      // Match by variant_id or item id embedded in the attribute name
      const matched = items.find(item =>
        String(attr.name).includes(item.shopifyVariantId) ||
        String(attr.name).includes(item.id)
      )
      if (matched) variantToUrl.set(matched.shopifyVariantId, attr.value)
    }
  }
  // Positional fallback: pair note URLs to unmatched items in order
  const unmatchedAfterA = items.filter(i => !variantToUrl.has(i.shopifyVariantId))
  if (noteUrls.length === unmatchedAfterA.length && noteUrls.length > 0) {
    unmatchedAfterA.forEach((item, idx) => variantToUrl.set(item.shopifyVariantId, noteUrls[idx].url))
  } else if (noteUrls.length > 0 && unmatchedAfterA.length > 0) {
    // Fewer URLs than items — assign what we have positionally
    unmatchedAfterA.slice(0, noteUrls.length).forEach((item, idx) =>
      variantToUrl.set(item.shopifyVariantId, noteUrls[idx].url)
    )
  }

  // ── Source B: order.line_items[*].properties ──────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const li of (fullOrder.line_items ?? []) as any[]) {
    if (variantToUrl.has(String(li.variant_id))) continue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dlProp = (li.properties ?? []).find((p: any) => isDdUrl(p.value))
    if (dlProp) {
      console.log(`[Source B] line_item ${li.variant_id} property:`, dlProp.name, '→', dlProp.value)
      variantToUrl.set(String(li.variant_id), dlProp.value)
    }
  }

  // ── Source C: fulfillment receipt (regex scan for any download URL) ───────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const f of (fullOrder.fulfillments ?? []) as any[]) {
    const receiptStr = JSON.stringify(f.receipt ?? '')
    const match = receiptStr.match(/https?:\/\/[^"'\\]*\/(?:a|apps)\/downloads\/[^"'\\]+/)
    if (match) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const li of (f.line_items ?? []) as any[]) {
        if (!variantToUrl.has(String(li.variant_id))) {
          console.log(`[Source C] fulfillment receipt URL for variant ${li.variant_id}:`, match[0])
          variantToUrl.set(String(li.variant_id), match[0])
        }
      }
    }
  }

  // ── Source D: product metafields (CDN file URL — direct download) ─────────
  for (const item of items) {
    if (variantToUrl.has(item.shopifyVariantId)) continue
    try {
      const varRes  = await fetch(`${base}/variants/${item.shopifyVariantId}.json`, { headers })
      const varData = await varRes.json()
      const productId: number | undefined = varData.variant?.product_id
      if (productId) {
        const pmRes  = await fetch(`${base}/products/${productId}/metafields.json`, { headers })
        const pmData = await pmRes.json()
        const pmfs: ShopifyMetafield[] = pmData.metafields ?? []
        const pUrl = extractFileUrl(pmfs)
        if (pUrl) {
          console.log(`[Source D] metafield CDN URL for ${item.name}:`, pUrl)
          variantToUrl.set(item.shopifyVariantId, pUrl)
        }
      }
    } catch (e) {
      console.error(`[Source D] metafield error for variant ${item.shopifyVariantId}:`, e)
    }
  }

  // Final resolution — log outcome and apply orderStatusUrl as last resort
  for (const item of items) {
    if (!variantToUrl.has(item.shopifyVariantId)) variantToUrl.set(item.shopifyVariantId, orderStatusUrl)
    console.log(`[DownloadURL] ${item.name} → ${variantToUrl.get(item.shopifyVariantId)}`)
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
        accessToken:     process.env.EMAILJS_PRIVATE_KEY,
        template_params: { to_email: email, customer_email: email, download_links: downloadLinksHtml },
      }),
    })
    const ejBody = await ejRes.text()
    console.log('[EmailJS] response → HTTP', ejRes.status, '| body:', ejBody)
  } catch (err) {
    console.error('[EmailJS] fetch threw (non-blocking):', err)
  }

  return NextResponse.json({ orderId })
}
