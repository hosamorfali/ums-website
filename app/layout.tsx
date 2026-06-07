import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Providers } from './providers'

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
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Unique Management Solutions',
    description: 'Complexity into Clarity. Crafted to Impress.',
    url: 'https://www.ums-solutions.com',
    siteName: 'Unique Management Solutions',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.ums-solutions.com/UMS_og_image.png',
        width: 1200,
        height: 630,
        alt: 'Unique Management Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unique Management Solutions',
    description: 'Complexity into Clarity. Crafted to Impress.',
    images: ['https://www.ums-solutions.com/UMS_og_image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
