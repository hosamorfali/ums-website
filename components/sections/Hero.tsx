'use client'

import { m, type Variants } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

type Point = { x: number; y: number }

interface WaveConfig {
  offset: number
  amplitude: number
  frequency: number
  color: string
  opacity: number
}

/* ── UMS Stats — exact numbers TBC by Hosam ─────────────── */
const heroStats = [
  { label: 'Clients Served',       value: '25+'  },
  { label: 'Template Categories',  value: '5'    },
  { label: 'Frameworks Available', value: '50+'  },
  { label: 'Turnaround',           value: '48h'  },
]

/* ── Framer Motion variants ──────────────────────────────── */
const containerVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.12 } },
}
const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const statsVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.08 },
  },
}

/* ── UMS gold RGB for wave canvas ───────────────────────── */
const GOLD = '171, 156, 125'

export default function HeroSection() {
  const canvasRef      = useRef<HTMLCanvasElement | null>(null)
  const mouseRef       = useRef<Point>({ x: 0, y: 0 })
  const targetMouseRef = useRef<Point>({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const wavePalette: WaveConfig[] = [
      { offset: 0,             amplitude: 70, frequency: 0.003,  color: `rgba(${GOLD}, 0.8)`,  opacity: 0.45 },
      { offset: Math.PI / 2,   amplitude: 90, frequency: 0.0026, color: `rgba(${GOLD}, 0.7)`,  opacity: 0.35 },
      { offset: Math.PI,       amplitude: 60, frequency: 0.0034, color: `rgba(${GOLD}, 0.5)`,  opacity: 0.25 },
      { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, color: `rgba(${GOLD}, 0.3)`,  opacity: 0.20 },
      { offset: Math.PI * 2,   amplitude: 55, frequency: 0.004,  color: `rgba(${GOLD}, 0.15)`, opacity: 0.15 },
    ]

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouseInfluence  = prefersReducedMotion ? 10  : 70
    const influenceRadius = prefersReducedMotion ? 160 : 320
    const smoothing       = prefersReducedMotion ? 0.04 : 0.1

    const resizeCanvas = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    const recenterMouse = () => {
      const c = { x: canvas.width / 2, y: canvas.height / 2 }
      mouseRef.current       = { ...c }
      targetMouseRef.current = { ...c }
    }
    const handleResize     = () => { resizeCanvas(); recenterMouse() }
    const handleMouseMove  = (e: MouseEvent) => { targetMouseRef.current = { x: e.clientX, y: e.clientY } }
    const handleMouseLeave = () => { recenterMouse() }

    resizeCanvas()
    recenterMouse()
    window.addEventListener('resize',      handleResize)
    window.addEventListener('mousemove',   handleMouseMove)
    window.addEventListener('mouseleave',  handleMouseLeave)

    const drawWave = (wave: WaveConfig) => {
      ctx.save()
      ctx.beginPath()
      for (let x = 0; x <= canvas.width; x += 4) {
        const dx       = x - mouseRef.current.x
        const dy       = canvas.height / 2 - mouseRef.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const influence = Math.max(0, 1 - distance / influenceRadius)
        const mouseEffect =
          influence * mouseInfluence * Math.sin(time * 0.001 + x * 0.01 + wave.offset)
        const y =
          canvas.height / 2 +
          Math.sin(x * wave.frequency + time * 0.002 + wave.offset) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.4 + time * 0.003) * (wave.amplitude * 0.45) +
          mouseEffect
        if (x === 0) { ctx.moveTo(x, y) } else { ctx.lineTo(x, y) }
      }
      ctx.lineWidth   = 2.5
      ctx.strokeStyle = wave.color
      ctx.globalAlpha = wave.opacity
      ctx.shadowBlur  = 35
      ctx.shadowColor = wave.color
      ctx.stroke()
      ctx.restore()
    }

    const animate = () => {
      time += 1
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * smoothing
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * smoothing

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#1A1918')
      gradient.addColorStop(1, '#1E1D1B')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1
      ctx.shadowBlur  = 0
      wavePalette.forEach(drawWave)
      animationId = window.requestAnimationFrame(animate)
    }

    animationId = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize',     handleResize)
      window.removeEventListener('mousemove',  handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <section
      id="hero"
      className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-ums-bg"
      role="region"
      aria-label="Hero"
    >
      {/* Interactive wave canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      {/* Subtle radial gold glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#AB9C7D]/[0.04] blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-[#AB9C7D]/[0.03] blur-[120px]" />
        <div className="absolute left-1/4 top-1/2 h-[400px] w-[400px] rounded-full bg-[#AB9C7D]/[0.02] blur-[150px]" />
      </div>

      {/* Content layer */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center md:px-8 lg:px-12">
        <m.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          {/* Badge */}
          <m.div
            variants={itemVariants}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-ums-border bg-ums-bg/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-ums-muted backdrop-blur"
          >
            <Sparkles className="h-4 w-4 text-ums-gold" aria-hidden="true" />
            Unique Management Solutions
          </m.div>

          {/* Main headline — gold */}
          <m.h1
            variants={itemVariants}
            className="mb-4 text-5xl font-bold tracking-tight text-ums-gold md:text-7xl lg:text-8xl"
          >
            Complexity into Clarity.
          </m.h1>

          {/* Secondary headline — white */}
          <m.p
            variants={itemVariants}
            className="mb-6 text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            Crafted to Impress.
          </m.p>

          {/* One-line company descriptor */}
          <m.p
            variants={itemVariants}
            className="mx-auto mb-12 max-w-xl text-base leading-relaxed text-ums-muted md:text-lg"
          >
            Your trusted Saudi partner for turning complexity into clarity.
          </m.p>

          {/* Single primary CTA */}
          <m.div variants={itemVariants} className="mb-16 flex justify-center">
            <Link
              href="/store"
              className="group inline-flex items-center gap-2 rounded-md bg-ums-gold px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-ums-bg transition-opacity hover:opacity-90"
            >
              Browse Our Template Store
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </m.div>

          {/* Stats bar */}
          <m.div
            variants={statsVariants}
            className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ums-border bg-ums-border sm:grid-cols-4"
          >
            {heroStats.map(stat => (
              <m.div
                key={stat.label}
                variants={itemVariants}
                className="flex flex-col items-center gap-1 bg-ums-bg/80 px-6 py-5 backdrop-blur-sm"
              >
                <span className="text-xs uppercase tracking-[0.3em] text-ums-muted">
                  {stat.label}
                </span>
                <span className="text-3xl font-bold text-ums-gold">
                  {stat.value}
                </span>
              </m.div>
            ))}
          </m.div>
        </m.div>
      </div>
    </section>
  )
}
