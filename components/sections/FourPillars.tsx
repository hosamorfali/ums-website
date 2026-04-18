'use client'

import { useEffect, useRef } from 'react'
import { m, type Variants } from 'framer-motion'
import { Briefcase, Lightbulb, Zap, LayoutTemplate } from 'lucide-react'
import type { ElementType } from 'react'
import { cn } from '@/lib/utils'

const pillars = [
  {
    icon: Briefcase,
    name: 'Business Solutions & Management Consulting',
    description:
      'From strategy design and benchmarking studies to foundational startup kits, we provide end-to-end management consulting services that translate your ambitions and challenges into a clear, structured blueprint for growth — alongside detailed proposals and bid submissions that accelerate your market penetration and winning rate.',
    position: 'tl' as const,
  },
  {
    icon: Lightbulb,
    name: 'Innovative Solutions',
    description:
      'Bridging traditional consulting with the power of AI, we combine structured thinking with the latest innovations to design digital tools and solutions — optimising your operations and building the competitive advantages that last.',
    position: 'tr' as const,
  },
  {
    icon: Zap,
    name: 'Rapid 360 Presentation Turnarounds',
    description:
      'Operating as an agile SWAT team, we take your presentation and deliver a full 360 turnaround — fast, precise, and uncompromising. Powered by design principles, structured consulting thinking, and visual storytelling, we turn complexity into clarity every time.',
    position: 'bl' as const,
  },
  {
    icon: LayoutTemplate,
    name: 'Tools & Templates Market',
    description:
      'Your on-demand library of consultant-grade slides and templates, ready to download and ready to use. From strategy frameworks and project management decks to startup kits and personal productivity tools — browse by category, buy what you need, and own it for life. One time purchase. Lifetime use.',
    position: 'br' as const,
  },
]

/* ── Animated wave canvas inside the diamond ─────────────── */
const CANVAS_PX = 340
const SQUARE_PX = Math.round(CANVAS_PX / Math.SQRT2)
const OFFSET_PX = Math.round((SQUARE_PX - CANVAS_PX) / 2)

