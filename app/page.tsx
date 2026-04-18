import HeroSection from '@/components/sections/Hero'

export default function HomePage() {
  return (
    <div className="bg-ums-bg">
      <HeroSection />

      {/* Remaining sections — built one by one after each confirmation */}
      <section id="about"     className="min-h-screen" />
      <section id="expertise" className="min-h-screen" />
      <section id="services"  className="min-h-screen" />
      <section id="store"     className="min-h-screen" />
      <section id="contact"   className="min-h-screen" />
    </div>
  )
}
