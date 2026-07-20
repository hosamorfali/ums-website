import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, tag } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const token  = process.env.SHOPIFY_ADMIN_API_TOKEN

  if (!domain || !token) {
    return NextResponse.json({ error: 'Shopify not configured' }, { status: 500 })
  }

  const base    = `https://${domain}/admin/api/2024-07`
  const headers = {
    'Content-Type':           'application/json',
    'X-Shopify-Access-Token': token,
  }

  // Try to create the customer first
  const createRes = await fetch(`${base}/customers.json`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer: {
        email,
        accepts_marketing: true,
        tags: tag ?? 'newsletter-subscriber',
      },
    }),
  })

  if (createRes.ok) {
    return NextResponse.json({ ok: true })
  }

  const createData = await createRes.json()

  // Email already exists — find the customer and update their marketing consent + tag
  if (createData.errors?.email) {
    const searchRes  = await fetch(
      `${base}/customers/search.json?query=email:${encodeURIComponent(email)}&fields=id,tags`,
      { headers },
    )
    const searchData = await searchRes.json()
    const customer   = searchData.customers?.[0]

    if (!customer) {
      console.error('[Subscribe] customer not found after email conflict')
      return NextResponse.json({ error: 'Could not find subscriber' }, { status: 500 })
    }

    const existingTags = customer.tags ? customer.tags.split(', ').filter(Boolean) : []
    const tagToAdd     = tag ?? 'newsletter-subscriber'
    const mergedTags   = Array.from(new Set([...existingTags, tagToAdd])).join(', ')

    const updateRes = await fetch(`${base}/customers/${customer.id}.json`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        customer: {
          id:                customer.id,
          accepts_marketing: true,
          tags:              mergedTags,
        },
      }),
    })

    if (!updateRes.ok) {
      const updateData = await updateRes.json()
      console.error('[Subscribe] update failed:', JSON.stringify(updateData))
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  }

  console.error('[Subscribe] unexpected error:', JSON.stringify(createData))
  return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
}
