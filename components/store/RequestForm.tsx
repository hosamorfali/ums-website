'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { X, MessageSquarePlus } from 'lucide-react'
import { sendTemplateRequest } from '@/lib/emailjs'

export function RequestForm() {
  const [open,        setOpen]        = useState(false)
  const [fromName,    setFromName]    = useState('')
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [email,       setEmail]       = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [done,        setDone]        = useState(false)

  const reset = useCallback(() => {
    setFromName('')
    setName('')
    setDescription('')
    setEmail('')
    setDone(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await sendTemplateRequest({ from_name: fromName, template_name: name, description, from_email: email })
    } catch {
      // EmailJS failed — silent fallback (credentials may not be set yet)
    } finally {
      setSubmitting(false)
      setDone(true)
    }
  }

  return (
    <div className="absolute bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <m.div
            key="request-panel"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={   { opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col gap-4 p-5"
            style={{
              width:        320,
              background:   '#1A1918',
              border:       '1px solid #5D523C',
              borderRadius: 16,
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">Request a Template</p>
              <button
                onClick={() => { setOpen(false); reset() }}
                className="text-ums-muted hover:text-ums-gold transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>

            {done ? (
              <p className="text-xs text-ums-muted text-center py-4 leading-relaxed">
                Your request helps us deliver the best outcome — thank you. We&apos;ll review it and be in touch soon.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  required
                  placeholder="Your name"
                  value={fromName}
                  onChange={e => setFromName(e.target.value)}
                  className="w-full rounded-md px-3 py-2 text-xs text-white placeholder-ums-muted bg-transparent outline-none focus:border-ums-gold/60 transition-colors"
                  style={{ border: '1px solid #5D523C' }}
                />
                <input
                  required
                  placeholder="Template name or topic"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-md px-3 py-2 text-xs text-white placeholder-ums-muted bg-transparent outline-none focus:border-ums-gold/60 transition-colors"
                  style={{ border: '1px solid #5D523C' }}
                />
                <textarea
                  placeholder="Brief description of what you need"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md px-3 py-2 text-xs text-white placeholder-ums-muted bg-transparent outline-none resize-none focus:border-ums-gold/60 transition-colors"
                  style={{ border: '1px solid #5D523C' }}
                />
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-md px-3 py-2 text-xs text-white placeholder-ums-muted bg-transparent outline-none focus:border-ums-gold/60 transition-colors"
                  style={{ border: '1px solid #5D523C' }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-md text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
                  style={{ background: '#AB9C7D', color: '#1A1918' }}
                >
                  {submitting ? 'Sending…' : 'Send Request'}
                </button>
              </form>
            )}
          </m.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90 shadow-lg cursor-pointer"
        style={{ background: '#AB9C7D', color: '#1A1918' }}
      >
        <MessageSquarePlus size={13} />
        Don&apos;t see what you need?
      </button>
    </div>
  )
}
