'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import Image from 'next/image'
import { X, Trash2, ArrowRight, Package } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { getTemplateById, type Template } from '@/lib/store-data'
import { MoyasarCheckout } from './MoyasarCheckout'

interface Props {
  onOpenTemplate: (templateId: string) => void
}

const KIT_ID = 'strategic-direction-kit'

type Step = 'cart' | 'email' | 'paying'

export function CartDrawer({ onOpenTemplate }: Props) {
  const { items, removeItem, clearCart, drawerOpen, closeDrawer, totalPrice } = useCart()
  const [step,  setStep]  = useState<Step>('cart')
  const [email, setEmail] = useState('')
  const [emailErr, setEmailErr] = useState('')

  const cartItemIds = new Set(items.map(i => i.template.id))
  const kitInCart   = cartItemIds.has(KIT_ID)
  const kitTemplate = getTemplateById(KIT_ID)!

  const handleClose = useCallback(() => {
    closeDrawer()
    setStep('cart')
    setEmailErr('')
  }, [closeDrawer])

  const handleTemplateClick = useCallback((id: string) => {
    handleClose()
    onOpenTemplate(id)
  }, [handleClose, onOpenTemplate])

  const handleCheckout = () => {
    setStep('email')
    setEmailErr('')
  }

  const handleEmailConfirm = () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!valid) { setEmailErr('Please enter a valid email address.'); return }
    setEmailErr('')
    setStep('paying')
  }

  const handlePaymentClose = () => {
    setStep('email')
  }

  return (
    <>
      <AnimatePresence>
        {drawerOpen && step !== 'paying' && (
          <>
            {/* Backdrop */}
            <m.div
              key="cart-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleClose}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                zIndex: 9990,
              }}
            />

            {/* Panel */}
            <m.div
              key="cart-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0, 0.16, 1] }}
              style={{
                position:  'fixed',
                top:       0,
                right:     0,
                bottom:    0,
                width:     400,
                maxWidth:  '100vw',
                background:'#1A1918',
                borderLeft:'1px solid #5D523C',
                zIndex:    9991,
                display:   'flex',
                flexDirection: 'column',
              }}
            >
              {/* ── Step: cart ── */}
              {step === 'cart' && (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #5D523C' }}>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-white">
                      Cart {items.length > 0 && <span style={{ color: '#AB9C7D' }}>({items.length})</span>}
                    </p>
                    <button onClick={handleClose} style={{ color: '#888073', cursor: 'pointer' }}
                      className="hover:text-ums-gold transition-colors">
                      <X size={16} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
                        <Package size={32} style={{ color: '#5D523C' }} />
                        <p className="text-sm" style={{ color: '#888073' }}>Your cart is empty.</p>
                        <p className="text-xs" style={{ color: '#5D523C' }}>Browse the store to find a framework.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {items.map((item) => {
                          const t = item.template
                          const pairedIds = t.pairsWith ?? []
                          const pairedSuggestions = pairedIds
                            .map(id => getTemplateById(id))
                            .filter((p): p is Template => !!p && !cartItemIds.has(p.id))

                          return (
                            <div key={t.id} style={{ borderBottom: '1px solid #2A2825' }}>
                              {/* Item row */}
                              <div className="flex items-start gap-3 px-5 py-4">
                                {/* Thumbnail */}
                                <div className="relative shrink-0 rounded overflow-hidden"
                                  style={{ width: 64, height: 44, background: '#201F1D', border: '1px solid #5D523C' }}>
                                  {t.images[0] ? (
                                    <Image src={t.images[0]} alt={t.shortName} fill className="object-cover" unoptimized />
                                  ) : null}
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-white leading-snug line-clamp-2">{t.name}</p>
                                  <p className="text-xs font-bold mt-1" style={{ color: '#AB9C7D' }}>
                                    SAR {t.price.toLocaleString()}
                                  </p>
                                </div>
                                {/* Remove */}
                                <button
                                  onClick={() => removeItem(t.id)}
                                  className="shrink-0 hover:text-red-400 transition-colors"
                                  style={{ color: '#5D523C', cursor: 'pointer' }}
                                  aria-label="Remove item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {/* Per-item upsell: pairs with */}
                              {pairedSuggestions.length > 0 && (
                                <div className="px-5 pb-3">
                                  {pairedSuggestions.map(pt => (
                                    <button
                                      key={pt.id}
                                      onClick={() => handleTemplateClick(pt.id)}
                                      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-left transition-colors hover:border-ums-gold/50"
                                      style={{ border: '1px solid #3A342A', cursor: 'pointer' }}
                                    >
                                      <div className="min-w-0">
                                        <p className="text-[9px] uppercase tracking-[0.18em] mb-0.5" style={{ color: '#5D523C' }}>
                                          Pairs With
                                        </p>
                                        <p className="text-xs text-white truncate">{pt.shortName}</p>
                                      </div>
                                      <ArrowRight size={11} style={{ color: '#5D523C', flexShrink: 0 }} />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Bundle upsell */}
                        {!kitInCart && kitTemplate && (
                          <div className="px-5 py-4" style={{ borderBottom: '1px solid #2A2825' }}>
                            <button
                              onClick={() => handleTemplateClick(KIT_ID)}
                              className="w-full flex items-start gap-3 px-4 py-3 rounded-lg text-left transition-all hover:border-ums-gold/50"
                              style={{ border: '1px solid #5D523C', background: 'rgba(171,156,125,0.04)', cursor: 'pointer' }}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: '#AB9C7D' }}>
                                  Bundle Upgrade
                                </p>
                                <p className="text-xs font-semibold text-white leading-snug">{kitTemplate.name}</p>
                                <p className="text-xs mt-1" style={{ color: '#888073' }}>
                                  SAR {kitTemplate.price.toLocaleString()} · Save SAR 600 vs individual
                                </p>
                              </div>
                              <ArrowRight size={13} style={{ color: '#AB9C7D', marginTop: 2 }} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {items.length > 0 && (
                    <div className="px-6 py-5" style={{ borderTop: '1px solid #5D523C' }}>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs uppercase tracking-[0.15em]" style={{ color: '#888073' }}>Total</p>
                        <p className="text-base font-bold" style={{ color: '#AB9C7D' }}>
                          SAR {totalPrice.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full py-3 rounded-md text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90"
                        style={{ background: '#AB9C7D', color: '#1A1918', cursor: 'pointer' }}
                      >
                        Checkout
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ── Step: email ── */}
              {step === 'email' && (
                <>
                  <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #5D523C' }}>
                    <button
                      onClick={() => setStep('cart')}
                      className="text-xs text-ums-muted hover:text-ums-gold transition-colors flex items-center gap-1"
                      style={{ cursor: 'pointer' }}
                    >
                      ← Back
                    </button>
                    <button onClick={handleClose} style={{ color: '#888073', cursor: 'pointer' }}
                      className="hover:text-ums-gold transition-colors">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col justify-center px-8 gap-6">
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Where should we send your files?</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#888073' }}>
                        Please enter your email so we can send you your files after purchase.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setEmailErr('') }}
                        placeholder="your@email.com"
                        className="w-full rounded-md px-4 py-3 text-sm text-white placeholder-ums-muted bg-transparent outline-none focus:border-ums-gold/60 transition-colors"
                        style={{ border: '1px solid #5D523C' }}
                        onKeyDown={e => e.key === 'Enter' && handleEmailConfirm()}
                        autoFocus
                      />
                      {emailErr && (
                        <p className="text-xs text-red-400">{emailErr}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs" style={{ color: '#888073' }}>
                        <span>Total</span>
                        <span className="font-bold" style={{ color: '#AB9C7D' }}>SAR {totalPrice.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={handleEmailConfirm}
                        className="w-full py-3 rounded-md text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90"
                        style={{ background: '#AB9C7D', color: '#1A1918', cursor: 'pointer' }}
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                </>
              )}
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Step: paying (full-screen Moyasar modal) ── */}
      <AnimatePresence>
        {drawerOpen && step === 'paying' && (
          <MoyasarCheckout
            key="moyasar"
            items={items}
            email={email}
            onClose={handlePaymentClose}
            onSuccess={clearCart}
          />
        )}
      </AnimatePresence>
    </>
  )
}
