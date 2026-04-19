'use client'

import {
  useEffect, useRef, useCallback,
  forwardRef, useImperativeHandle,
} from 'react'
import type { Template } from '@/lib/store-data'

const BASE_SPEED      = 0.35
const SLOW_MULTIPLIER = 0.2
const REGULAR_RADIUS  = 36
const KIT_RADIUS      = 52

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
}

interface Props {
  templates:  Template[]
  slowed:     boolean
  onNodeClick:(t: Template) => void
  selectedId: string | null
  viewMode:   'orbit' | 'grid'
  topPadding: number
}

export interface Level2NetworkHandle {
  focusNode: (id: string) => void
}

const Level2Network = forwardRef<Level2NetworkHandle, Props>(
  ({ templates, slowed, onNodeClick, selectedId, viewMode, topPadding }, ref) => {
    const canvasRef   = useRef<HTMLCanvasElement>(null)
    const nodesRef    = useRef<NetworkNode[]>([])
    const hoveredRef  = useRef<string | null>(null)
    const focusedRef  = useRef<string | null>(null)
    const focusTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
    const slowedRef   = useRef(slowed)
    const selectedRef = useRef(selectedId)
    const viewModeRef = useRef(viewMode)
    const topPadRef   = useRef(topPadding)
    const animRef     = useRef<number>(0)

    slowedRef.current   = slowed
    selectedRef.current = selectedId
    viewModeRef.current = viewMode
    topPadRef.current   = topPadding

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
      if (n === 0) return
      const cols = Math.ceil(Math.sqrt(n))
      const rows = Math.ceil(n / cols)
      const topP = topPadRef.current + 20
      const hPad = 80
      const availW = W - hPad * 2
      const availH = H - topP - 40
      const cellW  = availW / cols
      const cellH  = availH / rows
      nodes.forEach((node, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        node.targetX = hPad + cellW * col + cellW / 2
        node.targetY = topP + cellH * row + cellH / 2
      })
    }, [])

    const initNodes = useCallback((W: number, H: number) => {
      const topP = topPadRef.current
      nodesRef.current = templates.map(t => {
        const r   = t.isKit ? KIT_RADIUS : REGULAR_RADIUS
        const pad = r + 40
        const x   = pad + Math.random() * (W - pad * 2)
        const y   = topP + pad + Math.random() * (H - topP - pad * 2)
        return {
          id:        t.id,
          shortName: t.shortName,
          isKit:     t.isKit,
          x, y,
          vx: (Math.random() - 0.5) * BASE_SPEED * 2,
          vy: (Math.random() - 0.5) * BASE_SPEED * 2,
          radius:  r,
          targetX: x,
          targetY: y,
        }
      })
    }, [templates])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const resize = () => {
        canvas.width  = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        if (nodesRef.current.length === 0) initNodes(canvas.width, canvas.height)
        computeGridTargets(canvas.width, canvas.height)
      }
      resize()
      window.addEventListener('resize', resize)

      const draw = () => {
        const W     = canvas.width
        const H     = canvas.height
        const speed = slowedRef.current ? BASE_SPEED * SLOW_MULTIPLIER : BASE_SPEED
        const isGrid = viewModeRef.current === 'grid'
        const topP   = topPadRef.current
        const nodes  = nodesRef.current

        ctx.clearRect(0, 0, W, H)

        if (isGrid) {
          // Lerp toward grid targets — no velocity
          nodes.forEach(n => {
            n.x += (n.targetX - n.x) * 0.08
            n.y += (n.targetY - n.y) * 0.08
          })
        } else {
          // Velocity movement with boundary bounce
          nodes.forEach(n => {
            n.x += n.vx * speed
            n.y += n.vy * speed
            if (n.x < n.radius)         { n.x = n.radius;          n.vx =  Math.abs(n.vx) }
            if (n.x > W - n.radius)     { n.x = W - n.radius;      n.vx = -Math.abs(n.vx) }
            if (n.y < topP + n.radius)  { n.y = topP + n.radius;   n.vy =  Math.abs(n.vy) }
            if (n.y > H - n.radius)     { n.y = H - n.radius;      n.vy = -Math.abs(n.vy) }
          })

          // Collision physics — elastic bouncing
          for (let a = 0; a < nodes.length; a++) {
            for (let b = a + 1; b < nodes.length; b++) {
              const na  = nodes[a]
              const nb  = nodes[b]
              const dx  = nb.x - na.x
              const dy  = nb.y - na.y
              const dist = Math.sqrt(dx * dx + dy * dy)
              const min  = na.radius + nb.radius + 4
              if (dist < min && dist > 0) {
                const nx   = dx / dist
                const ny   = dy / dist
                const push = (min - dist) / 2
                na.x -= nx * push
                na.y -= ny * push
                nb.x += nx * push
                nb.y += ny * push
                // Reflect normal component of relative velocity
                const relV = (nb.vx - na.vx) * nx + (nb.vy - na.vy) * ny
                if (relV < 0) {
                  na.vx -= relV * nx
                  na.vy -= relV * ny
                  nb.vx += relV * nx
                  nb.vy += relV * ny
                }
              }
            }
          }
        }

        // Connection lines — all pairs, clearly visible
        for (let a = 0; a < nodes.length; a++) {
          for (let b = a + 1; b < nodes.length; b++) {
            const na = nodes[a]
            const nb = nodes[b]
            ctx.beginPath()
            ctx.moveTo(na.x, na.y)
            ctx.lineTo(nb.x, nb.y)
            ctx.strokeStyle = 'rgba(93,82,60,0.7)'
            ctx.lineWidth   = 1
            ctx.stroke()
          }
        }

        // Nodes
        nodes.forEach(n => {
          const isHovered  = n.id === hoveredRef.current
          const isFocused  = n.id === focusedRef.current
          const isSelected = n.id === selectedRef.current

          // Glow ring
          if (isFocused || isHovered || isSelected) {
            ctx.save()
            ctx.shadowColor = '#AB9C7D'
            ctx.shadowBlur  = isFocused ? 28 : 16
            ctx.beginPath()
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
            ctx.strokeStyle = '#AB9C7D'
            ctx.lineWidth   = 2
            ctx.stroke()
            ctx.restore()
          }

          // Fill
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
          ctx.fillStyle = n.isKit ? '#AB9C7D' : '#1A1918'
          ctx.fill()

          // Border
          ctx.strokeStyle = isSelected ? '#F5F0E8' : '#AB9C7D'
          ctx.lineWidth   = n.isKit ? 2.5 : 1.5
          ctx.stroke()

          // Label with word-wrap
          const maxW = n.radius * 1.7
          const fSize = n.isKit ? 9.5 : 8.5
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
        const mx = (e.clientX - rect.left) * (canvas.width  / rect.width)
        const my = (e.clientY - rect.top)  * (canvas.height / rect.height)
        let hit: string | null = null
        nodesRef.current.forEach(n => {
          if (Math.sqrt((mx - n.x) ** 2 + (my - n.y) ** 2) <= n.radius) hit = n.id
        })
        hoveredRef.current  = hit
        canvas.style.cursor = hit ? 'pointer' : 'default'
      }

      const handleClick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        const mx = (e.clientX - rect.left) * (canvas.width  / rect.width)
        const my = (e.clientY - rect.top)  * (canvas.height / rect.height)
        nodesRef.current.forEach(n => {
          if (Math.sqrt((mx - n.x) ** 2 + (my - n.y) ** 2) <= n.radius) {
            const t = templates.find(t => t.id === n.id)
            if (t) onNodeClick(t)
          }
        })
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

    // Recompute grid positions whenever viewMode switches to grid
    useEffect(() => {
      if (viewMode === 'grid') {
        const canvas = canvasRef.current
        if (canvas) computeGridTargets(canvas.width, canvas.height)
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
