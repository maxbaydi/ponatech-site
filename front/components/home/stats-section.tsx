'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Building2, Globe2, Users, Camera } from 'lucide-react';
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

function StatCard({ icon, value, suffix, label, delay }: StatItemProps) {
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
      <div className="flex flex-col items-center justify-center text-center w-[150px] h-[150px] p-4 rounded-2xl bg-background border border-border/50 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/30">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
          {icon}
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          <AnimatedNumber value={value} suffix={suffix} inView={inView} />
        </div>
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </motion.div>
  );
}

function InspectionCard({ delay }: { delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className="relative h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-start gap-3 h-full p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Camera className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-foreground mb-2">
            Фото- и видеоинспекция грузов
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Все наши грузы проходят полную фото- и видеоинспекцию на зарубежных складах перед отправкой.
            Мы фиксируем состояние, комплектацию и упаковку оборудования, чтобы убедиться в полном соответствии заказу.
            Такой контроль позволяет избежать рисков и гарантировать надёжность поставок на каждом этапе логистики.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

const STATS = [
  {
    icon: <Building2 className="w-5 h-5 text-muted-foreground" />,
    value: BRAND_COUNT,
    suffix: '+',
    label: 'Мировых брендов',
  },
  {
    icon: <Globe2 className="w-5 h-5 text-muted-foreground" />,
    value: 12,
    suffix: '',
    label: 'Стран-поставщиков',
  },
  {
    icon: <Users className="w-5 h-5 text-muted-foreground" />,
    value: 500,
    suffix: '+',
    label: 'Довольных клиентов',
  },
];

export function StatsSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container-custom">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Цифры говорят за нас</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Многолетний опыт работы с ведущими мировыми производителями и надёжная репутация на рынке
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-[150px_150px_150px_1fr] gap-3 sm:gap-4">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} {...stat} delay={i * 0.1} />
          ))}
          <InspectionCard delay={0.3} />
        </div>
      </div>
    </section>
  );
}
