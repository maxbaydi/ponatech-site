'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE_CONTACTS } from '@/lib/site-contacts';

export function CtaSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative w-full overflow-hidden bg-primary py-12 sm:py-16 lg:py-24 lg:max-w-7xl lg:mx-auto lg:rounded-3xl lg:mt-24 lg:mb-24" ref={ref}>
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Готовы начать сотрудничество?
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-white/80 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Оставьте заявку, и наши специалисты свяжутся с вами для обсуждения вашего проекта. 
            Мы поможем подобрать оптимальное решение и рассчитаем стоимость поставки.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4 mb-8 sm:mb-10 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button size="xl" variant="secondary" asChild className="w-full sm:w-auto">
              <Link href="/request">
                Оставить заявку
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/contacts">Контакты</Link>
            </Button>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4 sm:gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <a
              href={`tel:${SITE_CONTACTS.phones.telegram.tel}`}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm sm:text-base"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>
                {SITE_CONTACTS.phones.telegram.display} — {SITE_CONTACTS.phones.telegram.title}
              </span>
            </a>
            <a
              href={SITE_CONTACTS.email.mailto}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm sm:text-base"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{SITE_CONTACTS.email.display}</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
