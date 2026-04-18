import HeroSection       from '@/components/sections/Hero'
import FourPillarsSection from '@/components/sections/FourPillars'

export default function HomePage() {
  return (
    <div className="bg-ums-bg">
      <HeroSection />
      <FourPillarsSection />
      <section id="expertise" className="min-h-screen" />
      <section id="services"  className="min-h-screen" />
      <section id="store"     className="min-h-screen" />
      <section id="contact"   className="min-h-screen" />
    </div>
  )
}
