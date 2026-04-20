'use client'

import { useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'What makes UMS Template Store different from other templates found online?',
    a: 'UMS Template Store does not simply provide templates for use. Each template is handcrafted and logically structured to transfer knowledge of how a given framework applies in practice. Every purchase includes a full kit: contextual explanation of the slide logic, a completed example for review and learning, and a clean empty template ready for your use.',
  },
  {
    q: 'What will I get from the Template Store?',
    a: 'The Template Store is designed to let you freely explore and browse by category and by individual template. You may purchase individual templates or full bundle kits, depending on your needs.',
  },
  {
    q: 'What categories does the Template Store cover?',
    a: 'We aim to cover end-to-end project dimensions based on our expertise in the consulting field, spanning strategy, project management, marketing and communication, and signature frameworks. Our library is continuously updated to reflect what matters most to our users.',
  },
  {
    q: 'What does the Signature Frameworks category contain?',
    a: 'Signature Frameworks are frameworks we have evaluated as visually compelling and exceptionally effective at translating complex narratives into a single, clear layout. It is the ideal category to explore when you are dealing with dense or intricate information and need to communicate it in a simple, visually impactful way.',
  },
  {
    q: 'How will I receive my template after purchase?',
    a: 'Upon completing your purchase, your template files will be delivered instantly to your registered email as a secure download link. You can access and download your files immediately after payment confirmation. Bundle kits are delivered as a single compressed file containing all templates included in the kit.',
  },
  {
    q: 'I need a specific template created. Can UMS make it for me?',
    a: 'Yes. We accommodate custom template requests through a tailored quotation process. Reach out to us at info@ums-solutions.com and we will make it happen.',
  },
  {
    q: 'Are the templates reusable?',
    a: 'Yes. All templates are fully reusable across your projects without limitation.',
  },
  {
    q: 'Can UMS apply my company\'s brand guidelines to a template I have purchased?',
    a: 'Yes. We offer a branding customization service at a fixed quotation rate, based on the number of slides requiring alteration. Reach out to us at info@ums-solutions.com and we will make it happen.',
  },
  {
    q: 'How frequently does UMS release new templates?',
    a: 'We plan to release new frameworks on a weekly basis. Our philosophy is quality over quantity, and we are committed to ensuring every release delivers genuine value. You are also welcome to recommend a framework you would like to see, and we will work to make it happen.',
  },
  {
    q: 'Are there bundle kits available?',
    a: 'Yes. Bundle kits are available and typically contain a curated collection of template kits across a category. You will find them within the Template Store.',
  },
  {
    q: 'How do I navigate through the Template Store?',
    a: 'Select the category you wish to explore, then browse the templates and kits available within it. Each template is presented individually, allowing you to review its contents before making a decision.',
  },
  {
    q: 'What software do I need to use the templates?',
    a: 'Our templates are built for Microsoft PowerPoint and Microsoft Excel. No additional software or design experience is required.',
  },
  {
    q: 'Can I share or redistribute a template I have purchased?',
    a: 'No. All templates are licensed exclusively to the purchasing individual or entity under UMS intellectual property terms. Redistribution, resale, or sharing of template files in any form is strictly prohibited.',
  },
  {
    q: 'Will UMS be available in other languages?',
    a: 'We are currently in our testing phase and are actively working toward releasing Arabic versions of our frameworks. Our goal is to make UMS Template Store accessible to a wider regional audience, and this is a priority on our roadmap.',
  },
  {
    q: 'Do I need design experience to use the templates?',
    a: 'No design experience is required. Each template is delivered ready to use, with clear structure and guided logic, so that any professional can apply it immediately and independently.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i))

  return (
    <section className="bg-ums-bg py-28 px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-16 text-center"
        >
          <div className="mx-auto mb-6 h-px w-16 bg-ums-gold" />
          <h2 className="text-4xl font-bold tracking-tight text-ums-gold md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-sm text-ums-muted uppercase tracking-[0.25em]">
            Everything you need to know
          </p>
        </m.div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3), ease: 'easeOut' }}
              >
                <div
                  style={{
                    border:       `1px solid ${isOpen ? '#AB9C7D' : '#5D523C'}`,
                    borderRadius: 12,
                    background:   '#1A1918',
                    transition:   'border-color 0.2s',
                    overflow:     'hidden',
                  }}
                >
                  {/* Question row */}
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="text-sm font-semibold text-foreground leading-snug">
                      {faq.q}
                    </span>
                    <m.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="shrink-0"
                      style={{ color: '#AB9C7D' }}
                    >
                      <ChevronDown size={16} />
                    </m.span>
                  </button>

                  {/* Answer */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <m.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          className="px-6 pb-5"
                          style={{ borderTop: '1px solid #5D523C' }}
                        >
                          <p className="pt-4 text-sm leading-relaxed text-ums-muted">
                            {faq.a}
                          </p>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </m.div>
            )
          })}
        </div>

        {/* Bottom block */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mt-16 text-center"
        >
          <div
            className="rounded-xl px-8 py-10"
            style={{ border: '1px solid #5D523C', background: '#1A1918' }}
          >
            <p className="text-sm leading-relaxed" style={{ color: '#AB9C7D' }}>
              Our team is always here to help. If you have any questions or concerns, email us at{' '}
              <a
                href="mailto:info@ums-solutions.com"
                className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                style={{ color: '#AB9C7D' }}
              >
                info@ums-solutions.com
              </a>{' '}
              and we&apos;ll respond as soon as possible.
            </p>
          </div>
        </m.div>

      </div>
    </section>
  )
}
