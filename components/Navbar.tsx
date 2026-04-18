'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, X, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { subscribeEmail } from '@/lib/shopify'

const NAV_LINKS = [
  { label: 'About',     href: '/#about' },
  { label: 'Services',  href: '/#services' },
  { label: 'Expertise', href: '/#expertise' },
]

export default function Navbar() {
  const pathname = usePathname()
  const isStore  = pathname === '/store'

  const [insightsOpen, setInsightsOpen]     = useState(false)
  const [mobileOpen,   setMobileOpen]       = useState(false)
  const [email,        setEmail]            = useState('')
  const [subStatus,    setSubStatus]        = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const dropdownRef = useRef<HTMLDivElement>(null)

  /* Close dropdown on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setInsightsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubStatus('loading')
    try {
      await subscribeEmail(email, 'navbar-subscriber')
      setSubStatus('done')
      setEmail('')
    } catch {
      setSubStatus('error')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ums-bg border-b border-ums-border">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
          <Image
            src="/UMS Logo/UMS_logo_upscaled_faithful.png"
            alt="Unique Management Solutions"
            width={120}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-ums-muted hover:text-ums-gold transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}

          {/* Store link */}
          <Link
            href="/store"
            className={cn(
              'text-sm font-medium transition-colors duration-200',
              isStore ? 'text-ums-gold' : 'text-ums-muted hover:text-ums-gold',
            )}
          >
            Store
          </Link>

          {/* Weekly Insights dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setInsightsOpen(v => !v)}
              className="flex items-center gap-1 text-sm font-medium text-ums-muted hover:text-ums-gold transition-colors duration-200"
              aria-expanded={insightsOpen}
              aria-haspopup="true"
            >
              Weekly Insights
              <ChevronDown
                size={14}
                className={cn('transition-transform duration-200', insightsOpen && 'rotate-180')}
              />
            </button>

            {insightsOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-ums-bg border border-ums-border rounded-lg p-4 shadow-xl shadow-black/40">
                <p className="text-xs text-ums-muted mb-3 leading-relaxed">
                  Get weekly strategy insights from the UMS team — straight to your inbox.
                </p>
                {subStatus === 'done' ? (
                  <p className="text-xs text-ums-gold text-center py-2">You&apos;re in. Welcome aboard.</p>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full text-sm bg-transparent border border-ums-border rounded px-3 py-2 text-foreground placeholder:text-ums-muted/50 focus:outline-none focus:border-ums-gold transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={subStatus === 'loading'}
                      className="w-full text-sm font-semibold bg-ums-gold text-ums-bg rounded px-3 py-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {subStatus === 'loading' ? 'Subscribing…' : 'Subscribe'}
                    </button>
                    {subStatus === 'error' && (
                      <p className="text-xs text-red-400 text-center">Something went wrong. Try again.</p>
                    )}
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Get in Touch CTA */}
          <Link
            href="/#contact"
            className="text-sm font-semibold bg-ums-gold text-ums-bg px-5 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Get in Touch
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="md:hidden text-ums-muted hover:text-ums-gold transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ums-border bg-ums-bg px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(link => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-ums-muted hover:text-ums-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/store"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'text-sm font-medium transition-colors',
              isStore ? 'text-ums-gold' : 'text-ums-muted hover:text-ums-gold',
            )}
          >
            Store
          </Link>
          <Link
            href="/#contact"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-semibold bg-ums-gold text-ums-bg px-5 py-2 rounded-md text-center hover:opacity-90 transition-opacity"
          >
            Get in Touch
          </Link>
        </div>
      )}
    </header>
  )
}
