'use client'

import { m, type Variants } from 'framer-motion'
import { Download, Palette, Layers } from 'lucide-react'

const MAILTO = 'mailto:info@ums-solutions.com'

const deliveryCards = [
  {
    icon: Download,
    badge: 'Instant Purchase',
    title: 'Self-Serve',
    description:
      'Select the template you need and start using it immediately. No setup, no complexity, just ready-to-use, consultant-grade frameworks. Every template is structured to guide you and transfer the knowledge behind the work.',
  },
  {
    icon: Palette,
    badge: 'Custom Request',
    title: 'Tailored Edition',
    description:
      'We take any template from our library and tailor it to your organization\'s visual identity, while building the content and refining the overall strategic narrative for your context.',
  },
  {
    icon: Layers,
    badge: 'Custom Engagement',
    title: 'Full-Service Delivery',
    description:
      'We work alongside you to fully understand your challenges, define the right approach, and build the tools, narrative, and story required to deliver a complete, submission-ready output.',
  },
]

const sectionVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function OurDeliveryModelSection() {
  return (
    <section
      id="services"
      className="bg-[#1C1B19] py-28 px-6 lg:px-8"
      aria-labelledby="delivery-heading"
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
            id="delivery-heading"
            className="text-4xl font-bold tracking-tight text-ums-gold md:text-5xl"
          >
            Our Service Models
          </h2>
          <p className="mt-4 text-sm text-ums-muted uppercase tracking-[0.25em]">
            From self-serve tools to fully delivered solutions, choose the level of support you need
          </p>
        </m.div>

        {/* Three cards */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {deliveryCards.map((card) => (
            <DeliveryCard key={card.title} card={card} />
          ))}
        </m.div>

        {/* Footer note */}
        <m.p
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-10 text-center text-sm text-ums-muted"
        >
          Not sure which option fits?{' '}
          <a
            href={MAILTO}
            className="text-ums-gold underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            Reach out at info@ums-solutions.com
          </a>{' '}
          — we will guide you.
        </m.p>
      </div>
    </section>
  )
}

function DeliveryCard({
  card,
}: {
  card: {
    icon: React.ElementType
    badge: string
    title: string
    description: string
  }
}) {
  const Icon = card.icon

  return (
    <m.div
      variants={cardVariants}
      className="group relative flex flex-col gap-6 rounded-xl border border-[#5D523C] bg-[#201F1D] p-8 transition-all duration-300 hover:border-ums-gold/60"
      style={{ boxShadow: '0 0 0 0 transparent' }}
    >
      {/* Hover gold glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: '0 0 0 1px rgba(171,156,125,0.5), 0 0 28px 0 rgba(171,156,125,0.08)' }}
      />

      {/* Badge */}
      <span
        className="inline-flex w-fit items-center rounded-full border border-[#5D523C] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ums-muted"
      >
        {card.badge}
      </span>

      {/* Icon + title */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#5D523C] transition-all duration-300 group-hover:border-ums-gold/40">
          <Icon
            size={20}
            className="text-ums-muted transition-colors duration-300 group-hover:text-ums-gold"
            aria-hidden="true"
          />
        </div>
        <h3 className="text-xl font-bold leading-snug text-foreground transition-colors duration-300 group-hover:text-ums-gold">
          {card.title}
        </h3>
      </div>

      {/* Description */}
      <p className="grow text-sm leading-relaxed text-ums-muted">
        {card.description}
      </p>
    </m.div>
  )
}
