import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const token  = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN

  if (!domain || !token) {
    return NextResponse.json({ error: 'Shopify not configured' }, { status: 500 })
  }

  const res = await fetch(`https://${domain}/api/2024-07/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type':                      'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({
      query: `mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer { id }
          customerUserErrors { field message }
        }
      }`,
      variables: {
        input: {
          email,
          password:         crypto.randomUUID(),
          acceptsMarketing: true,
        },
      },
    }),
  })

  if (!res.ok) {
    console.error('[Subscribe] Storefront API HTTP error:', res.status)
    return NextResponse.json({ error: 'Shopify error' }, { status: 500 })
  }

  const body   = await res.json()
  const errors: { field: string; message: string }[] =
    body.data?.customerCreate?.customerUserErrors ?? []

  // "Email has already been taken" = already subscribed — treat as success
  const fatal = errors.filter(e =>
    !e.message.toLowerCase().includes('taken') &&
    !e.message.toLowerCase().includes('already'),
  )

  if (fatal.length > 0) {
    console.error('[Subscribe] customerUserErrors:', fatal)
    return NextResponse.json({ error: fatal[0].message }, { status: 422 })
  }

  return NextResponse.json({ ok: true })
}
