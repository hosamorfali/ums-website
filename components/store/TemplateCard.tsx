'use client'

import { useState, useRef, useCallback } from 'react'
import { m, useDragControls } from 'framer-motion'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ChevronUp, ShoppingCart } from 'lucide-react'
import { createCart, addToCart } from '@/lib/shopify'
import { getTemplateById, KIT_INCLUDES, KIT_OPENING, type Template } from '@/lib/store-data'

interface Props {
  template: Template
  onClose: () => void
  onPairsWithClick: (templateId: string) => void
  onPrev?: () => void
  onNext?: () => void
}

const NAV_BTN: React.CSSProperties = {
  position:   'absolute',
  top:        '50%',
  transform:  'translateY(-50%)',
  display:    'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width:      40,
  height:     40,
  borderRadius: '50%',
  background: 'rgba(26,25,24,0.88)',
  border:     '1px solid #5D523C',
  color:      '#AB9C7D',
  cursor:     'pointer',
  zIndex:     10,
}

export function TemplateCard({ template, onClose, onPairsWithClick, onPrev, onNext }: Props) {
  const [expanded,    setExpanded]    = useState(false)
  const [imgIndex,    setImgIndex]    = useState(0)
  const [cartLoading, setCartLoading] = useState(false)

  const constraintsRef = useRef<HTMLDivElement>(null)
  const dragControls   = useDragControls()

  // Reset state when template changes
  const prevId = useRef(template.id)
  if (template.id !== prevId.current) {
    prevId.current = template.id
    setImgIndex(0)
    setExpanded(false)
  }

  const handleAddToCart = useCallback(async () => {
    if (!template.shopifyVariantId) {
      window.location.href = `mailto:info@ums-solutions.com?subject=Purchase Request: ${template.name}&body=I would like to purchase ${template.name} (SAR ${template.price})`
      return
    }
    setCartLoading(true)
    try {
      const cartRes = await createCart()
      const cartId  = cartRes.data.cartCreate.cart.id
      const lineRes = await addToCart(cartId, template.shopifyVariantId)
      window.location.href = lineRes.data.cartLinesAdd.cart.checkoutUrl
    } catch {
      window.location.href = `mailto:info@ums-solutions.com?subject=Purchase Request: ${template.name}`
    } finally {
      setCartLoading(false)
    }
  }, [template])

  const pairedTemplates = template.pairsWith.map(id => getTemplateById(id)).filter(Boolean) as Template[]
  const kitTemplate     = template.isKit ? null : getTemplateById('strategic-direction-kit')

  const images  = template.images
  const prevImg = () => setImgIndex(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setImgIndex(i => (i + 1) % images.length)

  // ── Outer: fixed full-screen centering wrapper (opacity transition via AnimatePresence)
  return (
    <m.div
      ref={constraintsRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{    opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position:      'fixed',
        inset:         0,
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
        zIndex:        9999,
        pointerEvents: 'none',
      }}
    >
      {/* ── Inner: draggable element (scale transition) */}
      <m.div
        drag
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0}
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        exit={{    scale: 0.92 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{
          position:      'relative',
          display:       'flex',
          alignItems:    'center',
          userSelect:    'none',
          pointerEvents: 'all',
        }}
      >
        {/* Left nav arrow — sits outside card left edge, moves with card */}
        {onPrev && (
          <button
            onClick={e => { e.stopPropagation(); onPrev() }}
            style={{ ...NAV_BTN, right: 'calc(100% + 12px)' }}
            aria-label="Previous template"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* ── Card visual ── */}
        <div
          style={{
            width:      360,
            maxHeight:  '85vh',
            background: '#1A1918',
            border:     '1px solid #5D523C',
            borderRadius: 16,
            overflowX:  'hidden',
            overflowY:  'auto',
            position:   'relative',
          }}
        >
          {/* Drag handle — primary drag area */}
          <div
            onPointerDown={e => dragControls.start(e)}
            className="flex items-center justify-center pt-3 pb-1"
            style={{ borderBottom: '1px solid #2A2825', cursor: 'grab' }}
          >
            <div className="w-8 h-1 rounded-full bg-ums-border" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex items-center justify-center w-7 h-7 rounded-full hover:bg-ums-border/40 transition-colors"
            style={{ color: '#888073', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>

          {/* Preview image — drag from here too; gallery always visible */}
          <div
            onPointerDown={e => dragControls.start(e)}
            className="relative w-full"
            style={{ aspectRatio: '16/9', background: '#201F1D', cursor: 'grab' }}
          >
            {images.length > 0 ? (
              <>
                <Image
                  src={images[imgIndex]}
                  alt={template.shortName}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {images.length > 1 && (
                  <>
                    <button
                      onPointerDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); prevImg() }}
                      className="absolute left-2 bottom-8 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                      style={{ cursor: 'pointer' }}
                    >
                      <ChevronLeft size={14} className="text-white" />
                    </button>
                    <button
                      onPointerDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); nextImg() }}
                      className="absolute right-2 bottom-8 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                      style={{ cursor: 'pointer' }}
                    >
                      <ChevronRight size={14} className="text-white" />
                    </button>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onPointerDown={e => e.stopPropagation()}
                          onClick={e => { e.stopPropagation(); setImgIndex(i) }}
                          className="w-1.5 h-1.5 rounded-full transition-all"
                          style={{ background: i === imgIndex ? '#AB9C7D' : 'rgba(171,156,125,0.35)' }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-ums-muted text-xs">Preview coming soon</span>
              </div>
            )}
          </div>

          {/* Content — scrollable, no drag interference */}
          <div className="p-5 flex flex-col gap-4" style={{ cursor: 'default' }}>
            {/* Category + name */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ums-gold mb-1.5">
                {template.isKit ? 'Bundle Kit' : 'Strategy'}
              </p>
              <h2 className="text-base font-bold text-white leading-snug">
                {template.name}
              </h2>
            </div>

            {/* Kit opening / tagline */}
            {template.isKit ? (
              <p className="text-xs leading-relaxed text-ums-muted">{KIT_OPENING}</p>
            ) : (
              <p className="text-xs leading-relaxed text-ums-muted line-clamp-2">{template.tagline}</p>
            )}

            {/* Kit contents */}
            {template.isKit && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ums-gold mb-2">Contains</p>
                <ul className="flex flex-col gap-1">
                  {KIT_INCLUDES.map(name => (
                    <li key={name} className="text-xs text-ums-muted flex items-start gap-1.5">
                      <span className="text-ums-gold mt-0.5">·</span>{name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-ums-gold">SAR {template.price.toLocaleString()}</span>
              {template.isKit && (
                <span className="text-xs text-ums-muted">· Save SAR 600 vs buying individually</span>
              )}
            </div>

            {/* ── State 1 buttons ── */}
            {!expanded && (
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
                  style={{ background: '#AB9C7D', color: '#1A1918' }}
                >
                  <ShoppingCart size={12} />
                  {cartLoading ? 'Adding…' : 'Add to Cart'}
                </button>
                {!template.isKit && (
                  <button
                    onClick={() => setExpanded(true)}
                    className="flex-1 rounded-md py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors hover:bg-ums-gold/10"
                    style={{ border: '1px solid #AB9C7D', color: '#AB9C7D' }}
                  >
                    Learn More
                  </button>
                )}
              </div>
            )}

            {/* ── State 2 expanded content ── */}
            {expanded && (
              <div className="flex flex-col gap-4">
                {/* Built For */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ums-gold mb-2">Built For</p>
                  <div className="flex flex-wrap gap-1.5">
                    {template.builtFor.map(b => (
                      <span
                        key={b}
                        className="text-[10px] rounded-full px-2.5 py-1 leading-tight"
                        style={{ border: '1px solid #5D523C', color: '#AB9C7D' }}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* What You Receive */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ums-gold mb-2">What You Receive</p>
                  <ul className="flex flex-col gap-1">
                    {['The empty template', 'A filled example', 'A structured presentation'].map(item => (
                      <li key={item} className="text-xs text-ums-muted flex items-center gap-1.5">
                        <span className="text-ums-gold">·</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pairs With */}
                {!template.isKit && (pairedTemplates.length > 0 || kitTemplate) && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ums-gold mb-2">Pairs With</p>
                    <div className="flex flex-col gap-2">
                      {pairedTemplates.map(pt => (
                        <button
                          key={pt.id}
                          onClick={() => onPairsWithClick(pt.id)}
                          className="text-left text-xs rounded-md px-3 py-2 transition-all hover:border-ums-gold/60 hover:text-ums-gold cursor-pointer"
                          style={{ border: '1px solid #5D523C', color: '#888073' }}
                        >
                          {pt.name}
                        </button>
                      ))}
                      {kitTemplate && (
                        <button
                          onClick={() => onPairsWithClick(kitTemplate.id)}
                          className="text-left text-xs rounded-md px-3 py-2 transition-all hover:border-ums-gold/60 hover:text-ums-gold cursor-pointer"
                          style={{ border: '1px solid #5D523C', color: '#888073' }}
                        >
                          {kitTemplate.name} <span className="text-ums-gold ml-1">Bundle</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Full-width Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-md py-3 text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
                  style={{ background: '#AB9C7D', color: '#1A1918' }}
                >
                  <ShoppingCart size={12} />
                  {cartLoading ? 'Adding…' : `Add to Cart — SAR ${template.price.toLocaleString()}`}
                </button>

                <p className="text-center text-xs text-ums-muted">Learn it. Apply it. Own it.</p>
                <p className="text-center text-[10px]" style={{ color: '#3A342A' }}>
                  Complexity into Clarity. Crafted to Impress.
                </p>

                {/* Collapse */}
                <button
                  onClick={() => setExpanded(false)}
                  className="flex items-center justify-center gap-1 text-xs text-ums-muted hover:text-ums-gold transition-colors"
                >
                  <ChevronUp size={12} />
                  Show less
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right nav arrow — sits outside card right edge, moves with card */}
        {onNext && (
          <button
            onClick={e => { e.stopPropagation(); onNext() }}
            style={{ ...NAV_BTN, left: 'calc(100% + 12px)' }}
            aria-label="Next template"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </m.div>
    </m.div>
  )
}
