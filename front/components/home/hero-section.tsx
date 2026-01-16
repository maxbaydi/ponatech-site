'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Globe, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroSectionCollage from '@/assets/herosection-1.jpg';
import abbLogo from '@/assets/ABB.png';
import ciscoLogo from '@/assets/cisco.png';
import omronLogo from '@/assets/omron.png';
import sickLogo from '@/assets/sick.png';
import siemensLogo from '@/assets/siemens.png';
import wagoLogo from '@/assets/wago.png';
import yaskawaLogo from '@/assets/yaskawa.png';

const LOGO_SIZES = ['w-32 h-32', 'w-40 h-40', 'w-48 h-48'] as const;
const LOGO_OPACITIES = ['opacity-35', 'opacity-45', 'opacity-55'] as const;

const BRAND_LOGOS = [
  { name: 'ABB', src: abbLogo, slug: 'abb' },
  { name: 'Cisco', src: ciscoLogo, slug: 'cisco' },
  { name: 'Omron', src: omronLogo, slug: 'omron' },
  { name: 'SICK', src: sickLogo, slug: 'sick' },
  { name: 'Siemens', src: siemensLogo, slug: 'siemens' },
  { name: 'WAGO', src: wagoLogo, slug: 'wago' },
  { name: 'Yaskawa', src: yaskawaLogo, slug: 'yaskawa' },
] as const;

const LOGO_POSITION_OVERRIDES: Partial<
  Record<(typeof BRAND_LOGOS)[number]['slug'], { top?: number; left?: number; right?: number }>
> = {
  abb: { top: 18 },
  cisco: { left: 24, top: 10 },
  omron: { left: 8 },
  yaskawa: { top: 33 },
};

function hashStringToSeed(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: readonly T[], index01: number) {
  const idx = Math.floor(index01 * arr.length);
  return arr[Math.min(Math.max(idx, 0), arr.length - 1)];
}

const FLOATING_LOGOS = BRAND_LOGOS.map((logo) => {
  const rng = mulberry32(hashStringToSeed(logo.slug));

  const topMin = 14;
  const topMax = 82;
  const edgeMin = 3;
  const edgeMax = 18;

  const override = LOGO_POSITION_OVERRIDES[logo.slug];

  const defaultTop = topMin + rng() * (topMax - topMin);
  const defaultIsLeftSide = rng() < 0.5;
  const defaultEdge = edgeMin + rng() * (edgeMax - edgeMin);

  const top = override?.top ?? defaultTop;
  const isLeftSide =
    override?.left != null ? true : override?.right != null ? false : defaultIsLeftSide;
  const edge = defaultEdge;
  const left = override?.left ?? (isLeftSide ? edge : undefined);
  const right = override?.right ?? (!isLeftSide ? edge : undefined);

  const size = pick(LOGO_SIZES, rng());
  const opacity = pick(LOGO_OPACITIES, rng());

  return {
    ...logo,
    size,
    opacity,
    positionStyle: {
      top: `${top}%`,
      left: left != null ? `${left}%` : undefined,
      right: right != null ? `${right}%` : undefined,
    } as const,
  };
});

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-muted/50 to-background py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroSectionCollage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/75 to-background/75 backdrop-blur-sm" />
      </div>

      <div className="absolute inset-0 z-10 overflow-hidden flex items-center justify-center text-center pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-secondary/5 rounded-full blur-3xl" />

        {FLOATING_LOGOS.map((logo) => (
          <div
            key={logo.slug}
            className={`absolute hidden lg:block pointer-events-none ${logo.opacity}`}
            style={logo.positionStyle}
          >
            <div className={`relative ${logo.size} drop-shadow-sm`}>
              <Image src={logo.src} alt={logo.name} fill className="object-contain" />
            </div>
          </div>
        ))}
      </div>

      <div className="container-custom relative z-20">
        <div className="hero-content-max-w mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              Международные поставки из Китая
            </span>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-glossy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Промышленное оборудование
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground/90 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            от <span className="text-gradient">70+ мировых брендов</span>
          </motion.p>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            PONA TECH обеспечивает прямые закупки и международные поставки промышленной автоматизации, 
            ИТ-инфраструктуры и комплектующих с контролем качества и оптимальными сроками.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4 mb-10 sm:mb-12 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button size="xl" asChild className="w-full sm:w-auto">
              <Link href="/catalog">
                Перейти в каталог
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/request">Оставить заявку</Link>
            </Button>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 text-left">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Безопасность сделки</p>
                <p className="text-xs text-muted-foreground">Полный контроль и проверка</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Прямые поставки</p>
                <p className="text-xs text-muted-foreground">Без посредников</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-sm">Международный охват</p>
                <p className="text-xs text-muted-foreground">Китай, Германия, США, Япония</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
