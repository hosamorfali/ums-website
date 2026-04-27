import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const shop  = searchParams.get('shop')

  if (!code || !shop) {
    return NextResponse.json({ error: 'Missing code or shop param' }, { status: 400 })
  }

  const clientId     = process.env.SHOPIFY_API_KEY
  const clientSecret = process.env.SHOPIFY_API_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'SHOPIFY_API_KEY or SHOPIFY_API_SECRET not set' }, { status: 500 })
  }

  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     clientId,
      client_secret: clientSecret,
      code,
    }),
  })

  const data = await res.json()

  if (!res.ok || !data.access_token) {
    return NextResponse.json({ error: 'Token exchange failed', detail: data }, { status: 500 })
  }

  const token = data.access_token as string
  const scope = data.scope ?? '(none)'

  return new NextResponse(
    `<!DOCTYPE html><html><body style="font-family:monospace;padding:40px;background:#1A1918;color:#AB9C7D">
<h2 style="color:#fff">Shopify Offline Token — copy this into .env.local</h2>
<p style="color:#888">Scope granted: <strong style="color:#AB9C7D">${scope}</strong></p>
<pre style="background:#111;padding:20px;border:1px solid #5D523C;border-radius:6px;word-break:break-all;color:#e5e5e5">SHOPIFY_ADMIN_API_TOKEN=${token}</pre>
<p style="color:#888;margin-top:24px">1. Open <code>.env.local</code><br>2. Add the line above<br>3. Restart the dev server</p>
</body></html>`,
    { headers: { 'Content-Type': 'text/html' } },
  )
}
