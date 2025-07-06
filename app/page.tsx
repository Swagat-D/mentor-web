'use client'

import Navbar from '@/components/layout/navbar'
import HeroSection from '@/components/sections/hero-section'
import FeaturesSection from '@/components/sections/features-section'
import HowItWorksSection from '@/components/sections/how-it-works'
import Footer from '@/components/layout/footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-bg-primary via-warm-100 to-legal-bg-secondary">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        
      </main>
      <Footer />
    </div>
  )
}