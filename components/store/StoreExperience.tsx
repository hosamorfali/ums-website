'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import Image from 'next/image'
import { ArrowLeft, LayoutGrid, Network } from 'lucide-react'
import { StarsBackground } from './StarsBackground'
import { Level1Orbit } from './Level1Orbit'
import { Level2Network, type Level2NetworkHandle } from './Level2Network'
import { TemplateCard } from './TemplateCard'
import { RequestForm } from './RequestForm'
import { getTemplatesByCategory, CATEGORIES, type Template } from '@/lib/store-data'

// px from top of L2 container reserved for header + statement text
const TOP_PADDING = 130

export function StoreExperience() {
  const [view,             setView]             = useState<'L1' | 'L2'>('L1')
  const [categoryId,       setCategoryId]       = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [viewMode,         setViewMode]         = useState<'orbit' | 'grid'>('orbit')
  const networkRef = useRef<Level2NetworkHandle>(null)

  const templates    = useMemo(
    () => categoryId ? getTemplatesByCategory(categoryId) : [],
    [categoryId],
  )
  const categoryName = CATEGORIES.find(c => c.id === categoryId)?.name ?? ''

  const handleSelectCategory = useCallback((id: string) => {
    setCategoryId(id)
    setViewMode('orbit')
    setView('L2')
  }, [])

  const handleBack = useCallback(() => {
    setView('L1')
    setSelectedTemplate(null)
    setCategoryId(null)
  }, [])

  const handleNodeClick = useCallback((t: Template) => {
    setSelectedTemplate(t)
  }, [])

  const handleCloseCard = useCallback(() => {
    setSelectedTemplate(null)
  }, [])

  const handlePairsWithClick = useCallback((templateId: string) => {
    const t = templates.find(t => t.id === templateId)
    if (t) {
      setSelectedTemplate(t)
      networkRef.current?.focusNode(templateId)
    }
  }, [templates])

  // Prev / next template navigation
  const handlePrevTemplate = useCallback(() => {
    if (!selectedTemplate || templates.length === 0) return
    const idx  = templates.findIndex(t => t.id === selectedTemplate.id)
    const prev = templates[(idx - 1 + templates.length) % templates.length]
    setSelectedTemplate(prev)
    networkRef.current?.focusNode(prev.id)
  }, [selectedTemplate, templates])

  const handleNextTemplate = useCallback(() => {
    if (!selectedTemplate || templates.length === 0) return
    const idx  = templates.findIndex(t => t.id === selectedTemplate.id)
    const next = templates[(idx + 1) % templates.length]
    setSelectedTemplate(next)
    networkRef.current?.focusNode(next.id)
  }, [selectedTemplate, templates])

  return (
    <div
      className="relative w-full overflow-hidden bg-ums-bg"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      <StarsBackground />

      {/* ── Level 1 — Category Orbit ── */}
      <AnimatePresence>
        {view === 'L1' && (
          <m.div
            key="L1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Level1Orbit onSelect={handleSelectCategory} />
          </m.div>
        )}
      </AnimatePresence>

      {/* ── Level 2 — Template Network ── */}
      <AnimatePresence>
        {view === 'L2' && (
          <m.div
            key="L2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="absolute inset-0"
          >
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-10 px-8 pt-7">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-xs text-ums-muted hover:text-ums-gold transition-colors"
                >
                  <ArrowLeft size={13} />
                  All Categories
                </button>

                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ums-gold">
                  {categoryName}
                </p>

                {/* View mode toggle */}
                <div
                  className="flex items-center gap-1 rounded-full p-1"
                  style={{ border: '1px solid #5D523C', background: '#1A1918' }}
                >
                  <button
                    onClick={() => setViewMode('orbit')}
                    title="Orbit view"
                    className="flex items-center justify-center w-6 h-6 rounded-full transition-all"
                    style={{
                      background:  viewMode === 'orbit' ? '#AB9C7D' : 'transparent',
                      color:       viewMode === 'orbit' ? '#1A1918' : '#888073',
                    }}
                  >
                    <Network size={12} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                    className="flex items-center justify-center w-6 h-6 rounded-full transition-all"
                    style={{
                      background: viewMode === 'grid' ? '#AB9C7D' : 'transparent',
                      color:      viewMode === 'grid' ? '#1A1918' : '#888073',
                    }}
                  >
                    <LayoutGrid size={12} />
                  </button>
                </div>
              </div>

              {/* Statement — sits below the top bar row, above canvas nodes */}
              <p
                className="text-center text-xs leading-relaxed mx-auto mt-3"
                style={{ color: '#888073', maxWidth: 480 }}
              >
                We don&apos;t just give you templates — we transfer the knowledge behind them.
              </p>
            </div>

            {/* Ghost UMS logo — clickable back */}
            <button
              onClick={handleBack}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-[0.06] hover:opacity-[0.13] transition-opacity"
              aria-label="Back to categories"
            >
              <Image
                src="/UMS Logo/UMS_logo_upscaled_faithful.png"
                alt="UMS"
                width={220}
                height={73}
                className="h-12 w-auto"
                unoptimized
              />
            </button>

            {/* Canvas neural network */}
            <Level2Network
              ref={networkRef}
              templates={templates}
              slowed={selectedTemplate !== null}
              onNodeClick={handleNodeClick}
              selectedId={selectedTemplate?.id ?? null}
              viewMode={viewMode}
              topPadding={TOP_PADDING}
            />
          </m.div>
        )}
      </AnimatePresence>

      {/* ── Level 3 — Template Card (arrows live inside the card, move with drag) ── */}
      <AnimatePresence>
        {selectedTemplate && (
          <TemplateCard
            key="template-card"
            template={selectedTemplate}
            onClose={handleCloseCard}
            onPairsWithClick={handlePairsWithClick}
            onPrev={templates.length > 1 ? handlePrevTemplate : undefined}
            onNext={templates.length > 1 ? handleNextTemplate : undefined}
          />
        )}
      </AnimatePresence>

      {/* ── Request Form ── */}
      <RequestForm />
    </div>
  )
}
