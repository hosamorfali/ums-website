'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Template } from './store-data'

export interface CartItem { template: Template }

interface CartCtx {
  items:       CartItem[]
  addItem:     (t: Template) => void
  removeItem:  (id: string) => void
  clearCart:   () => void
  drawerOpen:  boolean
  openDrawer:  () => void
  closeDrawer: () => void
  totalCount:  number
  totalPrice:  number
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items,      setItems]      = useState<CartItem[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  const addItem = useCallback((t: Template) => {
    setItems(prev => prev.find(i => i.template.id === t.id) ? prev : [...prev, { template: t }])
    setDrawerOpen(true)
  }, [])

  const removeItem  = useCallback((id: string) => setItems(p => p.filter(i => i.template.id !== id)), [])
  const clearCart   = useCallback(() => setItems([]), [])
  const openDrawer  = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const totalCount  = items.length
  const totalPrice  = items.reduce((s, i) => s + i.template.price, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, drawerOpen, openDrawer, closeDrawer, totalCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
