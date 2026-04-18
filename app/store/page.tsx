export const metadata = {
  title: 'Template Store | Unique Management Solutions',
  description:
    'Consultant-grade strategy templates — ready to download, ready to use. One time purchase. Lifetime use.',
}

export default function StorePage() {
  return (
    <div className="min-h-screen bg-ums-bg relative overflow-hidden">
      {/*
        Three-level interactive experience:
        S-BG  Stars Background Layer    — built in next section
        L1    Category Orbit            — built in next section
        L2    Template Neural Network   — built in next section
        L3    Template Cards + Request  — built in next section
      */}
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-ums-muted text-sm">Store loading…</p>
      </div>
    </div>
  )
}
