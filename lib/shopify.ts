const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!
const STORE_DOMAIN    = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!
const API_VERSION     = '2024-07'

const endpoint = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`

export interface ShopifyResponse<T> {
  data: T
  errors?: { message: string }[]
}

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<ShopifyResponse<T>> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

/* ── Cart ─────────────────────────────────────────────── */

export async function createCart() {
  return shopifyFetch<{ cartCreate: { cart: { id: string; checkoutUrl: string } } }>(
    `mutation { cartCreate { cart { id checkoutUrl } } }`,
  )
}

export async function addToCart(cartId: string, variantId: string, quantity = 1) {
  return shopifyFetch<{
    cartLinesAdd: { cart: { id: string; checkoutUrl: string; totalQuantity: number } }
  }>(
    `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { id checkoutUrl totalQuantity }
      }
    }`,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] },
  )
}

/* ── Email subscriber (navbar-subscriber / website-subscriber) ── */

export async function subscribeEmail(email: string, tag: string) {
  return shopifyFetch<{
    customerCreate: { customer: { id: string } | null; customerUserErrors: { message: string }[] }
  }>(
    `mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id }
        customerUserErrors { message }
      }
    }`,
    { input: { email, tags: [tag], acceptsMarketing: true } },
  )
}
