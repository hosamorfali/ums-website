'use client'

import { m, type Variants } from 'framer-motion'
import { Diamond } from 'lucide-react'

const expertiseAreas = [
  {
    name: 'Strategy Development & Planning',
    descriptor: 'Translating vision into clear, executable strategic direction that your team can own and deliver.',
  },
  {
    name: 'MARCOM Strategies',
    descriptor: 'Integrated marketing and communications strategies built around brand clarity and measurable impact.',
  },
  {
    name: 'Benchmark Studies',
    descriptor: 'Data-driven comparisons that reveal exactly where you stand — and where the opportunity lives.',
  },
  {
    name: 'Proposal Development',
    descriptor: 'Structured, compelling proposals that communicate your value and consistently raise the winning rate.',
  },
  {
    name: 'Financial Analysis & Forecasting',
    descriptor: 'Clear financial modelling and scenario planning that supports confident, informed decisions.',
  },
  {
    name: 'Start-up Kits',
    descriptor: 'Foundational tools for new ventures — from strategic positioning to operational launch readiness.',
  },
  {
    name: 'Initiative Detailing',
    descriptor: 'Scoping and defining each initiative with clarity: objectives, owners, timelines, and success metrics.',
  },
  {
    name: 'Sponsorship Packages',
    descriptor: 'Compelling sponsorship frameworks designed to attract the right partners and maximize return.',
  },
  {
    name: 'Customer Journey & Experience',
    descriptor: 'Mapping every touchpoint to design seamless experiences that build loyalty and drive advocacy.',
  },
]

const sectionVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const gridVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function OurExpertiseSection() {
  return (
    <section
      id="expertise"
      className="bg-ums-bg py-28 px-6 lg:px-8"
      aria-labelledby="expertise-heading"
    >
      <div className="mx-auto max-w-6xl">

        {/* Section header */}
        <m.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 text-center"
        >
          <div className="mx-auto mb-6 h-px w-16 bg-ums-gold" />
          <h2
            id="expertise-heading"
            className="text-4xl font-bold tracking-tight text-ums-gold md:text-5xl"
          >
            Our Expertise
          </h2>
          <p className="mt-4 text-sm text-ums-muted uppercase tracking-[0.25em]">
            What we do best
          </p>
        </m.div>

        {/* Diamond banner */}
        <m.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-12 flex items-center gap-4 rounded-xl border border-ums-border bg-[#201F1D] px-8 py-5"
        >
          <Diamond
            size={22}
            className="shrink-0 text-ums-gold"
            aria-hidden="true"
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <span className="text-base font-semibold text-ums-gold whitespace-nowrap">
              7+ Years of Collective Consulting Experience
            </span>
            <span className="hidden sm:block h-4 w-px bg-ums-border" />
            <span className="text-sm text-ums-muted leading-snug">
              Delivered across strategy, communications, financial planning, and operational excellence.
            </span>
          </div>
        </m.div>

        {/* 3×3 card grid */}
        <m.div
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {expertiseAreas.map((area) => (
            <ExpertiseCard key={area.name} area={area} />
          ))}
        </m.div>
      </div>
    </section>
  )
}

function ExpertiseCard({ area }: { area: { name: string; descriptor: string } }) {
  return (
    <m.div
      variants={cardVariants}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col gap-3 rounded-xl border border-ums-border bg-[#201F1D] p-6 transition-all duration-300 hover:border-ums-gold/60"
      style={{ boxShadow: '0 0 0 0 transparent' }}
    >
      {/* Hover gold glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow: '0 0 0 1px #AB9C7D, 0 0 20px 0 rgba(171,156,125,0.12)',
        }}
      />

      {/* Gold dot accent */}
      <div className="h-1.5 w-1.5 rounded-full bg-ums-gold opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

      <h3 className="text-sm font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-ums-gold">
        {area.name}
      </h3>
      <p className="text-xs leading-relaxed text-ums-muted">
        {area.descriptor}
      </p>
    </m.div>
  )
}
