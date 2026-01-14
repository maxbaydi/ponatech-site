'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Globe, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FEATURED_BRANDS } from '@/data/brands';

const FLOATING_BRANDS = FEATURED_BRANDS.slice(0, 6);

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-muted/50 to-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

        {FLOATING_BRANDS.map((brand, i) => (
          <motion.div
            key={brand.slug}
            className="absolute hidden lg:flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-lg border border-border/50"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.1, 1],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            style={{
              top: `${20 + (i % 3) * 25}%`,
              left: i < 3 ? `${5 + i * 8}%` : undefined,
              right: i >= 3 ? `${5 + (i - 3) * 8}%` : undefined,
            }}
          >
            <span className="text-xs font-semibold text-foreground/70 text-center px-2">{brand.name}</span>
          </motion.div>
        ))}
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              Международные поставки из Китая
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Промышленное оборудование от{' '}
            <span className="text-gradient">70+ мировых брендов</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            PONA TECH обеспечивает прямые закупки и международные поставки промышленной автоматизации, 
            ИТ-инфраструктуры и комплектующих с контролем качества и оптимальными сроками.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button size="xl" asChild>
              <Link href="/catalog">
                Перейти в каталог
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/request">Оставить заявку</Link>
            </Button>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Безопасность сделки</p>
                <p className="text-xs text-muted-foreground">Полный контроль и проверка</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Прямые поставки</p>
                <p className="text-xs text-muted-foreground">Без посредников</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
