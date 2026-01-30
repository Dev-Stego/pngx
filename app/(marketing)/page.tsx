'use client';

// Header/Footer moved to layout
import {
  HeroSection,
  HowItWorks,
  ModesComparison,
  SecuritySection,
  BlockchainSection,
  UseCasesSection,
  FAQSection,
  CTABanner,
  StaticGradientBg,
} from '@/components/landing';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* How It Works */}
      <HowItWorks />

      {/* Mode Comparison */}
      <ModesComparison />

      {/* Security Architecture */}
      <SecuritySection />

      {/* Blockchain Recovery */}
      <BlockchainSection />

      {/* Use Cases */}
      <UseCasesSection />

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA */}
      <CTABanner />
    </>
  );
}
