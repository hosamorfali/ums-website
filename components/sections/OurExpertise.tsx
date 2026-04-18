'use client'

import { m, type Variants } from 'framer-motion'
import {
  Target, Megaphone, BarChart2,
  FileText, TrendingUp, Rocket,
  FolderSearch, Award, Navigation,
} from 'lucide-react'

const expertiseAreas = [
  {
    icon: Target,
    name: 'Strategy Development & Planning',
  },
  {
    icon: Megaphone,
    name: 'MARCOM Strategies',
  },
  {
    icon: BarChart2,
    name: 'Benchmark Studies',
  },
  {
    icon: FileText,
    name: 'Proposal Development',
  },
  {
    icon: TrendingUp,
    name: 'Financial Analysis & Forecasting',
  },
  {
    icon: Rocket,
    name: 'Start-up Kits',
  },
  {
    icon: FolderSearch,
    name: 'Initiative Detailing',
  },
  {
    icon: Award,
    name: 'Sponsorship Packages',
  },
  {
    icon: Navigation,
    name: 'Customer Journey & Experience',
  },
]

const sectionVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const gridVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function OurExpertiseSection() {
  return (
    <section
      id="expertise"
      className="bg-[#1C1B19] py-28 px-6 lg:px-8"
      aria-labelledby="expertise-heading"
    >
      <div className="mx-auto max-w-6xl">

        {/* Section header */}
        <m.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-6 text-center"
        >
          <div className="mx-auto mb-6 h-px w-16 bg-ums-gold" />
          <h2
            id="expertise-heading"
            className="text-4xl font-bold tracking-tight text-ums-gold md:text-5xl"
          >
            Our Expertise
          </h2>
        </m.div>

        {/* Large stat header */}
        <m.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-16 text-center"
        >
          <p className="text-2xl font-bold text-foreground md:text-3xl">
            7+ Years of Collective Consulting Experience
          </p>
          <p className="mt-3 text-sm text-ums-muted uppercase tracking-[0.25em]">
            Delivered across strategy, communications, financial planning, and operational excellence
          </p>
        </m.div>

        {/* 3-column open grid with vertical dividers */}
        <m.div
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#5D523C]"
        >
          {[0, 1, 2].map(col => (
            <div key={col} className="flex flex-col divide-y divide-[#5D523C]">
              {expertiseAreas.slice(col * 3, col * 3 + 3).map(area => {
                const Icon = area.icon
                return (
                  <m.div
                    key={area.name}
                    variants={itemVariants}
                    className="group flex items-center gap-5 px-8 py-7 cursor-default"
                  >
                    <Icon
                      size={28}
                      className="shrink-0 text-ums-muted/60 transition-all duration-300 group-hover:text-ums-gold group-hover:drop-shadow-[0_0_10px_rgba(171,156,125,0.5)]"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-ums-gold">
                      {area.name}
                    </span>
                  </m.div>
                )
              })}
            </div>
          ))}
        </m.div>
      </div>
    </section>
  )
}
