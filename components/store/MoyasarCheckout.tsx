'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { m } from 'framer-motion'
import { X } from 'lucide-react'
import type { CartItem } from '@/lib/cart-context'

interface Props {
  items:     CartItem[]
  email:     string
  onClose:   () => void
  onSuccess?: () => void
}

const MOYASAR_CSS = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css'
const MOYASAR_JS  = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js'

export function MoyasarCheckout({ items, email, onClose, onSuccess }: Props) {
  const [scriptReady, setScriptReady] = useState(false)
  const initDone = useRef(false)

  const total       = items.reduce((s, i) => s + i.template.price, 0)
  const description = items.map(i => i.template.name).join(', ')

  // Runs once the Moyasar script signals it's loaded
  function initMoyasar() {
    if (initDone.current) return
    const w = window as { Moyasar?: { init: (o: Record<string, unknown>) => void } }
    if (!w.Moyasar) {
      console.error('[Moyasar] window.Moyasar is not defined after script load')
      return
    }

    const el = document.querySelector('.mysr-form')
    if (!el) {
      console.error('[Moyasar] .mysr-form element not found in DOM')
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLIC_KEY
    console.log('[Moyasar] API key present:', !!apiKey, '| amount (halalas):', total * 100)

    if (!apiKey) {
      console.error('[Moyasar] NEXT_PUBLIC_MOYASAR_PUBLIC_KEY is undefined — check .env.local')
      return
    }

    initDone.current = true
    console.log('[Moyasar] calling Moyasar.init()')

    sessionStorage.setItem('ums_checkout', JSON.stringify({
      email,
      items: items.map(i => ({
        id:               i.template.id,
        name:             i.template.name,
        price:            i.template.price,
        shopifyVariantId: i.template.shopifyVariantId,
      })),
      total,
      ts: Date.now(),
    }))

    try {
      w.Moyasar.init({
        element:             '.mysr-form',
        amount:              total * 100,
        currency:            'SAR',
        description,
        publishable_api_key: apiKey,
        callback_url:        `${window.location.origin}/checkout`,
        methods:             ['creditcard'],
        apple_pay: {
          country: 'SA',
          label:   'UMS Template Store',
          validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
        },
        on_completed: () => { onSuccess?.() },
      })
      console.log('[Moyasar] init() called successfully')
    } catch (err) {
      console.error('[Moyasar] init() threw an error:', err)
    }
  }

  // If window.Moyasar already exists (script loaded in a previous checkout),
  // onLoad won't fire again — kick off init directly on mount.
  useEffect(() => {
    const w = window as { Moyasar?: unknown }
    if (w.Moyasar) {
      console.log('[Moyasar] already on window at mount — init directly')
      setScriptReady(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!scriptReady) return
    initMoyasar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady])

  return (
    <>
      {/* Moyasar CSS */}
      <link rel="stylesheet" href={MOYASAR_CSS} />

      {/* Moyasar JS — onLoad fires once per page load */}
      <Script
        src={MOYASAR_JS}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[Moyasar] script onLoad fired')
          setScriptReady(true)
        }}
        onError={(e) => console.error('[Moyasar] script failed to load', e)}
      />

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 99998,
          background: 'rgba(26,25,24,0.96)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px 16px',
        }}
      >
        <m.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 460,
            background: '#1A1918', border: '1px solid #5D523C',
            borderRadius: 16, overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid #5D523C' }}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ums-gold mb-0.5">
                Secure Checkout
              </p>
              <p className="text-sm text-white">
                {items.length} item{items.length !== 1 ? 's' : ''} ·{' '}
                <span style={{ color: '#AB9C7D' }}>SAR {total.toLocaleString()}</span>
              </p>
            </div>
            <button onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 transition-colors"
              style={{ color: '#888073', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>

          {/* Moyasar form — white surface so widget text/inputs are visible */}
          <div className="p-3 sm:p-6">
            <div style={{ background: '#ffffff', borderRadius: 10, padding: '16px 12px' }}>
              <div className="mysr-form" />
            </div>
          </div>
        </m.div>
      </m.div>
    </>
  )
}
