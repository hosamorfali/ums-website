import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Unique Management Solutions | Complexity into Clarity',
  description:
    'Your trusted Saudi partner for turning complexity into clarity. Consultant-grade strategy templates, business solutions, and management consulting — crafted to impress.',
  metadataBase: new URL('https://ums-solutions.com'),
  openGraph: {
    title: 'Unique Management Solutions',
    description: 'Complexity into Clarity. Crafted to Impress.',
    url: 'https://ums-solutions.com',
    siteName: 'Unique Management Solutions',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
