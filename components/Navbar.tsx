'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { X, Menu, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'

const NAV_LINKS = [
  { label: 'About',     href: '/#about' },
  { label: 'Expertise', href: '/#expertise' },
  { label: 'Services',  href: '/#services' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const isStore  = pathname === '/store'

  const { totalCount, openDrawer } = useCart()

  const handleCartClick = () => {
    if (isStore) { openDrawer() }
    else         { router.push('/store') }
  }

  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ums-bg border-b border-ums-border">
      <nav className="w-full px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
          <Image
            src="/UMS Logo/UMS_logo_upscaled_faithful.png"
            alt="Unique Management Solutions"
            width={220}
            height={73}
            className="h-7 w-auto object-contain"
            unoptimized
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

          {/* Get in Touch CTA */}
          <Link
            href="/#contact"
            className="text-sm font-semibold bg-ums-gold text-ums-bg px-5 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Get in Touch
          </Link>

          {/* Cart icon — far right */}
          <button
            onClick={handleCartClick}
            className="relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/5 transition-colors"
            style={{ color: totalCount > 0 ? '#AB9C7D' : '#888073', cursor: 'pointer' }}
            aria-label="Open cart"
          >
            <ShoppingCart size={17} />
            {totalCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                style={{ background: '#AB9C7D', color: '#1A1918' }}
              >
                {totalCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={handleCartClick}
            className="relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/5 transition-colors"
            style={{ color: totalCount > 0 ? '#AB9C7D' : '#888073', cursor: 'pointer' }}
            aria-label="Open cart"
          >
            <ShoppingCart size={17} />
            {totalCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                style={{ background: '#AB9C7D', color: '#1A1918' }}
              >
                {totalCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="text-ums-muted hover:text-ums-gold transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
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
