import { Suspense } from 'react'
import { CheckoutContent } from './CheckoutContent'

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#1A1918' }}>
          <p className="text-sm animate-pulse" style={{ color: '#888073' }}>Confirming your payment…</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