function DiamondWave() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const outerRef   = useRef<HTMLDivElement>(null)
  const mouseRef   = useRef({ nx: 0, ny: 0, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    const outer  = outerRef.current
    if (!canvas || !outer) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width  = CANVAS_PX
    canvas.height = CANVAS_PX

    const waves = [
      { amp: 22, freq: 0.013, speed: 0.0022, phase: 0,             alpha: 0.50 },
      { amp: 15, freq: 0.02,  speed: 0.003,  phase: Math.PI,       alpha: 0.33 },
      { amp: 10, freq: 0.009, speed: 0.0018, phase: Math.PI / 2,   alpha: 0.22 },
      { amp: 7,  freq: 0.028, speed: 0.0035, phase: Math.PI * 1.5, alpha: 0.15 },
    ]

    let t = 0
    let animId: number

    const draw = () => {
      t++
      const { nx, ny, active } = mouseRef.current
      const phaseNudge  = active ? (nx - 0.5) * Math.PI * 0.6 : 0
      const vertNudge   = active ? (ny - 0.5) * 28            : 0

      ctx.fillStyle = '#1A1918'
      ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX)

      waves.forEach((w, i) => {
        const sign = i % 2 === 0 ? 1 : -1
        ctx.beginPath()
        for (let x = 0; x <= CANVAS_PX; x += 2) {
          const y = CANVAS_PX / 2 + vertNudge * (0.6 + i * 0.15)
            + Math.sin(x * w.freq + t * w.speed + w.phase + phaseNudge * sign) * w.amp
            + Math.sin(x * w.freq * 0.5 + t * w.speed * 0.7) * (w.amp * 0.4)
          if (x === 0) ctx.moveTo(x, y)
          else         ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(171, 156, 125, ${w.alpha})`
        ctx.lineWidth   = 1.5
        ctx.shadowColor = 'rgba(171, 156, 125, 0.25)'
        ctx.shadowBlur  = 8
        ctx.stroke()
      })

      animId = requestAnimationFrame(draw)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = outer.getBoundingClientRect()
      mouseRef.current = {
        nx: (e.clientX - rect.left) / rect.width,
        ny: (e.clientY - rect.top)  / rect.height,
        active: true,
      }
    }
    const handleMouseLeave = () => { mouseRef.current.active = false }

    outer.addEventListener('mousemove',  handleMouseMove)
    outer.addEventListener('mouseleave', handleMouseLeave)

    animId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animId)
      outer.removeEventListener('mousemove',  handleMouseMove)
      outer.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div
      ref={outerRef}
      className="relative shrink-0"
      style={{ width: CANVAS_PX, height: CANVAS_PX }}
    >
      <div
        style={{
          position:   'absolute',
          top:        '50%',
          left:       '50%',
          width:      SQUARE_PX,
          height:     SQUARE_PX,
          marginTop:  -SQUARE_PX / 2,
          marginLeft: -SQUARE_PX / 2,
          transform:  'rotate(45deg)',
          border:     '1px solid rgba(171,156,125,0.55)',
          overflow:   'hidden',
          boxShadow:  '0 0 40px 0 rgba(171,156,125,0.07)',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position:  'absolute',
            width:     CANVAS_PX,
            height:    CANVAS_PX,
            top:       OFFSET_PX,
            left:      OFFSET_PX,
            transform: 'rotate(-45deg)',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

/* ── Section heading variants ────────────────────────────── */
const headingVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const contentVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
}

/* ── Pillar text block ───────────────────────────────────── */
function PillarText({
  pillar,
  align,
}: {
  pillar: (typeof pillars)[0]
  align: 'left' | 'right'
}) {
  return (
    <div className={cn('flex flex-col gap-2.5', align === 'right' ? 'text-right items-end' : 'text-left items-start')}>
      <h3 className="text-xl font-bold leading-snug text-foreground transition-colors duration-300 group-hover:text-ums-gold max-w-[280px]">
        {pillar.name}
      </h3>
      <p className="text-sm leading-relaxed text-ums-muted max-w-[280px]">
        {pillar.description}
      </p>
    </div>
  )
}

/* ── Pillar icon block ───────────────────────────────────── */
function PillarIcon({ icon: Icon }: { icon: ElementType }) {
  return (
    <div className="shrink-0 flex h-16 w-16 items-center justify-center transition-all duration-300 group-hover:drop-shadow-[0_0_14px_rgba(171,156,125,0.45)]">
      <Icon
        size={40}
        className="text-ums-muted/70 transition-colors duration-300 group-hover:text-ums-gold"
        aria-hidden="true"
      />
    </div>
  )
}

/* ── Mobile pillar card ──────────────────────────────────── */
function MobilePillarCard({ pillar }: { pillar: (typeof pillars)[0] }) {
  const Icon = pillar.icon
  return (
    <div className="group flex flex-col gap-3 cursor-default py-4">
      <Icon
        size={32}
        className="text-ums-muted/70 transition-colors duration-300 group-hover:text-ums-gold"
        aria-hidden="true"
      />
      <h3 className="text-base font-bold leading-snug text-foreground transition-colors duration-300 group-hover:text-ums-gold">
        {pillar.name}
      </h3>
      <p className="text-sm leading-relaxed text-ums-muted">
        {pillar.description}
      </p>
    </div>
  )
}

/* ── Main section ────────────────────────────────────────── */
export default function FourPillarsSection() {
  return (
    <section
      id="about"
      className="bg-ums-bg py-28 px-6 lg:px-8"
      aria-labelledby="pillars-heading"
    >
      <div className="mx-auto max-w-6xl">

        {/* Section header */}
        <m.div
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 text-center"
        >
          <div className="mx-auto mb-6 h-px w-16 bg-ums-gold" />
          <h2
            id="pillars-heading"
            className="text-4xl font-bold tracking-tight text-ums-gold md:text-5xl"
          >
            Four Pillars. One Firm.
          </h2>
          <p className="mt-4 text-sm text-ums-muted uppercase tracking-[0.25em]">
            Everything we do is built on these foundations
          </p>
        </m.div>

        {/* ── Mobile layout (< lg) — 2×2 grid ── */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:hidden">
          {pillars.map(p => (
            <MobilePillarCard key={p.name} pillar={p} />
          ))}
        </div>

        {/* ── Desktop layout (≥ lg) — diamond composition ── */}
        <m.div
          variants={contentVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center gap-8 xl:gap-12"
        >
          {/* Left column */}
          <div className="flex flex-col justify-between self-stretch gap-8">
            {/* TL */}
            <div className="group flex flex-1 items-center justify-end gap-6 cursor-default">
              <PillarText pillar={pillars[0]} align="left" />
              <PillarIcon icon={pillars[0].icon} />
            </div>

            <div className="mx-auto h-px w-full max-w-[80%] bg-ums-border/40" />

            {/* BL */}
            <div className="group flex flex-1 items-center justify-end gap-6 cursor-default">
              <PillarText pillar={pillars[2]} align="left" />
              <PillarIcon icon={pillars[2].icon} />
            </div>
          </div>

          {/* Center — animated diamond */}
          <DiamondWave />

          {/* Right column */}
          <div className="flex flex-col justify-between self-stretch gap-8">
            {/* TR */}
            <div className="group flex flex-1 items-center justify-start gap-6 cursor-default">
              <PillarIcon icon={pillars[1].icon} />
              <PillarText pillar={pillars[1]} align="right" />
            </div>

            <div className="mx-auto h-px w-full max-w-[80%] bg-ums-border/40" />

            {/* BR */}
            <div className="group flex flex-1 items-center justify-start gap-6 cursor-default">
              <PillarIcon icon={pillars[3].icon} />
              <PillarText pillar={pillars[3]} align="right" />
            </div>
          </div>
        </m.div>
      </div>
    </section>
  )
}
