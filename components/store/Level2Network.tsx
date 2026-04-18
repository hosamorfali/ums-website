'use client'

import {
  useEffect, useRef, useCallback,
  forwardRef, useImperativeHandle,
} from 'react'
import type { Template } from '@/lib/store-data'

const CONNECTION_DISTANCE = 340
const BASE_SPEED          = 0.35
const SLOW_MULTIPLIER     = 0.2
const REGULAR_RADIUS      = 36
const KIT_RADIUS          = 52

interface NetworkNode {
  id: string
  shortName: string
  isKit: boolean
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

interface Props {
  templates: Template[]
  slowed: boolean
  onNodeClick: (t: Template) => void
  selectedId: string | null
}

export interface Level2NetworkHandle {
  focusNode: (id: string) => void
}

const Level2Network = forwardRef<Level2NetworkHandle, Props>(
  ({ templates, slowed, onNodeClick, selectedId }, ref) => {
    const canvasRef   = useRef<HTMLCanvasElement>(null)
    const nodesRef    = useRef<NetworkNode[]>([])
    const hoveredRef  = useRef<string | null>(null)
    const focusedRef  = useRef<string | null>(null)
    const focusTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
    const slowedRef   = useRef(slowed)
    const selectedRef = useRef(selectedId)
    const animRef     = useRef<number>(0)

    slowedRef.current  = slowed
    selectedRef.current = selectedId

    useImperativeHandle(ref, () => ({
      focusNode: (id: string) => {
        focusedRef.current = id
        if (focusTimer.current) clearTimeout(focusTimer.current)
        focusTimer.current = setTimeout(() => { focusedRef.current = null }, 3000)
      },
    }))

    const initNodes = useCallback((W: number, H: number) => {
      nodesRef.current = templates.map((t, i) => {
        const r = t.isKit ? KIT_RADIUS : REGULAR_RADIUS
        const pad = r + 40
        return {
          id:        t.id,
          shortName: t.shortName,
          isKit:     t.isKit,
          x: pad + Math.random() * (W - pad * 2),
          y: pad + Math.random() * (H - pad * 2),
          vx: (Math.random() - 0.5) * BASE_SPEED * 2,
          vy: (Math.random() - 0.5) * BASE_SPEED * 2,
          radius: r,
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
      }
      resize()
      window.addEventListener('resize', resize)

      const draw = () => {
        const W = canvas.width
        const H = canvas.height
        const speed = slowedRef.current ? BASE_SPEED * SLOW_MULTIPLIER : BASE_SPEED

        ctx.clearRect(0, 0, W, H)

        // Move nodes
        nodesRef.current.forEach(n => {
          n.x += n.vx * speed
          n.y += n.vy * speed
          if (n.x < n.radius)     { n.x = n.radius;    n.vx = Math.abs(n.vx) }
          if (n.x > W - n.radius) { n.x = W - n.radius; n.vx = -Math.abs(n.vx) }
          if (n.y < n.radius)     { n.y = n.radius;    n.vy = Math.abs(n.vy) }
          if (n.y > H - n.radius) { n.y = H - n.radius; n.vy = -Math.abs(n.vy) }
        })

        // Draw connections
        for (let a = 0; a < nodesRef.current.length; a++) {
          for (let b = a + 1; b < nodesRef.current.length; b++) {
            const na = nodesRef.current[a]
            const nb = nodesRef.current[b]
            const dx = na.x - nb.x
            const dy = na.y - nb.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < CONNECTION_DISTANCE) {
              const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.45
              ctx.beginPath()
              ctx.moveTo(na.x, na.y)
              ctx.lineTo(nb.x, nb.y)
              ctx.strokeStyle = `rgba(93,82,60,${alpha})`
              ctx.lineWidth = 0.8
              ctx.stroke()
            }
          }
        }

        // Draw nodes
        nodesRef.current.forEach(n => {
          const isHovered  = n.id === hoveredRef.current
          const isFocused  = n.id === focusedRef.current
          const isSelected = n.id === selectedRef.current

          // Glow
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

          // Label — multi-line word wrap inside circle
          const maxW    = n.radius * 1.7
          const fSize   = n.isKit ? 9.5 : 8.5
          ctx.font      = `bold ${fSize}px ui-sans-serif,system-ui,sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = n.isKit ? '#1A1918' : '#F5F0E8'

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

      // Mouse events
      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width)
        const my = (e.clientY - rect.top)  * (canvas.height / rect.height)
        let hit: string | null = null
        nodesRef.current.forEach(n => {
          const d = Math.sqrt((mx - n.x) ** 2 + (my - n.y) ** 2)
          if (d <= n.radius) hit = n.id
        })
        hoveredRef.current  = hit
        canvas.style.cursor = hit ? 'pointer' : 'default'
      }

      const handleClick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width)
        const my = (e.clientY - rect.top)  * (canvas.height / rect.height)
        nodesRef.current.forEach(n => {
          const d = Math.sqrt((mx - n.x) ** 2 + (my - n.y) ** 2)
          if (d <= n.radius) {
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
    }, [templates, initNodes, onNodeClick])

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
