'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Package, Building2, Globe2, Users } from 'lucide-react';
import { BRAND_COUNT } from '@/data/brands';

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
  delay: number;
}

function AnimatedNumber({ value, suffix = '', inView }: { value: number; suffix?: string; inView: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, inView]);

  return (
    <span>
      {displayValue.toLocaleString('ru-RU')}
      {suffix}
    </span>
  );
}

function StatItem({ icon, value, suffix, label, delay }: StatItemProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border/50 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/30">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          <AnimatedNumber value={value} suffix={suffix} inView={inView} />
        </div>
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </motion.div>
  );
}

const STATS = [
  {
    icon: <Building2 className="w-7 h-7 text-primary" />,
    value: BRAND_COUNT,
    suffix: '+',
    label: 'Мировых брендов',
  },
  {
    icon: <Package className="w-7 h-7 text-primary" />,
    value: 15000,
    suffix: '+',
    label: 'Позиций в каталоге',
  },
  {
    icon: <Globe2 className="w-7 h-7 text-primary" />,
    value: 12,
    suffix: '',
    label: 'Стран-поставщиков',
  },
  {
    icon: <Users className="w-7 h-7 text-primary" />,
    value: 500,
    suffix: '+',
    label: 'Довольных клиентов',
  },
];

export function StatsSection() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Цифры говорят за нас</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Многолетний опыт работы с ведущими мировыми производителями и надёжная репутация на рынке
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((stat, i) => (
            <StatItem key={stat.label} {...stat} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
