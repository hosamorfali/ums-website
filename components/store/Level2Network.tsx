'use client'

import {
  useEffect, useRef, useCallback,
  forwardRef, useImperativeHandle,
} from 'react'
import type { Template } from '@/lib/store-data'

const BASE_SPEED          = 0.35
const SLOW_MULTIPLIER     = 0.2
const REGULAR_RADIUS      = 44
const KIT_RADIUS          = 64
const CONNECTION_DISTANCE = 340
// On mobile, keep nodes above the "Don't See What You Need?" sticky bar (~68px tall + gap)
const MOBILE_BOTTOM_PAD   = 80

interface NetworkNode {
  id: string
  shortName: string
  isKit: boolean
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  targetX: number
  targetY: number
  currentScale: number
  glowIntensity: number
}

interface Props {
  templates:         Template[]
  slowed:            boolean
  onNodeClick:       (t: Template) => void
  selectedId:        string | null
  viewMode:          'orbit' | 'grid'
  topPadding:        number
  onBackgroundClick?: () => void
}

export interface Level2NetworkHandle {
  focusNode: (id: string) => void
}

const Level2Network = forwardRef<Level2NetworkHandle, Props>(
  ({ templates, slowed, onNodeClick, selectedId, viewMode, topPadding, onBackgroundClick }, ref) => {
    const canvasRef            = useRef<HTMLCanvasElement>(null)
    const nodesRef             = useRef<NetworkNode[]>([])
    const hoveredRef           = useRef<string | null>(null)
    const focusedRef           = useRef<string | null>(null)
    const focusTimer           = useRef<ReturnType<typeof setTimeout> | null>(null)
    const slowedRef            = useRef(slowed)
    const selectedRef          = useRef(selectedId)
    const viewModeRef          = useRef(viewMode)
    const topPadRef            = useRef(topPadding)
    const animRef              = useRef<number>(0)
    const scatteringRef        = useRef(false)
    const scatterEndRef        = useRef(0)
    const cssSizeRef           = useRef({ w: 0, h: 0 })
    const onBackgroundClickRef = useRef(onBackgroundClick)

    slowedRef.current            = slowed
    selectedRef.current          = selectedId
    viewModeRef.current          = viewMode
    topPadRef.current            = topPadding
    onBackgroundClickRef.current = onBackgroundClick

    useImperativeHandle(ref, () => ({
      focusNode: (id: string) => {
        focusedRef.current = id
        if (focusTimer.current) clearTimeout(focusTimer.current)
        focusTimer.current = setTimeout(() => { focusedRef.current = null }, 3000)
      },
    }))

    const computeGridTargets = useCallback((W: number, H: number) => {
      const nodes = nodesRef.current
      const n = nodes.length
      if (n === 0 || W <= 0 || H <= 0) return
      const isMobileGrid = W < 768
      const cols  = isMobileGrid ? Math.min(3, Math.ceil(Math.sqrt(n))) : Math.ceil(Math.sqrt(n))
      const rows  = Math.ceil(n / cols)
      const topP  = topPadRef.current + 20
      const botP  = isMobileGrid ? MOBILE_BOTTOM_PAD : 0
      const hPad  = isMobileGrid ? 20 : 80
      const cellW = (W - hPad * 2) / cols
      const cellH = (H - topP - 40 - botP) / rows
      nodes.forEach((node, i) => {
        node.targetX = hPad + (i % cols) * cellW + cellW / 2
        node.targetY = topP + Math.floor(i / cols) * cellH + cellH / 2
      })
    }, [])

    const initNodes = useCallback((W: number, H: number) => {
      const topP     = topPadRef.current
      const isMobile = W < 768
      const botP     = isMobile ? MOBILE_BOTTOM_PAD : 0
      nodesRef.current = templates.map(t => {
        const r = t.isKit
          ? (isMobile ? 46 : KIT_RADIUS)
          : (isMobile ? 36 : REGULAR_RADIUS)
        const pad = r + 40
        const x   = pad + Math.random() * (W - pad * 2)
        const y   = topP + pad + Math.random() * (H - topP - botP - pad * 2)
        return {
          id:           t.id,
          shortName:    t.shortName,
          isKit:        t.isKit,
          x, y,
          vx:           (Math.random() - 0.5) * BASE_SPEED * 2,
          vy:           (Math.random() - 0.5) * BASE_SPEED * 2,
          radius:       r,
          targetX:      x,
          targetY:      y,
          currentScale: 1,
          glowIntensity: 0,
        }
      })
    }, [templates])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const resize = () => {
        const dpr = window.devicePixelRatio || 1
        const w   = canvas.offsetWidth
        const h   = canvas.offsetHeight
        cssSizeRef.current = { w, h }
        canvas.width  = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
        // Scale all draw calls to physical pixels — fixes blurry nodes on HiDPI screens
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        if (nodesRef.current.length === 0) initNodes(w, h)
        computeGridTargets(w, h)
      }
      resize()
      window.addEventListener('resize', resize)

      const draw = () => {
        const W     = cssSizeRef.current.w
        const H     = cssSizeRef.current.h
        if (W === 0 || H === 0) { animRef.current = requestAnimationFrame(draw); return }
        const speed = slowedRef.current ? BASE_SPEED * SLOW_MULTIPLIER : BASE_SPEED
        const isGrid = viewModeRef.current === 'grid'
        const topP   = topPadRef.current
        const nodes  = nodesRef.current

        ctx.clearRect(0, 0, W, H)

        const now = performance.now()
        const isScattering = scatteringRef.current && now < scatterEndRef.current
        if (!isScattering && scatteringRef.current) scatteringRef.current = false

        if (isGrid) {
          // Lerp toward grid targets — no velocity
          nodes.forEach(n => {
            n.x += (n.targetX - n.x) * 0.08
            n.y += (n.targetY - n.y) * 0.08
          })
        } else if (isScattering) {
          // Lerp toward scatter targets then resume drift
          nodes.forEach(n => {
            n.x += (n.targetX - n.x) * 0.06
            n.y += (n.targetY - n.y) * 0.06
          })
        } else {
          // Velocity movement with boundary bounce + gentle damping
          const botP = W < 768 ? MOBILE_BOTTOM_PAD : 0
          nodes.forEach(n => {
            n.vx *= 0.999
            n.vy *= 0.999
            n.x += n.vx * speed
            n.y += n.vy * speed
            if (n.x < n.radius)              { n.x = n.radius;               n.vx =  Math.abs(n.vx) }
            if (n.x > W - n.radius)          { n.x = W - n.radius;           n.vx = -Math.abs(n.vx) }
            if (n.y < topP + n.radius)       { n.y = topP + n.radius;        n.vy =  Math.abs(n.vy) }
            if (n.y > H - botP - n.radius)   { n.y = H - botP - n.radius;   n.vy = -Math.abs(n.vy) }
          })

          // Soft repulsion — gentle position nudge only, no velocity changes (prevents jitter)
          for (let a = 0; a < nodes.length; a++) {
            for (let b = a + 1; b < nodes.length; b++) {
              const na   = nodes[a]
              const nb   = nodes[b]
              const dx   = nb.x - na.x
              const dy   = nb.y - na.y
              const dist = Math.sqrt(dx * dx + dy * dy)
              const min  = na.radius + nb.radius + 12
              if (dist < min && dist > 0) {
                const nx   = dx / dist
                const ny   = dy / dist
                const push = (min - dist) * 0.04
                na.x -= nx * push
                na.y -= ny * push
                nb.x += nx * push
                nb.y += ny * push
              }
            }
          }
        }

        // Connection lines — distance-based, fading alpha (original behaviour)
        for (let a = 0; a < nodes.length; a++) {
          for (let b = a + 1; b < nodes.length; b++) {
            const na = nodes[a], nb = nodes[b]
            const dx = na.x - nb.x, dy = na.y - nb.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < CONNECTION_DISTANCE) {
              const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.45
              ctx.beginPath()
              ctx.moveTo(na.x, na.y)
              ctx.lineTo(nb.x, nb.y)
              ctx.strokeStyle = `rgba(93,82,60,${alpha})`
              ctx.lineWidth   = 0.8
              ctx.stroke()
            }
          }
        }

        // Nodes
        const isDesktop = W >= 768
        nodes.forEach(n => {
          const isHovered  = n.id === hoveredRef.current
          const isFocused  = n.id === focusedRef.current
          const isSelected = n.id === selectedRef.current

          // Smooth scale — desktop only; persists while node is hovered or selected
          const targetScale = isDesktop && (isHovered || isSelected) ? 1.12 : 1.0
          n.currentScale += (targetScale - n.currentScale) * 0.14
          const drawR = n.radius * n.currentScale

          // Glow — snaps on immediately on hover/select, fades off smoothly (desktop only).
          // shadowColor is always opaque; intensity is controlled via shadowBlur only.
          // (rgba alpha on shadowColor was the root cause of the invisible glow bug.)
          const glowTarget = isDesktop && (isHovered || isSelected) ? 1 : 0
          n.glowIntensity = glowTarget > n.glowIntensity
            ? glowTarget                                                 // snap on instantly
            : n.glowIntensity + (glowTarget - n.glowIntensity) * 0.15   // lerp off smoothly
          if (isFocused || n.glowIntensity > 0.02) {
            ctx.save()
            ctx.shadowColor = '#AB9C7D'
            ctx.shadowBlur  = isFocused ? 28 : n.glowIntensity * 32
            ctx.beginPath()
            ctx.arc(n.x, n.y, drawR, 0, Math.PI * 2)
            ctx.strokeStyle = '#AB9C7D'
            ctx.lineWidth   = 2
            ctx.stroke()
            ctx.restore()
          }

          // Fill
          ctx.beginPath()
          ctx.arc(n.x, n.y, drawR, 0, Math.PI * 2)
          ctx.fillStyle = n.isKit ? '#AB9C7D' : '#1A1918'
          ctx.fill()

          // Border
          ctx.strokeStyle = isSelected ? '#F5F0E8' : '#AB9C7D'
          ctx.lineWidth   = n.isKit ? 2.5 : 1.5
          ctx.stroke()

          // Label with word-wrap
          const maxW = drawR * 1.7
          const fSize = n.isKit ? (isDesktop ? 13 : 9.5) : (isDesktop ? 11 : 8.5)
          ctx.font         = `bold ${fSize}px ui-sans-serif,system-ui,sans-serif`
          ctx.textAlign    = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle    = n.isKit ? '#1A1918' : '#F5F0E8'

          const words = n.shortName.split(' ')
          const lines: string[] = []
          let cur = ''
          words.forEach(w => {
            const test = cur ? `${cur} ${w}` : w
            if (ctx.measureText(test).width > maxW && cur) {
              lines.push(cur); cur = w
            } else { cur = test }
          })
          if (cur) lines.push(cur)

          const lh  = fSize + 2.5
          const top = n.y - ((lines.length - 1) * lh) / 2
          lines.forEach((l, li) => ctx.fillText(l, n.x, top + li * lh))
        })

        animRef.current = requestAnimationFrame(draw)
      }

      animRef.current = requestAnimationFrame(draw)

      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        let hit: string | null = null
        nodesRef.current.forEach(n => {
          if (Math.sqrt((mx - n.x) ** 2 + (my - n.y) ** 2) <= n.radius * n.currentScale) hit = n.id
        })
        hoveredRef.current  = hit
        canvas.style.cursor = hit ? 'pointer' : 'default'
      }

      const handleClick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        let hit = false
        nodesRef.current.forEach(n => {
          if (Math.sqrt((mx - n.x) ** 2 + (my - n.y) ** 2) <= n.radius * n.currentScale) {
            const t = templates.find(t => t.id === n.id)
            if (t) { onNodeClick(t); hit = true }
          }
        })
        // Background click on desktop closes the open template card
        if (!hit && cssSizeRef.current.w >= 768 && onBackgroundClickRef.current) {
          onBackgroundClickRef.current()
        }
      }

      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('click',     handleClick)

      return () => {
        cancelAnimationFrame(animRef.current)
        window.removeEventListener('resize', resize)
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('click',     handleClick)
      }
    }, [templates, initNodes, onNodeClick, computeGridTargets])

    // Recompute grid positions when viewMode switches to grid
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas || canvas.width === 0) return
      if (viewMode === 'grid') {
        computeGridTargets(cssSizeRef.current.w, cssSizeRef.current.h)
      } else {
        // Scatter nodes to random positions, then resume drift after 900ms
        const W = cssSizeRef.current.w
        const H = cssSizeRef.current.h
        const topP = topPadRef.current
        const botP = W < 768 ? MOBILE_BOTTOM_PAD : 0
        nodesRef.current.forEach(n => {
          const pad = n.radius + 40
          n.targetX = pad + Math.random() * (W - pad * 2)
          n.targetY = topP + pad + Math.random() * (H - topP - botP - pad * 2)
          n.vx = (Math.random() - 0.5) * BASE_SPEED * 2
          n.vy = (Math.random() - 0.5) * BASE_SPEED * 2
        })
        scatteringRef.current = true
        scatterEndRef.current = performance.now() + 900
      }
    }, [viewMode, computeGridTargets])

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-label="Template neural network"
      />
    )
  },
)

Level2Network.displayName = 'Level2Network'
export { Level2Network }
