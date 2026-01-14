'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brands/brand-logo';
import { BRANDS, BRAND_CATEGORIES, type BrandCategory } from '@/data/brands';

const CATEGORIES_TO_SHOW: BrandCategory[] = [
  'industrial-automation',
  'it-equipment',
  'industrial-components',
  'network-equipment',
];

export function BrandsCarousel() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container-custom mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Работаем с лидерами рынка</h2>
            <p className="text-muted-foreground">70+ мировых брендов промышленного оборудования</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/brands">
              Все бренды
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {CATEGORIES_TO_SHOW.map((category, categoryIndex) => {
          const categoryBrands = BRANDS.filter((b) => b.category === category && b.logo);
          if (categoryBrands.length === 0) return null;
          const duplicatedBrands = [...categoryBrands, ...categoryBrands];
          const isReverse = categoryIndex % 2 === 1;

          return (
            <div key={category} className="relative overflow-hidden">
              <div className="container-custom mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {BRAND_CATEGORIES[category]}
                </span>
              </div>
              
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-muted/30 to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-muted/30 to-transparent z-10" />
                
                <motion.div
                  className="flex gap-4"
                  animate={{
                    x: isReverse ? ['-50%', '0%'] : ['0%', '-50%'],
                  }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: 'loop',
                      duration: 30 + categoryIndex * 5,
                      ease: 'linear',
                    },
                  }}
                >
                  {duplicatedBrands.map((brand, i) => (
                    <Link
                      key={`${brand.slug}-${i}`}
                      href={`/brands/${brand.slug}`}
                      className="flex-shrink-0 group"
                    >
                      <div className="flex items-center gap-3 px-5 py-3 bg-background rounded-xl border border-border/50 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
                        <BrandLogo name={brand.name} src={brand.logo} size="sm" imgClassName="w-10 h-10" />
                        <div>
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                            {brand.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{brand.country}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
