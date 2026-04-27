import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const clientId = process.env.SHOPIFY_API_KEY
  const domain   = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

  if (!clientId || !domain) {
    return NextResponse.json({ error: 'SHOPIFY_API_KEY or SHOPIFY_STORE_DOMAIN not set' }, { status: 500 })
  }

  const host        = req.headers.get('host') ?? 'localhost:3000'
  const protocol    = host.startsWith('localhost') ? 'http' : 'https'
  const redirectUri = `${protocol}://${host}/api/shopify/callback`

  const scopes = [
    'write_orders',
    'read_orders',
    'read_products',
    'write_fulfillments',
  ].join(',')

  const authUrl =
    `https://${domain}/admin/oauth/authorize` +
    `?client_id=${clientId}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&grant_options[]=offline`

  return NextResponse.redirect(authUrl)
}
