import Link from 'next/link'

interface SearchParams {
  id?:      string
  status?:  string
  message?: string
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { status, message } = await searchParams
  const paid = status === 'paid' || status === 'authorized'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#1A1918' }}
    >
      <div
        className="flex flex-col items-center gap-6 text-center max-w-md w-full rounded-2xl p-10"
        style={{ border: `1px solid ${paid ? '#AB9C7D' : '#5D523C'}`, background: '#1A1918' }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center w-14 h-14 rounded-full text-2xl"
          style={{ background: paid ? 'rgba(171,156,125,0.12)' : 'rgba(93,82,60,0.2)' }}
        >
          {paid ? '✓' : '✕'}
        </div>

        {/* Title */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-2"
             style={{ color: '#AB9C7D' }}>
            {paid ? 'Payment Confirmed' : 'Payment Unsuccessful'}
          </p>
          <h1 className="text-xl font-bold text-white">
            {paid
              ? 'Your purchase is complete.'
              : 'Something went wrong.'}
          </h1>
        </div>

        {/* Body */}
        <p className="text-sm leading-relaxed" style={{ color: '#888073' }}>
          {paid
            ? 'Your template files will be delivered to your email shortly as a secure download link. Check your inbox — and your spam folder just in case.'
            : (message ?? 'Your payment could not be processed. No charge has been made. Please try again or contact us at info@ums-solutions.com.')}
        </p>

        {/* CTA */}
        <Link
          href="/store"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-90"
          style={{ background: '#AB9C7D', color: '#1A1918' }}
        >
          {paid ? 'Back to Store' : 'Try Again'}
        </Link>
      </div>
    </div>
  )
}
