'use client'

import { useEffect, useRef } from 'react'
import { m } from 'framer-motion'
import { X } from 'lucide-react'
import type { CartItem } from '@/lib/cart-context'

interface Props {
  items:     CartItem[]
  email:     string
  onClose:   () => void
  onSuccess?: () => void
}

let _scriptLoaded = false
let _pending: (() => void)[] = []

function loadMoyasar(cb: () => void) {
  if (typeof window === 'undefined') return
  if ((window as { Moyasar?: unknown }).Moyasar) { cb(); return }
  _pending.push(cb)
  if (_scriptLoaded) return
  _scriptLoaded = true

  const link  = document.createElement('link')
  link.rel    = 'stylesheet'
  link.href   = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css'
  document.head.appendChild(link)

  const script  = document.createElement('script')
  script.src    = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js'
  script.onload = () => { _pending.forEach(fn => fn()); _pending = [] }
  document.head.appendChild(script)
}

export function MoyasarCheckout({ items, email, onClose, onSuccess }: Props) {
  const formId  = 'ums-mysr-form'
  const initRef = useRef(false)

  const total       = items.reduce((s, i) => s + i.template.price, 0)
  const description = items.map(i => i.template.name).join(', ')

  useEffect(() => {
    if (initRef.current || items.length === 0) return
    loadMoyasar(() => {
      const el = document.getElementById(formId)
      if (!el) return
      const w = window as { Moyasar?: { init: (o: Record<string, unknown>) => void } }
      if (!w.Moyasar) return
      initRef.current = true

      // Persist checkout data for the callback page
      sessionStorage.setItem('ums_checkout', JSON.stringify({
        email,
        items: items.map(i => ({
          id:    i.template.id,
          name:  i.template.name,
          price: i.template.price,
          shopifyVariantId: i.template.shopifyVariantId,
        })),
        total,
        ts: Date.now(),
      }))

      w.Moyasar.init({
        element:             `#${formId}`,
        amount:              total * 100,
        currency:            'SAR',
        description,
        publishable_api_key: process.env.NEXT_PUBLIC_MOYASAR_PUBLIC_KEY,
        callback_url:        `${window.location.origin}/checkout`,
        methods:             ['creditcard', 'applepay', 'stcpay'],
        on_completed:        () => { onSuccess?.() },
      })
    })
  }, [items, email, total, description, onSuccess])

  return (
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

        {/* Moyasar form */}
        <div className="p-6">
          <div id={formId} />
        </div>
      </m.div>
    </m.div>
  )
}
