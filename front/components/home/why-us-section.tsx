'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Eye, DollarSign, Package, Headphones, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ADVANTAGES = [
  {
    icon: Shield,
    title: 'Полный контроль сделки',
    description:
      'Товар поступает на наш склад в Китае, где мы проводим инспекцию, фиксируем состояние, делаем фото и видео.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Eye,
    title: 'Предгрузочная проверка',
    description:
      'Вы заранее проверяете комплектацию и внешний вид до отправки в Россию, снижая риски брака и недопоставки.',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    icon: DollarSign,
    title: 'Партнёрские цены',
    description:
      'Мы работаем с производителями на регулярной основе и получаем специальные цены, недоступные при разовой закупке.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: Package,
    title: 'Доступ к закрытым позициям',
    description:
      'Можем закупить оборудование, которое при прямом обращении может быть недоступно для российского покупателя.',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  {
    icon: Headphones,
    title: 'Единое окно',
    description:
      'Подбираем оптимальный канал поставки, консолидируем позиции, контролируем отгрузку и сопровождаем документально.',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    icon: Globe,
    title: 'Международный охват',
    description:
      'Поставки из ключевых технологических регионов: Китай, Германия, США, Япония, Южная Корея, Швейцария.',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
];

export function WhyUsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="why-us" className="py-12 sm:py-16 lg:py-24 bg-background" ref={ref}>
      <div className="container-custom">
        <div className="text-center mb-8 sm:mb-12">
          <motion.span
            className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Почему PONA TECH
          </motion.span>
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Выгоднее, чем напрямую у заводов
          </motion.h2>
          <motion.p
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            С PONA TECH вы получаете безопасность сделки, проверку товара до отправки, доступ к "закрытым" позициям 
            и лучшую цену благодаря нашим партнёрским условиям
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {ADVANTAGES.map((advantage, i) => (
            <motion.div
              key={advantage.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
            >
              <Card className="h-full card-hover border-border/50">
                <CardContent className="p-4 sm:p-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${advantage.bgColor} flex items-center justify-center mb-4`}>
                    <advantage.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${advantage.color}`} />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">{advantage.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{advantage.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
