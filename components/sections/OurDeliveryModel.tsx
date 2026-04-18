'use client'

import { m, type Variants } from 'framer-motion'
import { Download, Palette, Layers } from 'lucide-react'
import Link from 'next/link'

const MAILTO = 'mailto:info@ums-solutions.com'

const deliveryCards = [
  {
    icon: Download,
    badge: 'Instant Download',
    title: 'Self-Serve',
    description:
      'Browse the store, buy what you need, and download immediately. Consultant-grade frameworks ready to use from the moment of purchase.',
    cta: { label: 'Explore Our Store', href: '/store', external: false },
    highlight: true,
  },
  {
    icon: Palette,
    badge: 'Custom Quotation',
    title: 'Branded Edition',
    description:
      'Your framework, your brand. We take any template from our library and adapt it to your organisation\'s visual identity, tone, and structure.',
    cta: { label: 'Request a Quotation', href: MAILTO, external: true },
    highlight: false,
  },
  {
    icon: Layers,
    badge: 'Custom Quotation',
    title: 'Strategic Build',
    description:
      'End-to-end consulting delivery. We work alongside you to build the strategy, the frameworks, and the outputs your organisation needs from the ground up.',
    cta: { label: 'Request a Quotation', href: MAILTO, external: true },
    highlight: false,
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
            Every Framework. Delivered Three Ways.
          </h2>
          <p className="mt-4 text-sm text-ums-muted uppercase tracking-[0.25em]">
            Choose the model that fits your need
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
    cta: { label: string; href: string; external: boolean }
    highlight: boolean
  }
}) {
  const Icon = card.icon

  const cardStyle = card.highlight
    ? {
        borderColor: '#AB9C7D',
        boxShadow: '0 0 0 1px #AB9C7D, 0 0 32px 0 rgba(171,156,125,0.10)',
      }
    : {
        borderColor: '#5D523C',
        boxShadow: 'none',
      }

  return (
    <m.div
      variants={cardVariants}
      style={cardStyle}
      className="relative flex flex-col gap-6 rounded-xl border bg-[#201F1D] p-8"
    >
      {/* Primary path accent line */}
      {card.highlight && (
        <div className="absolute inset-x-0 top-0 h-px rounded-t-xl bg-gradient-to-r from-transparent via-ums-gold to-transparent" />
      )}

      {/* Badge */}
      <span
        className="inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{
          border: '1px solid',
          borderColor: card.highlight ? '#AB9C7D' : '#5D523C',
          color: card.highlight ? '#AB9C7D' : '#888073',
        }}
      >
        {card.badge}
      </span>

      {/* Icon + title */}
      <div className="flex items-start gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border"
          style={{
            borderColor: card.highlight ? '#AB9C7D' : '#5D523C',
            backgroundColor: card.highlight ? 'rgba(171,156,125,0.08)' : 'transparent',
          }}
        >
          <Icon
            size={20}
            style={{ color: card.highlight ? '#AB9C7D' : '#888073' }}
            aria-hidden="true"
          />
        </div>
        <h3
          className="text-xl font-bold leading-snug"
          style={{ color: card.highlight ? '#AB9C7D' : '#F5F0E8' }}
        >
          {card.title}
        </h3>
      </div>

      {/* Description */}
      <p className="grow text-sm leading-relaxed text-ums-muted">
        {card.description}
      </p>

      {/* CTA */}
      {card.cta.external ? (
        <a
          href={card.cta.href}
          className="inline-flex w-full items-center justify-center rounded-md border border-ums-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-ums-gold hover:text-ums-gold"
        >
          {card.cta.label}
        </a>
      ) : (
        <Link
          href={card.cta.href}
          className="inline-flex w-full items-center justify-center rounded-md px-5 py-3 text-sm font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#AB9C7D', color: '#1A1918' }}
        >
          {card.cta.label}
        </Link>
      )}
    </m.div>
  )
}
