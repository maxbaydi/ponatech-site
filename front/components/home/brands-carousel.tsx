'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brands/brand-logo';
import { BRANDS, BRAND_CATEGORIES, type BrandCategory } from '@/data/brands';

const CATEGORIES_TO_SHOW: BrandCategory[] = [
  'industrial-automation',
  'it-equipment',
  'industrial-components',
];

const ROW_SPEED_PX_PER_SECOND = [80, 70, 75] as const;
const ROW_SPEED_MULTIPLIER = 1 / 3;
const MIN_ROW_DURATION_SECONDS = 10;
const MAX_ROW_DURATION_SECONDS = 28;

function getRowSpeedPxPerSecond(rowIndex: number) {
  const base =
    ROW_SPEED_PX_PER_SECOND[rowIndex] ?? ROW_SPEED_PX_PER_SECOND[ROW_SPEED_PX_PER_SECOND.length - 1];
  return base * ROW_SPEED_MULTIPLIER;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readGapPx(el: HTMLElement) {
  const gap = window.getComputedStyle(el).gap;
  const px = Number.parseFloat(gap);
  return Number.isFinite(px) ? px : 0;
}

function BrandsCarouselRow({ category, categoryIndex }: { category: BrandCategory; categoryIndex: number }) {
  const categoryBrands = useMemo(
    () => BRANDS.filter((b) => b.category === category && b.logo),
    [category],
  );

  const isReverse = categoryIndex % 2 === 1;
  const speedPxPerSecond = getRowSpeedPxPerSecond(categoryIndex);

  const groupRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [loopDistance, setLoopDistance] = useState<number | null>(null);
  const durationSeconds = loopDistance
    ? clampNumber(loopDistance / speedPxPerSecond, MIN_ROW_DURATION_SECONDS, MAX_ROW_DURATION_SECONDS)
    : null;

  useLayoutEffect(() => {
    const groupEl = groupRef.current;
    const trackEl = trackRef.current;
    if (!groupEl || !trackEl) return;

    const measure = () => {
      const groupWidth = groupEl.scrollWidth;
      const gapPx = readGapPx(trackEl);
      const nextDistance = groupWidth + gapPx;
      setLoopDistance((prev) => (prev === nextDistance ? prev : nextDistance));
    };

    measure();

    if (typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(measure);
    ro.observe(groupEl);
    ro.observe(trackEl);

    return () => ro.disconnect();
  }, [categoryBrands.length]);

  if (categoryBrands.length === 0) return null;

  return (
    <div className="relative overflow-hidden">
      <div className="container-custom mb-2 sm:mb-3">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">{BRAND_CATEGORIES[category]}</span>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 lg:w-20 bg-gradient-to-r from-muted/30 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 lg:w-20 bg-gradient-to-l from-muted/30 to-transparent z-10" />

        <motion.div
          ref={trackRef}
          className="flex gap-3 sm:gap-4 will-change-transform"
          animate={
            loopDistance
              ? {
                  x: isReverse ? [-loopDistance, 0] : [0, -loopDistance],
                }
              : undefined
          }
          transition={
            loopDistance && durationSeconds
              ? {
                  x: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: durationSeconds,
                    ease: 'linear',
                  },
                }
              : undefined
          }
        >
          <div ref={groupRef} className="flex gap-3 sm:gap-4 shrink-0">
            {categoryBrands.map((brand) => (
              <Link key={brand.slug} href={`/brands/${brand.slug}`} className="flex-shrink-0 group">
                <div className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-3 bg-background rounded-xl border border-border/50 shadow-sm transition-[box-shadow,transform,border-color] duration-300 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
                  <BrandLogo name={brand.name} src={brand.logo} size="sm" imgClassName="w-8 h-8 sm:w-10 sm:h-10" />
                  <div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {brand.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{brand.country}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex gap-3 sm:gap-4 shrink-0">
            {categoryBrands.map((brand) => (
              <Link key={`${brand.slug}-dup`} href={`/brands/${brand.slug}`} className="flex-shrink-0 group">
                <div className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-3 bg-background rounded-xl border border-border/50 shadow-sm transition-[box-shadow,transform,border-color] duration-300 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
                  <BrandLogo name={brand.name} src={brand.logo} size="sm" imgClassName="w-8 h-8 sm:w-10 sm:h-10" />
                  <div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {brand.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{brand.country}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function BrandsCarousel() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-muted/30">
      <div className="container-custom mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Работаем с лидерами рынка</h2>
            <p className="text-muted-foreground">70+ мировых брендов промышленного оборудования</p>
          </div>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/brands">
              Все бренды
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="container-custom">
        <div className="space-y-8">
          {CATEGORIES_TO_SHOW.map((category, categoryIndex) => (
            <BrandsCarouselRow key={category} category={category} categoryIndex={categoryIndex} />
          ))}
        </div>
      </div>
    </section>
  );
}
