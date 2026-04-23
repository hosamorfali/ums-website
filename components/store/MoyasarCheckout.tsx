'use client'

import { useEffect, useRef } from 'react'
import { m } from 'framer-motion'
import { X } from 'lucide-react'
import type { Template } from '@/lib/store-data'

interface Props {
  template: Template
  onClose: () => void
}

// Module-level guard so script + CSS are only injected once per page load
let _scriptLoaded = false
let _pendingCallbacks: (() => void)[] = []

function loadMoyasar(cb: () => void) {
  if (typeof window === 'undefined') return
  if ((window as { Moyasar?: unknown }).Moyasar) { cb(); return }
  _pendingCallbacks.push(cb)
  if (_scriptLoaded) return
  _scriptLoaded = true

  const link = document.createElement('link')
  link.rel  = 'stylesheet'
  link.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css'
  document.head.appendChild(link)

  const script  = document.createElement('script')
  script.src    = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js'
  script.onload = () => {
    _pendingCallbacks.forEach(fn => fn())
    _pendingCallbacks = []
  }
  document.head.appendChild(script)
}

export function MoyasarCheckout({ template, onClose }: Props) {
  const formId  = `mysr-form-${template.id}`
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    loadMoyasar(() => {
      const el = document.getElementById(formId)
      if (!el) return
      const w = window as { Moyasar?: { init: (opts: Record<string, unknown>) => void } }
      if (!w.Moyasar) return
      initRef.current = true
      w.Moyasar.init({
        element:              `#${formId}`,
        amount:               template.price * 100, // SAR → halalas
        currency:             'SAR',
        description:          template.name,
        publishable_api_key:  process.env.NEXT_PUBLIC_MOYASAR_PUBLIC_KEY,
        callback_url:         `${window.location.origin}/checkout`,
        methods:              ['creditcard', 'applepay', 'stcpay'],
      })
    })
  }, [template, formId])

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         99998,
        background:     'rgba(26,25,24,0.95)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '24px 16px',
      }}
    >
      <m.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        exit={{    scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
        style={{
          width:        '100%',
          maxWidth:     460,
          background:   '#1A1918',
          border:       '1px solid #5D523C',
          borderRadius: 16,
          overflow:     'hidden',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #5D523C' }}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ums-gold mb-0.5">
              Secure Checkout
            </p>
            <p className="text-sm font-bold text-white leading-snug">{template.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-base font-bold text-ums-gold">
              SAR {template.price.toLocaleString()}
            </span>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 transition-colors"
              style={{ color: '#888073', cursor: 'pointer' }}
              aria-label="Close checkout"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Moyasar form mount point */}
        <div className="p-6">
          <div id={formId} />
        </div>
      </m.div>
    </m.div>
  )
}
