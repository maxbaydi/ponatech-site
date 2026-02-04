'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Building2, Globe2, Users, Camera, CheckCircle2 } from 'lucide-react';
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
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className="relative group h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex flex-col items-center justify-center text-center h-full p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary to-primary/90 text-white shadow-lg hover:shadow-xl transition-[box-shadow,transform] duration-300 border border-white/10 group-hover:-translate-y-1">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
          {icon}
        </div>
        <div className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight text-white">
          <AnimatedNumber value={value} suffix={suffix} inView={inView} />
        </div>
        <p className="text-white/80 text-sm sm:text-base font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

function InspectionCard({ delay }: { delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className="relative h-full w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg border border-white/10 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-500" />
        
        <div className="shrink-0 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="flex flex-col text-center md:text-left relative z-10">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 flex items-center justify-center md:justify-start gap-2">
            Фото- и видеоинспекция грузов
            <CheckCircle2 className="w-5 h-5 text-green-400 hidden sm:block" />
          </h3>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-3xl">
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
    icon: <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
    value: 70,
    suffix: '+',
    label: 'Мировых брендов',
  },
  {
    icon: <Globe2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
    value: 12,
    suffix: '',
    label: 'Стран-поставщиков',
  },
  {
    icon: <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
    value: 1500,
    suffix: '+',
    label: 'Довольных клиентов',
  },
];

export function StatsSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={numberSectionBg}
          alt="Background"
          fill
          className="object-cover scale-105 blur-[2px]"
          placeholder="blur"
        />
        <div className="absolute inset-0 bg-background/95 backdrop-blur-[1px]" />
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-black tracking-tight">
              Цифры говорят за нас
            </h2>
            <p className="text-black/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Многолетний опыт работы с ведущими мировыми производителями и надёжная репутация на рынке
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col gap-6 sm:gap-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 0.1} />
            ))}
          </div>
          <div className="w-full">
            <InspectionCard delay={0.3} />
          </div>
        </div>
      </div>
    </section>
  );
}
