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

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[600px] lg:min-h-[700px] flex items-center justify-center overflow-hidden bg-slate-900 py-12 md:py-24">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroSectionCollage}
          alt="Background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
      </div>

      <div className="container-custom relative z-10 w-full h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center h-full">
          {/* Left Column */}
          <div className="flex flex-col gap-8 relative">
            {/* Top Logos (Omron) */}
            <div className="flex items-center gap-8 mb-2">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={omronLogo}
                  alt="Omron"
                  className="h-8 w-auto brightness-0 invert opacity-70"
                />
              </motion.div>
            </div>

            {/* Cisco Logo (Moved to center-ish) */}
             <motion.div
                className="absolute top-0 right-0 lg:-right-20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Image
                  src={ciscoLogo}
                  alt="Cisco"
                  className="h-6 w-auto brightness-0 invert opacity-70"
                />
              </motion.div>

            {/* Main Title */}
            <div>
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Промышленное <br />
                оборудование
              </motion.h1>
              <motion.p
                className="text-2xl sm:text-3xl md:text-4xl text-white/90 font-medium"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                от 70+ мировых брендов
              </motion.p>
            </div>

            {/* Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                size="xl"
                className="bg-gradient-to-r from-[#3399ff] to-[#0066FF] hover:from-[#0066FF] hover:to-[#0052CC] text-white rounded-md px-8 h-14 text-lg shadow-lg shadow-blue-500/25 transition-all duration-300 border-0"
                asChild
              >
                <Link href="/catalog">
                  Перейти в каталог
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="bg-white text-black border-white hover:bg-gray-100 rounded-md px-8 h-14 text-lg"
                asChild
              >
                <Link href="/request">Оставить заявку</Link>
              </Button>
            </motion.div>

            {/* Bottom Logo (Sick) - Moved right */}
            <motion.div
              className="mt-8 ml-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Image
                src={sickLogo}
                alt="SICK"
                className="h-8 w-auto brightness-0 invert opacity-60"
              />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col h-full relative min-h-[400px] lg:min-h-full">
            {/* Top Right Logo (ABB) */}
            <motion.div
              className="absolute top-0 right-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Image
                src={abbLogo}
                alt="ABB"
                className="h-10 w-auto brightness-0 invert opacity-70"
              />
            </motion.div>

            {/* Description Text */}
            <motion.div
              className="mt-16 lg:mt-24 ml-auto max-w-md text-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="text-white/80 text-lg leading-relaxed">
                PONA TECH обеспечивает прямые закупки и международные поставки
                промышленной автоматизации, ИТ-инфраструктуры и комплектующих с
                контролем качества и оптимальными сроками.
              </p>
            </motion.div>

            {/* Wago Logo (Moved to center-ish) */}
             <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Image
                src={wagoLogo}
                alt="WAGO"
                className="h-8 w-auto brightness-0 invert opacity-70"
              />
            </motion.div>

            {/* Middle Right Logo (Siemens) - Moved and resized */}
            <motion.div
              className="flex justify-end mt-12 mb-8 lg:mt-0 lg:mb-0 lg:absolute lg:bottom-12 lg:left-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Image
                src={siemensLogo}
                alt="Siemens"
                className="h-8 lg:h-12 w-auto brightness-0 invert opacity-70"
              />
            </motion.div>

            {/* Features List */}
            <motion.div
              className="ml-auto flex flex-col gap-6 mt-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center justify-end gap-4">
                <span className="text-white font-medium text-lg">
                  Безопасность сделки
                </span>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4">
                <span className="text-white font-medium text-lg">
                  Прямые поставки
                </span>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Truck className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4">
                <span className="text-white font-medium text-lg">
                  Международный охват
                </span>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Globe className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
