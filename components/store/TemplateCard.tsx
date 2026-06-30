'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { m, useDragControls, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ChevronUp, ShoppingCart, ZoomIn } from 'lucide-react'
import { getTemplateById, getKitForCategory, KIT_DETAILS, CATEGORIES, TEMPLATES, type Template } from '@/lib/store-data'
import { useCart } from '@/lib/cart-context'

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
  background: '#AB9C7D',
  border:     'none',
  color:      '#1A1918',
  cursor:     'pointer',
  zIndex:     10,
}

export function TemplateCard({ template, onClose, onPairsWithClick, onPrev, onNext }: Props) {
  const [expanded,     setExpanded]     = useState(false)
  const [imgIndex,     setImgIndex]     = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx,  setLightboxIdx]  = useState(0)
  const [addedFlash,   setAddedFlash]   = useState(false)

  const { addItem, items: cartItems, openDrawer } = useCart()
  const inCart = cartItems.some(i => i.template.id === template.id)

  const constraintsRef     = useRef<HTMLDivElement>(null)
  const dragControls       = useDragControls()
  const touchStartX        = useRef(0)
  const touchStartY        = useRef(0)
  const backdropTouchStart = useRef<{ x: number; y: number } | null>(null)

  // Global multi-touch guard.
  // multiTouchActiveRef: true while ≥2 fingers are anywhere on screen.
  // multiTouchEndTimeRef: timestamp of the last multi-touch release.
  //   Used to block the browser's synthetic click that fires ~300ms after
  //   a pinch ends — by that point multiTouchActiveRef is already false,
  //   so we need the timestamp to detect "was this click born from a pinch?"
  const multiTouchActiveRef  = useRef(false)
  const multiTouchEndTimeRef = useRef(0)

  // ── Card preview image — pinch-zoom state ────────────────────────────────
  const imgScaleRef         = useRef(1)
  const imgTransXRef        = useRef(0)
  const imgTransYRef        = useRef(0)
  const pinchInitDistRef    = useRef(0)
  const pinchInitScaleRef   = useRef(1)
  const panStartXRef        = useRef(0)
  const panStartYRef        = useRef(0)
  const panStartTransXRef   = useRef(0)
  const panStartTransYRef   = useRef(0)
  const imageWrapRef        = useRef<HTMLDivElement>(null)
  const imgInnerRef         = useRef<HTMLDivElement>(null)

  // ── Lightbox image — pinch-zoom state ────────────────────────────────────
  const lbImgScaleRef       = useRef(1)
  const lbImgTransXRef      = useRef(0)
  const lbImgTransYRef      = useRef(0)
  const lbPinchInitDistRef  = useRef(0)
  const lbPinchInitScaleRef = useRef(1)
  const lbPanStartXRef      = useRef(0)
  const lbPanStartYRef      = useRef(0)
  const lbPanStartTransXRef = useRef(0)
  const lbPanStartTransYRef = useRef(0)
  const lbImageWrapRef      = useRef<HTMLDivElement>(null)
  const lbImgInnerRef       = useRef<HTMLDivElement>(null)

  // Reset state when template changes
  const prevId = useRef(template.id)
  if (template.id !== prevId.current) {
    prevId.current = template.id
    setImgIndex(0)
    setExpanded(false)
    setLightboxOpen(false)
    setAddedFlash(false)
    imgScaleRef.current  = 1
    imgTransXRef.current = 0
    imgTransYRef.current = 0
    if (imgInnerRef.current) imgInnerRef.current.style.transform = ''
  }

  const handleAddToCart = useCallback(() => {
    addItem(template)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose()
      openDrawer()
      return
    }
    setAddedFlash(true)
    setTimeout(() => setAddedFlash(false), 1500)
  }, [template, addItem, onClose, openDrawer])

  const pairedTemplates = template.pairsWith.map(id => getTemplateById(id)).filter(Boolean) as Template[]
  const kitTemplate     = template.isKit ? null : getKitForCategory(template.category)
  const categoryLabel   = CATEGORIES.find(c => c.id === template.category)?.name ?? template.category
  const kitContent      = KIT_DETAILS[template.isKit ? template.id : (kitTemplate?.id ?? '')]
  const kitSavings      = template.isKit
    ? TEMPLATES.filter(t => t.category === template.category && !t.isKit).reduce((s, t) => s + t.price, 0) - template.price
    : 0

  const images  = template.images
  const prevImg = () => setImgIndex(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setImgIndex(i => (i + 1) % images.length)

  const openLightbox = useCallback((idx: number) => {
    setLightboxIdx(idx)
    setLightboxOpen(true)
  }, [])

  const resetLbZoom = useCallback(() => {
    lbImgScaleRef.current  = 1
    lbImgTransXRef.current = 0
    lbImgTransYRef.current = 0
    if (lbImgInnerRef.current) lbImgInnerRef.current.style.transform = ''
    if (lbImageWrapRef.current) lbImageWrapRef.current.style.cursor = 'default'
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    resetLbZoom()
  }, [resetLbZoom])

  // Reset lightbox zoom whenever the image index changes
  const lbPrev = useCallback(() => {
    setLightboxIdx(i => (i - 1 + images.length) % images.length)
    resetLbZoom()
  }, [images.length, resetLbZoom])

  const lbNext = useCallback(() => {
    setLightboxIdx(i => (i + 1) % images.length)
    resetLbZoom()
  }, [images.length, resetLbZoom])

  // Lock background scroll on mobile while card is open
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 768) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      closeLightbox()
      if (e.key === 'ArrowLeft')   lbPrev()
      if (e.key === 'ArrowRight')  lbNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, closeLightbox, lbPrev, lbNext])

  // Global multi-touch tracker — fires on document so it catches every finger
  // regardless of which element each touch lands on.
  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (e.touches.length > 1) multiTouchActiveRef.current = true
    }
    const onEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        // Record the time the last pinch ended so onClick handlers can block
        // the browser's synthetic click that fires ~300ms later.
        if (multiTouchActiveRef.current) multiTouchEndTimeRef.current = Date.now()
        multiTouchActiveRef.current = false
      }
    }
    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchend',   onEnd,   { passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchend',   onEnd)
    }
  }, [])

  // Pinch-zoom + pan on the card preview image.
  useEffect(() => {
    const wrap  = imageWrapRef.current
    const inner = imgInnerRef.current
    if (!wrap || !inner) return

    const pinchDist = (t: TouchList) => {
      const dx = t[0].clientX - t[1].clientX
      const dy = t[0].clientY - t[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const apply = () => {
      inner.style.transform = `scale(${imgScaleRef.current}) translate(${imgTransXRef.current}px, ${imgTransYRef.current}px)`
      wrap.style.cursor     = imgScaleRef.current > 1 ? 'grab' : 'zoom-in'
    }

    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchInitDistRef.current  = pinchDist(e.touches)
        pinchInitScaleRef.current = imgScaleRef.current
      } else if (e.touches.length === 1 && imgScaleRef.current > 1) {
        panStartXRef.current      = e.touches[0].clientX
        panStartYRef.current      = e.touches[0].clientY
        panStartTransXRef.current = imgTransXRef.current
        panStartTransYRef.current = imgTransYRef.current
      }
    }

    const onMove = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault()
        imgScaleRef.current = Math.max(1, Math.min(4, pinchInitScaleRef.current * (pinchDist(e.touches) / pinchInitDistRef.current)))
        apply()
      } else if (e.touches.length === 1 && imgScaleRef.current > 1) {
        e.preventDefault()
        imgTransXRef.current = panStartTransXRef.current + (e.touches[0].clientX - panStartXRef.current) / imgScaleRef.current
        imgTransYRef.current = panStartTransYRef.current + (e.touches[0].clientY - panStartYRef.current) / imgScaleRef.current
        apply()
      }
    }

    const onEnd = (e: TouchEvent) => {
      if (e.touches.length === 0 && imgScaleRef.current <= 1.05) {
        imgScaleRef.current  = 1
        imgTransXRef.current = 0
        imgTransYRef.current = 0
        inner.style.transform = ''
        wrap.style.cursor     = 'zoom-in'
      } else if (e.touches.length === 1 && imgScaleRef.current > 1) {
        panStartXRef.current      = e.touches[0].clientX
        panStartYRef.current      = e.touches[0].clientY
        panStartTransXRef.current = imgTransXRef.current
        panStartTransYRef.current = imgTransYRef.current
      }
    }

    wrap.addEventListener('touchstart', onStart, { passive: true })
    wrap.addEventListener('touchmove',  onMove,  { passive: false })
    wrap.addEventListener('touchend',   onEnd,   { passive: true })

    return () => {
      wrap.removeEventListener('touchstart', onStart)
      wrap.removeEventListener('touchmove',  onMove)
      wrap.removeEventListener('touchend',   onEnd)
    }
  }, [])

  // Pinch-zoom + pan on the lightbox image.
  // Re-attaches whenever the lightbox opens (the DOM node is only present then).
  useEffect(() => {
    if (!lightboxOpen) return
    const wrap  = lbImageWrapRef.current
    const inner = lbImgInnerRef.current
    if (!wrap || !inner) return

    const pinchDist = (t: TouchList) => {
      const dx = t[0].clientX - t[1].clientX
      const dy = t[0].clientY - t[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const apply = () => {
      inner.style.transform = `scale(${lbImgScaleRef.current}) translate(${lbImgTransXRef.current}px, ${lbImgTransYRef.current}px)`
      wrap.style.cursor     = lbImgScaleRef.current > 1 ? 'grab' : 'default'
    }

    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        lbPinchInitDistRef.current  = pinchDist(e.touches)
        lbPinchInitScaleRef.current = lbImgScaleRef.current
      } else if (e.touches.length === 1 && lbImgScaleRef.current > 1) {
        lbPanStartXRef.current      = e.touches[0].clientX
        lbPanStartYRef.current      = e.touches[0].clientY
        lbPanStartTransXRef.current = lbImgTransXRef.current
        lbPanStartTransYRef.current = lbImgTransYRef.current
      }
    }

    const onMove = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault()
        lbImgScaleRef.current = Math.max(1, Math.min(4, lbPinchInitScaleRef.current * (pinchDist(e.touches) / lbPinchInitDistRef.current)))
        apply()
      } else if (e.touches.length === 1 && lbImgScaleRef.current > 1) {
        e.preventDefault()
        lbImgTransXRef.current = lbPanStartTransXRef.current + (e.touches[0].clientX - lbPanStartXRef.current) / lbImgScaleRef.current
        lbImgTransYRef.current = lbPanStartTransYRef.current + (e.touches[0].clientY - lbPanStartYRef.current) / lbImgScaleRef.current
        apply()
      }
    }

    const onEnd = (e: TouchEvent) => {
      if (e.touches.length === 0 && lbImgScaleRef.current <= 1.05) {
        lbImgScaleRef.current  = 1
        lbImgTransXRef.current = 0
        lbImgTransYRef.current = 0
        inner.style.transform  = ''
        wrap.style.cursor      = 'default'
      } else if (e.touches.length === 1 && lbImgScaleRef.current > 1) {
        lbPanStartXRef.current      = e.touches[0].clientX
        lbPanStartYRef.current      = e.touches[0].clientY
        lbPanStartTransXRef.current = lbImgTransXRef.current
        lbPanStartTransYRef.current = lbImgTransYRef.current
      }
    }

    wrap.addEventListener('touchstart', onStart, { passive: true })
    wrap.addEventListener('touchmove',  onMove,  { passive: false })
    wrap.addEventListener('touchend',   onEnd,   { passive: true })

    return () => {
      wrap.removeEventListener('touchstart', onStart)
      wrap.removeEventListener('touchmove',  onMove)
      wrap.removeEventListener('touchend',   onEnd)
    }
  }, [lightboxOpen])

  // ── Outer: fixed full-screen centering wrapper ────────────────────────────
  return (
    <>
    {/* Mobile-only backdrop — only closes on a deliberate single-finger tap */}
    <div
      className="fixed inset-0 md:hidden"
      style={{ zIndex: 9998, background: 'rgba(0,0,0,0.45)' }}
      onTouchStart={e => {
        backdropTouchStart.current = e.touches.length === 1
          ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
          : null
      }}
      onTouchEnd={e => {
        const start = backdropTouchStart.current
        if (!start || multiTouchActiveRef.current) return
        if (e.changedTouches.length !== 1) return
        const dx = Math.abs(e.changedTouches[0].clientX - start.x)
        const dy = Math.abs(e.changedTouches[0].clientY - start.y)
        if (dx < 10 && dy < 10) onClose()
      }}
    />

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
        {/* Left nav arrow — desktop only */}
        {onPrev && (
          <div className="hidden md:block">
            <button
              onClick={e => { e.stopPropagation(); onPrev() }}
              style={{ ...NAV_BTN, right: 'calc(100% + 12px)' }}
              aria-label="Previous template"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        )}

        {/* ── Card visual ── */}
        <div
          onTouchStart={e => {
            if (e.touches.length === 1) {
              touchStartX.current = e.touches[0].clientX
              touchStartY.current = e.touches[0].clientY
            }
          }}
          onTouchEnd={e => {
            if (window.innerWidth >= 768) return
            if (multiTouchActiveRef.current || e.touches.length > 0) return
            if (imgScaleRef.current > 1) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            const dy = e.changedTouches[0].clientY - touchStartY.current
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 55) {
              if (dx < 0) nextImg()
              if (dx > 0) prevImg()
            }
          }}
          style={{
            width:           360,
            maxWidth:        'calc(100vw - 24px)',
            maxHeight:       '85vh',
            background:      '#1A1918',
            border:          '1px solid #5D523C',
            borderRadius:    16,
            overflowX:       'hidden',
            overflowY:       'auto',
            overscrollBehavior: 'contain',
            position:        'relative',
          }}
        >
          {/* Drag handle — desktop drag + mobile nav row */}
          <div
            onPointerDown={e => dragControls.start(e)}
            className="flex items-center px-3 pt-3 pb-1"
            style={{ borderBottom: '1px solid #2A2825', cursor: 'grab' }}
          >
            <div className="md:hidden flex-none flex justify-start">
              {onPrev ? (
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onPrev() }}
                  className="flex items-center gap-1"
                  style={{ color: '#888073', cursor: 'pointer', padding: 4 }}
                  aria-label="Previous template"
                >
                  <ChevronLeft size={14} />
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Prev Template</span>
                </button>
              ) : <span />}
            </div>

            <div className="flex-1 flex justify-center">
              <div className="w-8 h-1 rounded-full bg-ums-border" />
            </div>

            <div className="md:hidden flex-none flex justify-end">
              {onNext ? (
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onNext() }}
                  className="flex items-center gap-1"
                  style={{ color: '#888073', cursor: 'pointer', padding: 4 }}
                  aria-label="Next template"
                >
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Next Template</span>
                  <ChevronRight size={14} />
                </button>
              ) : <span />}
            </div>

            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onClose() }}
              className="md:hidden flex-none flex items-center justify-center w-7 h-7 rounded-full hover:bg-ums-border/40 transition-colors ml-1"
              style={{ color: '#888073', cursor: 'pointer' }}
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Close button — desktop only */}
          <button
            onClick={onClose}
            className="hidden md:flex absolute top-3 right-3 z-10 items-center justify-center w-7 h-7 rounded-full hover:bg-ums-border/40 transition-colors"
            style={{ color: '#888073', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>

          {/* Preview image */}
          <div
            onPointerDown={e => dragControls.start(e)}
            className="relative w-full"
            style={{ aspectRatio: '16/9', background: '#201F1D', cursor: 'grab' }}
          >
            {images.length > 0 ? (
              <>
                <div
                  ref={imageWrapRef}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => {
                    e.stopPropagation()
                    if (imgScaleRef.current > 1) return
                    openLightbox(imgIndex)
                  }}
                  className="absolute inset-0 z-[1] group overflow-hidden"
                  style={{ cursor: 'zoom-in', touchAction: 'none' }}
                >
                  <div
                    ref={imgInnerRef}
                    style={{ width: '100%', height: '100%', transformOrigin: 'center' }}
                  >
                    <Image
                      src={images[imgIndex]}
                      alt={template.shortName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="rounded-full bg-black/50 p-2">
                      <ZoomIn size={18} className="text-white" />
                    </div>
                  </div>
                </div>
                {images.length > 1 && (
                  <>
                    <button
                      onPointerDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); prevImg() }}
                      className="absolute left-2 bottom-2 md:bottom-8 w-5 h-5 md:w-7 md:h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors z-[2]"
                      style={{ cursor: 'pointer' }}
                    >
                      <ChevronLeft className="text-white w-[11px] h-[11px] md:w-[14px] md:h-[14px]" />
                    </button>
                    <button
                      onPointerDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); nextImg() }}
                      className="absolute right-2 bottom-2 md:bottom-8 w-5 h-5 md:w-7 md:h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors z-[2]"
                      style={{ cursor: 'pointer' }}
                    >
                      <ChevronRight className="text-white w-[11px] h-[11px] md:w-[14px] md:h-[14px]" />
                    </button>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-[2]">
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

          {/* Content */}
          <div className="p-5 flex flex-col gap-4" style={{ cursor: 'default' }}>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ums-gold">
                  {template.isKit ? 'Bundle Kit' : categoryLabel}
                </p>
                {template.fileExtension && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#AB9C7D',
                    border: '0.5px solid #5D523C',
                    borderRadius: 4,
                    padding: '2px 7px',
                    lineHeight: 1.6,
                    flexShrink: 0,
                  }}>
                    {template.fileExtension}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white leading-snug">
                {template.name}
              </h2>
            </div>

            {template.isKit ? (
              <p className="text-xs leading-relaxed text-ums-muted">{kitContent?.opening ?? template.tagline}</p>
            ) : (
              <p className="text-xs leading-relaxed text-ums-muted">{template.tagline}</p>
            )}

            {template.isKit && kitContent && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ums-gold mb-2">Contains</p>
                <ul className="flex flex-col gap-1">
                  {kitContent.includes.map(name => (
                    <li key={name} className="text-xs text-ums-muted flex items-start gap-1.5">
                      <span className="text-ums-gold mt-0.5">·</span>{name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-ums-gold">SAR {template.price.toLocaleString()}</span>
              {template.isKit && kitSavings > 0 && (
                <span className="text-xs text-ums-muted">· Save SAR {kitSavings.toLocaleString()} vs buying individually</span>
              )}
            </div>

            {!expanded && (
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ background: inCart ? '#5D523C' : '#AB9C7D', color: '#1A1918' }}
                >
                  <ShoppingCart size={12} />
                  {addedFlash ? 'Added!' : inCart ? 'In Cart' : 'Add to Cart'}
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

            {expanded && (
              <div className="flex flex-col gap-4">
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

                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 rounded-md py-3 text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ background: inCart ? '#5D523C' : '#AB9C7D', color: '#1A1918' }}
                >
                  <ShoppingCart size={12} />
                  {addedFlash ? 'Added!' : inCart ? 'In Cart' : `Add to Cart — SAR ${template.price.toLocaleString()}`}
                </button>

                <p className="text-center text-xs text-ums-muted">Learn it. Apply it. Own it.</p>
                <p className="text-center text-[10px]" style={{ color: '#3A342A' }}>
                  Complexity into Clarity. Crafted to Impress.
                </p>

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

        {/* Right nav arrow — desktop only */}
        {onNext && (
          <div className="hidden md:block">
            <button
              onClick={e => { e.stopPropagation(); onNext() }}
              style={{ ...NAV_BTN, left: 'calc(100% + 12px)' }}
              aria-label="Next template"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </m.div>
    </m.div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && images.length > 0 && (
          <m.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={e => {
              // Block the synthetic click that browsers fire ~300ms after a pinch ends.
              // By that point multiTouchActiveRef is already false, so we use the
              // timestamp of the last multi-touch release as a gate instead.
              if (Date.now() - multiTouchEndTimeRef.current < 400) return
              closeLightbox()
            }}
            style={{
              position:       'fixed',
              inset:          0,
              zIndex:         99999,
              background:     'rgba(26,25,24,0.95)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}
          >
            {/* Close button */}
            <button
              onClick={e => { e.stopPropagation(); closeLightbox() }}
              className="absolute top-5 right-5 flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors"
              style={{ color: '#AB9C7D', cursor: 'pointer', zIndex: 1 }}
              aria-label="Close lightbox"
            >
              <X size={18} />
            </button>

            {/*
              lbImageWrapRef: receives the lightbox pinch-zoom useEffect listeners.
              touch-action: none so all touch events (including pinch) reach JS.
              overflow: hidden clips the image during pan/zoom.
              lbImgInnerRef: CSS transform is updated directly on every pinch/pan
              frame — no React re-renders.
            */}
            <div
              ref={lbImageWrapRef}
              onClick={e => e.stopPropagation()}
              style={{
                position:    'relative',
                maxWidth:    '90vw',
                maxHeight:   '85vh',
                width:       '100%',
                height:      '100%',
                overflow:    'hidden',
                touchAction: 'none',
              }}
            >
              <div
                ref={lbImgInnerRef}
                style={{ width: '100%', height: '100%', transformOrigin: 'center' }}
              >
                <Image
                  src={images[lightboxIdx]}
                  alt={`${template.shortName} preview ${lightboxIdx + 1}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>

            {/* Left arrow */}
            {images.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); lbPrev() }}
                className="absolute left-5 bottom-12 md:bottom-auto md:top-1/2 md:-translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
                style={{ color: '#AB9C7D', border: '1px solid #5D523C', background: 'rgba(26,25,24,0.8)', cursor: 'pointer' }}
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Right arrow */}
            {images.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); lbNext() }}
                className="absolute right-5 bottom-12 md:bottom-auto md:top-1/2 md:-translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
                style={{ color: '#AB9C7D', border: '1px solid #5D523C', background: 'rgba(26,25,24,0.8)', cursor: 'pointer' }}
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Dots */}
            {images.length > 1 && (
              <div
                onClick={e => e.stopPropagation()}
                className="absolute bottom-4 left-0 right-0 flex justify-center gap-2"
              >
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setLightboxIdx(i); resetLbZoom() }}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{ background: i === lightboxIdx ? '#AB9C7D' : 'rgba(171,156,125,0.35)', cursor: 'pointer' }}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
