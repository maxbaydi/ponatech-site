'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Building2, Globe2, Users, Camera } from 'lucide-react';
import numberSectionBg from '@/assets/number-section-bg.webp';

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
      <div className="flex flex-col items-center justify-center text-center aspect-square p-4 rounded-2xl bg-primary shadow-sm transition-all duration-300 group-hover:shadow-lg">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
          {icon}
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
          <AnimatedNumber value={value} suffix={suffix} inView={inView} />
        </div>
        <p className="text-white/80 text-xs sm:text-sm">{label}</p>
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
      <div className="flex items-start gap-3 h-full p-4 rounded-2xl bg-primary shadow-sm">
        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            Фото- и видеоинспекция грузов
          </h3>
          <p className="text-xs text-white/80 leading-relaxed">
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
    icon: <Building2 className="w-5 h-5 text-white" />,
    value: 70,
    suffix: '+',
    label: 'Мировых брендов',
  },
  {
    icon: <Globe2 className="w-5 h-5 text-white" />,
    value: 12,
    suffix: '',
    label: 'Стран-поставщиков',
  },
  {
    icon: <Users className="w-5 h-5 text-white" />,
    value: 1500,
    suffix: '+',
    label: 'Довольных клиентов',
  },
];

export function StatsSection() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-24">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={numberSectionBg}
          alt="Background"
          fill
          className="object-cover scale-110"
          placeholder="blur"
        />
        <div className="absolute inset-0 bg-background/90" />
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-primary">Цифры говорят за нас</h2>
          <p className="text-primary/80 max-w-2xl mx-auto">
            Многолетний опыт работы с ведущими мировыми производителями и надёжная репутация на рынке
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-md sm:max-w-lg">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 0.1} />
            ))}
          </div>
          <div className="w-full max-w-2xl">
            <InspectionCard delay={0.3} />
          </div>
        </div>
      </div>
    </section>
  );
}
