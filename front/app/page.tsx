import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/home/hero-section';
import { BrandsCarousel } from '@/components/home/brands-carousel';
import { StatsSection } from '@/components/home/stats-section';
import { WhyUsSection } from '@/components/home/why-us-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { CtaSection } from '@/components/home/cta-section';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <BrandsCarousel />
        <FeaturedProducts />
        <StatsSection />
        <WhyUsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
