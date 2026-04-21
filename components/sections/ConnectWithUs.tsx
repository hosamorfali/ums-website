'use client'

import { m, type Variants } from 'framer-motion'
import { Mail, Send, ArrowRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { subscribeEmail } from '@/lib/shopify'
import { sendContactEmail } from '@/lib/emailjs'

const sectionVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const colVariants: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.6, ease: 'easeOut' } },
}
const colRightVariants: Variants = {
  hidden:  { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function ConnectWithUsSection() {
  /* Contact form state */
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  /* Subscribe state */
  const [subEmail, setSubEmail] = useState('')
  const [subStatus, setSubStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormStatus('sending')
    try {
      await sendContactEmail({ from_name: form.name, phone_number: form.phone, from_email: form.email, message: form.message })
      setFormStatus('sent')
      setForm({ name: '', phone: '', email: '', message: '' })
    } catch {
      setFormStatus('error')
    }
  }

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault()
    if (!subEmail.trim()) return
    setSubStatus('sending')
    try {
      await subscribeEmail(subEmail.trim(), 'website-subscriber')
      setSubStatus('done')
      setSubEmail('')
    } catch {
      setSubStatus('error')
    }
  }

  return (
    <section
      id="contact"
      className="bg-ums-bg py-28 px-6 lg:px-8"
      aria-labelledby="contact-heading"
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
            id="contact-heading"
            className="text-4xl font-bold tracking-tight text-ums-gold md:text-5xl"
          >
            Connect With Us
          </h2>
          <p className="mt-4 text-sm text-ums-muted uppercase tracking-[0.25em]">
            Let&apos;s talk strategy
          </p>
        </m.div>

        {/* Two-column layout */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Left — contact info */}
          <m.div
            variants={colVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="flex flex-col gap-8"
          >
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Unique Management Solutions
              </h3>
              <p className="text-sm leading-relaxed text-ums-muted">
                Your trusted Saudi partner for turning complexity into clarity. Reach out to discuss consulting engagements, branded template editions, or any strategic challenge your organisation is facing.
              </p>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ums-border">
                <Mail size={16} className="text-ums-gold" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ums-muted mb-1">Email</p>
                <a
                  href="mailto:info@ums-solutions.com"
                  className="text-sm font-medium text-foreground hover:text-ums-gold transition-colors"
                >
                  info@ums-solutions.com
                </a>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ums-border">
                {/* LinkedIn logo SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-ums-gold" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ums-muted mb-1">LinkedIn</p>
                <a
                  href="https://www.linkedin.com/company/ums-management-solutions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-ums-gold transition-colors"
                >
                  Unique Management Solutions
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-ums-border" />

            {/* Email subscribe */}
            <div>
              <p className="mb-1 text-sm font-semibold text-foreground">Weekly Insights</p>
              <p className="mb-4 text-xs text-ums-muted">
                Strategy frameworks, consulting perspectives, and new template releases — straight to your inbox.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-3">
                <input
                  type="email"
                  value={subEmail}
                  onChange={e => setSubEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={subStatus === 'sending' || subStatus === 'done'}
                  className="flex-1 rounded-md border border-ums-border bg-[#201F1D] px-4 py-2.5 text-sm text-foreground placeholder:text-ums-muted/50 focus:outline-none focus:ring-1 focus:ring-ums-gold disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={subStatus === 'sending' || subStatus === 'done'}
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#AB9C7D', color: '#1A1918' }}
                >
                  <ArrowRight size={14} aria-hidden="true" />
                  {subStatus === 'sending' ? 'Subscribing…' : subStatus === 'done' ? 'Subscribed!' : 'Subscribe'}
                </button>
              </form>
              {subStatus === 'error' && (
                <p className="mt-2 text-xs text-red-400">Something went wrong — please try again.</p>
              )}
            </div>
          </m.div>

          {/* Right — contact form */}
          <m.div
            variants={colRightVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col gap-5 rounded-xl border border-ums-border bg-[#201F1D] p-8"
            >
              <h3 className="text-base font-semibold text-foreground">Send a Message</h3>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-name" className="text-xs uppercase tracking-[0.15em] text-ums-muted">
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  required
                  disabled={formStatus === 'sending' || formStatus === 'sent'}
                  className="rounded-md border border-ums-border bg-ums-bg px-4 py-3 text-sm text-foreground placeholder:text-ums-muted/40 focus:outline-none focus:ring-1 focus:ring-ums-gold disabled:opacity-50"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-phone" className="text-xs uppercase tracking-[0.15em] text-ums-muted">
                  Phone <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+966 5X XXX XXXX"
                  disabled={formStatus === 'sending' || formStatus === 'sent'}
                  className="rounded-md border border-ums-border bg-ums-bg px-4 py-3 text-sm text-foreground placeholder:text-ums-muted/40 focus:outline-none focus:ring-1 focus:ring-ums-gold disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-email" className="text-xs uppercase tracking-[0.15em] text-ums-muted">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                  disabled={formStatus === 'sending' || formStatus === 'sent'}
                  className="rounded-md border border-ums-border bg-ums-bg px-4 py-3 text-sm text-foreground placeholder:text-ums-muted/40 focus:outline-none focus:ring-1 focus:ring-ums-gold disabled:opacity-50"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-message" className="text-xs uppercase tracking-[0.15em] text-ums-muted">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us about your project or challenge…"
                  required
                  rows={5}
                  disabled={formStatus === 'sending' || formStatus === 'sent'}
                  className="resize-none rounded-md border border-ums-border bg-ums-bg px-4 py-3 text-sm text-foreground placeholder:text-ums-muted/40 focus:outline-none focus:ring-1 focus:ring-ums-gold disabled:opacity-50"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={formStatus === 'sending' || formStatus === 'sent'}
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#AB9C7D', color: '#1A1918' }}
              >
                <Send size={14} aria-hidden="true" />
                {formStatus === 'sending' ? 'Sending…'
                  : formStatus === 'sent'    ? 'Message Sent!'
                  : 'Send Message'}
              </button>

              {formStatus === 'error' && (
                <p className="text-xs text-red-400">
                  Something went wrong — please email us directly at{' '}
                  <a href="mailto:info@ums-solutions.com" className="underline">
                    info@ums-solutions.com
                  </a>
                </p>
              )}

              {formStatus === 'sent' && (
                <p className="text-xs text-ums-gold">
                  Thank you — your message has been sent. We&apos;ll be in touch soon.
                </p>
              )}
            </form>
          </m.div>
        </div>
      </div>
    </section>
  )
}
