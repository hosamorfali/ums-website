import HeroSection         from '@/components/sections/Hero'
import FourPillarsSection  from '@/components/sections/FourPillars'
import OurExpertiseSection from '@/components/sections/OurExpertise'
import OurDeliveryModel    from '@/components/sections/OurDeliveryModel'
import StoreTeaserSection  from '@/components/sections/StoreTeaserSection'
import FAQSection          from '@/components/sections/FAQSection'
import ConnectWithUs       from '@/components/sections/ConnectWithUs'

export default function HomePage() {
  return (
    <div className="bg-ums-bg">
      <HeroSection />
      <FourPillarsSection />
      <OurExpertiseSection />
      <OurDeliveryModel />
      <StoreTeaserSection />
      <FAQSection />
      <ConnectWithUs />
    </div>
  )
}
