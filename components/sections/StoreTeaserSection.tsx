'use client'

import { m, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

/* ── Particle system ─────────────────────────────────────── */

class Particle {
  x: number
  y: number
  directionX: number
  directionY: number
  size: number
  color: string

  constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
    this.x = x
    this.y = y
    this.directionX = directionX
    this.directionY = directionY
    this.size = size
    this.color = color
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
    ctx.fillStyle = this.color
    ctx.fill()
  }

  update(canvas: HTMLCanvasElement, mouse: { x: number | null; y: number | null; radius: number }, ctx: CanvasRenderingContext2D) {
    if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX
    if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY

    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x
      const dy = mouse.y - this.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < mouse.radius + this.size) {
        const forceX = dx / distance
        const forceY = dy / distance
        const force = (mouse.radius - distance) / mouse.radius
        this.x -= forceX * force * 5
        this.y -= forceY * force * 5
      }
    }

    this.x += this.directionX
    this.y += this.directionY
    this.draw(ctx)
  }
}

/* ── Framer Motion variants ──────────────────────────────── */
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.18 + 0.3, duration: 0.7, ease: 'easeOut' },
  }),
}

export default function StoreTeaserSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouse = useRef<{ x: number | null; y: number | null; radius: number }>({
    x: null,
    y: null,
    radius: 200,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []

    const GOLD_PARTICLE = 'rgba(171, 156, 125, 0.75)'
    const GOLD_LINE     = 'rgba(171, 156, 125,'

    function init() {
      particles = []
      const count = (canvas!.height * canvas!.width) / 9000
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 1.5 + 0.5
        const x = Math.random() * (canvas!.width  - size * 4) + size * 2
        const y = Math.random() * (canvas!.height - size * 4) + size * 2
        const dx = (Math.random() * 0.4) - 0.2
        const dy = (Math.random() * 0.4) - 0.2
        particles.push(new Particle(x, y, dx, dy, size, GOLD_PARTICLE))
      }
    }

    function connect() {
      const threshold = (canvas!.width / 7) * (canvas!.height / 7)
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dist =
            (particles[a].x - particles[b].x) ** 2 +
            (particles[a].y - particles[b].y) ** 2
          if (dist < threshold) {
            const opacity = 1 - dist / 20000
            const mx = mouse.current
            let lineColor = `${GOLD_LINE}${(opacity * 0.6).toFixed(2)})`
            if (mx.x !== null && mx.y !== null) {
              const dxm = particles[a].x - mx.x
              const dym = particles[a].y - mx.y
              if (Math.sqrt(dxm * dxm + dym * dym) < mx.radius) {
                lineColor = `rgba(245, 240, 232, ${(opacity * 0.5).toFixed(2)})`
              }
            }
            ctx!.strokeStyle = lineColor
            ctx!.lineWidth = 0.8
            ctx!.beginPath()
            ctx!.moveTo(particles[a].x, particles[a].y)
            ctx!.lineTo(particles[b].x, particles[b].y)
            ctx!.stroke()
          }
        }
      }
    }

    const resizeCanvas = () => {
      canvas!.width  = canvas!.offsetWidth
      canvas!.height = canvas!.offsetHeight
      init()
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect()
      mouse.current.x = e.clientX - rect.left
      mouse.current.y = e.clientY - rect.top
    }
    const handleMouseOut = () => {
      mouse.current.x = null
      mouse.current.y = null
    }

    resizeCanvas()
    window.addEventListener('resize',    resizeCanvas)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseout',  handleMouseOut)

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => p.update(canvas, mouse.current, ctx))
      connect()
    }
    animate()

    return () => {
      window.removeEventListener('resize',    resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseout',  handleMouseOut)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <section
      id="store"
      className="relative isolate flex min-h-[80vh] w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#1A1918' }}
      aria-labelledby="store-teaser-heading"
    >
      {/* Particle canvas — full section background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      {/* Soft vignette overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(26,25,24,0.7) 100%)',
        }}
      />

      {/* Centered overlay text */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <m.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em]"
          style={{ borderColor: '#5D523C', color: '#888073', backgroundColor: 'rgba(26,25,24,0.6)' }}
        >
          Available Now
        </m.div>

        <m.h2
          id="store-teaser-heading"
          custom={1}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-5xl font-bold tracking-tight text-ums-gold md:text-7xl"
        >
          UMS Template Store
        </m.h2>

        <m.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-xl text-base leading-relaxed text-foreground md:text-lg"
        >
          Consulting-grade strategy frameworks — ready to use, built to teach, and continuously updated.
        </m.p>

        <m.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-sm font-semibold uppercase tracking-[0.3em] text-ums-muted"
        >
          One Time Purchase. Lifetime Use.
        </m.p>

        <m.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <Link
            href="/store"
            className="group inline-flex items-center gap-2 rounded-md px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#AB9C7D', color: '#1A1918' }}
          >
            Explore Our Store
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </m.div>
      </div>
    </section>
  )
}
