'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

interface CheckoutData {
  email: string
  items: { id: string; name: string; price: number; shopifyVariantId: string }[]
  total: number
  ts:    number
}

type State = 'loading' | 'success' | 'failed' | 'error'

export function CheckoutContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [state,   setState]   = useState<State>('loading')
  const [message, setMessage] = useState('')

  const status    = searchParams.get('status')
  const paymentId = searchParams.get('id')

  useEffect(() => {
    if (status !== 'paid' && status !== 'authorized') {
      setState('failed')
      setMessage(searchParams.get('message') ?? 'Your payment could not be processed. No charge has been made.')
      return
    }

    const raw = sessionStorage.getItem('ums_checkout')
    if (!raw) {
      // Payment succeeded but session data lost — still show success
      clearCart()
      setState('success')
      return
    }

    const data: CheckoutData = JSON.parse(raw)
    sessionStorage.removeItem('ums_checkout')
    clearCart()

    // Create Shopify order
    fetch('/api/create-order', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: data.email, items: data.items, total: data.total }),
    })
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          console.error('Order creation error:', json)
          // Still show success to the customer — payment went through
        }
        setState('success')
      })
      .catch(err => {
        console.error('Order creation fetch failed:', err)
        setState('success') // Payment is confirmed; order issue is internal
      })
  }, [status, searchParams, clearCart, paymentId])

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1A1918' }}>
        <p className="text-sm animate-pulse" style={{ color: '#888073' }}>Confirming your payment…</p>
      </div>
    )
  }

  const paid = state === 'success'

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#1A1918' }}>
      <div
        className="flex flex-col items-center gap-6 text-center max-w-md w-full rounded-2xl p-10"
        style={{ border: `1px solid ${paid ? '#AB9C7D' : '#5D523C'}`, background: '#1A1918' }}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-full text-xl font-bold"
          style={{
            background: paid ? 'rgba(171,156,125,0.12)' : 'rgba(93,82,60,0.2)',
            color: paid ? '#AB9C7D' : '#5D523C',
          }}>
          {paid ? '✓' : '✕'}
        </div>

        {/* Title */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-2" style={{ color: '#AB9C7D' }}>
            {paid ? 'Payment Confirmed' : 'Payment Unsuccessful'}
          </p>
          <h1 className="text-xl font-bold text-white">
            {paid ? 'Your purchase is complete.' : 'Something went wrong.'}
          </h1>
        </div>

        {/* Body */}
        <p className="text-sm leading-relaxed" style={{ color: '#888073' }}>
          {paid
            ? 'Your template files are on their way to your email. Check your inbox — and your spam folder just in case. Each file is delivered as a secure download link.'
            : (message || 'Your payment could not be processed. No charge has been made. Please try again or contact us at info@ums-solutions.com.')}
        </p>

        <Link
          href="/store"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90"
          style={{ background: '#AB9C7D', color: '#1A1918' }}
        >
          {paid ? 'Back to Store' : 'Try Again'}
        </Link>
      </div>
    </div>
  )
}
