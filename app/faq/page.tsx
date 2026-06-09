import FAQSection from '@/components/sections/FAQSection'

export const metadata = {
  title: 'FAQ | Unique Management Solutions',
  description: 'Frequently asked questions about UMS Template Store — purchasing, file delivery, template formats, and more.',
}

export default function FAQPage() {
  return (
    <div className="bg-ums-bg min-h-screen">
      <FAQSection />
    </div>
  )
}
