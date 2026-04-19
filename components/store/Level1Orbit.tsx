'use client'

import { useRef, useState } from 'react'
import { useAnimationFrame, m, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { CATEGORIES } from '@/lib/store-data'

const ORBIT_RADIUS = 210
const ORBIT_SPEED  = 0.00014   // rad/ms
const NODE_SIZE    = 88

interface Props {
  onSelect: (categoryId: string) => void
}

export function Level1Orbit({ onSelect }: Props) {
  const angleRef    = useRef(0)
  const isPausedRef = useRef(false)
  const lastPosRef  = useRef<{ x: number; y: number }[]>(
    CATEGORIES.map((_, i) => ({
      x: Math.cos((i / CATEGORIES.length) * Math.PI * 2) * ORBIT_RADIUS,
      y: Math.sin((i / CATEGORIES.length) * Math.PI * 2) * ORBIT_RADIUS,
    })),
  )
  const nodeRefs   = useRef<(HTMLDivElement | null)[]>([])
  const [exitNode, setExitNode]   = useState<{ index: number; x: number; y: number } | null>(null)
  const [hovered,  setHovered]    = useState<number | null>(null)
  const [exiting,  setExiting]    = useState(false)

  useAnimationFrame((_, delta) => {
    if (isPausedRef.current) return
    angleRef.current += delta * ORBIT_SPEED
    CATEGORIES.forEach((_, i) => {
      const a = angleRef.current + (i / CATEGORIES.length) * Math.PI * 2
      const x = Math.cos(a) * ORBIT_RADIUS
      const y = Math.sin(a) * ORBIT_RADIUS
      lastPosRef.current[i] = { x, y }
      const el = nodeRefs.current[i]
      if (el) el.style.transform = `translate(${x}px, ${y}px)`
    })
  })

  const handleClick = (cat: (typeof CATEGORIES)[0], i: number) => {
    if (!cat.active || exiting) return
    isPausedRef.current = true
    setExiting(true)
    const pos = lastPosRef.current[i]
    setExitNode({ index: i, ...pos })
    setTimeout(() => onSelect(cat.id), 700)
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Heading — above orbit */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center gap-3 pointer-events-none"
        style={{ top: 40, opacity: exiting ? 0 : 1, transition: 'opacity 0.5s' }}
      >
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ color: '#AB9C7D' }}
        >
          The Framework Navigator
        </h1>
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: '#888073' }}
        >
          Browse by Category. Find Your Framework.
        </p>
      </div>

      {/* Orbit ring */}
      <div
        className="absolute rounded-full border border-ums-border/25 pointer-events-none"
        style={{ width: ORBIT_RADIUS * 2, height: ORBIT_RADIUS * 2 }}
      />

      {/* UMS logo — center */}
      <div
        className="relative z-20"
        style={{ opacity: exiting ? 0.15 : 1, transition: 'opacity 0.6s' }}
      >
        <Image
          src="/UMS Logo/UMS_logo_upscaled_faithful.png"
          alt="UMS"
          width={160}
          height={53}
          className="h-11 w-auto"
          unoptimized
          priority
        />
      </div>

      {/* Orbit nodes */}
      {CATEGORIES.map((cat, i) => (
        <div
          key={cat.id}
          ref={el => { nodeRefs.current[i] = el }}
          onClick={() => handleClick(cat, i)}
          onMouseEnter={() => { if (cat.active) setHovered(i) }}
          onMouseLeave={() => setHovered(null)}
          style={{
            position:   'absolute',
            left:       '50%',
            top:        '50%',
            width:      NODE_SIZE,
            height:     NODE_SIZE,
            marginLeft: -NODE_SIZE / 2,
            marginTop:  -NODE_SIZE / 2,
            cursor:     cat.active ? 'pointer' : 'default',
            opacity:    exiting && exitNode?.index !== i ? 0 : 1,
            transition: 'opacity 0.4s',
          }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center p-2 text-center"
            style={{
              border: cat.active
                ? `1.5px solid ${hovered === i ? '#AB9C7D' : '#5D523C'}`
                : '1.5px dashed #3A342A',
              background: cat.active && hovered === i ? 'rgba(171,156,125,0.12)' : '#1A1918',
              boxShadow:  cat.active && hovered === i ? '0 0 18px rgba(171,156,125,0.35)' : 'none',
              transition: 'all 0.25s',
            }}
          >
            <span
              className="text-[9px] font-semibold uppercase tracking-widest leading-tight"
              style={{ color: cat.active ? (hovered === i ? '#AB9C7D' : '#888073') : '#3A342A' }}
            >
              {cat.name}
              {!cat.active && <><br /><span className="text-[7px] normal-case tracking-normal opacity-60">Coming Soon</span></>}
            </span>
          </div>
        </div>
      ))}

      {/* Exit phantom — animates off-screen */}
      <AnimatePresence>
        {exitNode && (
          <m.div
            initial={{ x: exitNode.x, y: exitNode.y, opacity: 1 }}
            animate={{ y: exitNode.y - 700, opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeIn' }}
            style={{
              position:   'absolute',
              left:       '50%',
              top:        '50%',
              width:      NODE_SIZE,
              height:     NODE_SIZE,
              marginLeft: -NODE_SIZE / 2,
              marginTop:  -NODE_SIZE / 2,
              pointerEvents: 'none',
              zIndex: 30,
            }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center p-2 text-center"
              style={{ border: '1.5px solid #AB9C7D', background: 'rgba(171,156,125,0.15)' }}
            >
              <span className="text-[9px] font-semibold uppercase tracking-widest text-ums-gold leading-tight">
                {CATEGORIES[exitNode.index].name}
              </span>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
