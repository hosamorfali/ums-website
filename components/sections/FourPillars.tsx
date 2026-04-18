'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Briefcase, Lightbulb, Zap, LayoutTemplate } from 'lucide-react'

const pillars = [
  {
    icon: Briefcase,
    name: 'Business Solutions & Management Consulting',
    description:
      'From strategy design and benchmarking studies to foundational startup kits, we provide end-to-end management consulting services that translate your ambitions and challenges into a clear, structured blueprint for growth — alongside detailed proposals and bid submissions that accelerate your market penetration and winning rate.',
  },
  {
    icon: Lightbulb,
    name: 'Innovative Solutions',
    description:
      'Bridging traditional consulting with the power of AI, we combine structured thinking with the latest innovations to design digital tools and solutions — optimising your operations and building the competitive advantages that last.',
  },
  {
    icon: Zap,
    name: 'Rapid 360 Presentation Turnarounds',
    description:
      'Operating as an agile SWAT team, we take your presentation and deliver a full 360 turnaround — fast, precise, and uncompromising. Powered by design principles, structured consulting thinking, and visual storytelling, we turn complexity into clarity every time.',
  },
  {
    icon: LayoutTemplate,
    name: 'Tools & Templates Market',
    description:
      'Your on-demand library of consultant-grade slides and templates, ready to download and ready to use. From strategy frameworks and project management decks to startup kits and personal productivity tools — browse by category, buy what you need, and own it for life. One time purchase. Lifetime use.',
  },
]

const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15 } },
}
const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const headingVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function FourPillarsSection() {
  return (
    <section
      id="about"
      className="bg-ums-bg py-28 px-6 lg:px-8"
      aria-labelledby="pillars-heading"
    >
      <div className="mx-auto max-w-6xl">

        {/* Section header */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 text-center"
        >
          {/* Rule line above */}
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
        </motion.div>

        {/* 2×2 card grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-6 sm:grid-cols-2"
        >
          {pillars.map((pillar) => (
            <PillarCard key={pillar.name} pillar={pillar} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function PillarCard({
  pillar,
}: {
  pillar: { icon: React.ElementType; name: string; description: string }
}) {
  const [hovered, setHovered] = useState(false)
  const Icon = pillar.icon

  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered
          ? '0 0 0 1px #AB9C7D, 0 0 24px 0 rgba(171,156,125,0.18)'
          : '0 0 0 1px #5D523C',
        transition: 'box-shadow 0.3s ease',
      }}
      className="relative flex flex-col gap-5 rounded-xl bg-[#201F1D] p-8 cursor-default"
    >
      {/* Icon container */}
      <div
        className="flex h-12 w-12 items-center justify-center rounded-lg border transition-colors duration-300"
        style={{
          borderColor: hovered ? '#AB9C7D' : '#5D523C',
          backgroundColor: hovered ? 'rgba(171,156,125,0.08)' : 'transparent',
        }}
      >
        <Icon
          size={22}
          style={{ color: hovered ? '#AB9C7D' : '#888073' }}
          className="transition-colors duration-300"
          aria-hidden="true"
        />
      </div>

      {/* Pillar name */}
      <h3
        className="text-lg font-semibold leading-snug transition-colors duration-300"
        style={{ color: hovered ? '#AB9C7D' : '#F5F0E8' }}
      >
        {pillar.name}
      </h3>

      {/* Description */}
      <p className="text-sm leading-relaxed text-ums-muted">
        {pillar.description}
      </p>

      {/* Subtle corner accent on hover */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-16 w-16 rounded-br-xl transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background:
            'radial-gradient(circle at bottom right, rgba(171,156,125,0.12) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  )
}
