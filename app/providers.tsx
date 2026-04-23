'use client'

import { LazyMotion, domAnimation } from 'framer-motion'
import { CartProvider } from '@/lib/cart-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <CartProvider>{children}</CartProvider>
    </LazyMotion>
  )
}
