'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Globe, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import heroSectionCollage from '@/assets/herosection-1.jpg';
import abbLogo from '@/assets/ABB.webp';
import ciscoLogo from '@/assets/cisco.webp';
import omronLogo from '@/assets/omron.webp';
import sickLogo from '@/assets/sick.webp';
import siemensLogo from '@/assets/siemens.webp';
import wagoLogo from '@/assets/wago.webp';
import yaskawaLogo from '@/assets/yaskawa.webp';

const LOGOS = [
  { id: 'omron', src: omronLogo, alt: 'Omron', opacity: 'opacity-70' },
  { id: 'cisco', src: ciscoLogo, alt: 'Cisco', opacity: 'opacity-70' },
  { id: 'sick', src: sickLogo, alt: 'SICK', opacity: 'opacity-60' },
  { id: 'abb', src: abbLogo, alt: 'ABB', opacity: 'opacity-70' },
  { id: 'wago', src: wagoLogo, alt: 'WAGO', opacity: 'opacity-70' },
  { id: 'siemens', src: siemensLogo, alt: 'Siemens', opacity: 'opacity-70' },
  { id: 'yaskawa', src: yaskawaLogo, alt: 'Yaskawa', opacity: 'opacity-70' },
];

const LogoContainer = ({ 
  logo,
  index, 
  visible,
  className, 
  imageClassName 
}: { 
  logo: typeof LOGOS[number],
  index: number, 
  visible: boolean,
  className: string, 
  imageClassName?: string 
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5, delay: visible ? index * 0.1 : (6 - index) * 0.1 }}
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        className={`${imageClassName || 'h-8 w-auto'} brightness-0 invert ${logo.opacity}`}
      />
    </motion.div>
  );
};

export function HeroSection() {
  const [logoOrder, setLogoOrder] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setLogoOrder((prev) => {
          // Shuffle the array to swap positions
          const newOrder = [...prev];
          for (let i = newOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
          }
          return newOrder;
        });
        setVisible(true);
      }, 1000); // Wait for fade out
    }, 5000); // 5 seconds interval

    return () => clearInterval(interval);
  }, []);

  const getLogo = (index: number) => LOGOS[logoOrder[index]];

  return (
    <section className="relative w-full min-h-[400px] lg:min-h-[500px] flex items-center justify-center overflow-hidden bg-slate-900 mt-6 md:mt-8 lg:mt-10 py-6 md:py-12 px-4 sm:px-6 lg:px-8 lg:rounded-3xl lg:max-w-7xl lg:mx-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center h-full">
          {/* Left Column */}
          <div className="flex flex-col gap-5 relative">
            {/* Slot 0: Top Logos (Omron spot) */}
            <div className="flex items-center gap-8 mb-2">
              <LogoContainer 
                logo={getLogo(0)}
                index={0} 
                visible={visible}
                className="" 
              />
            </div>

            {/* Slot 1: Cisco Logo (Moved to center-ish) */}
            <LogoContainer 
              logo={getLogo(1)}
              index={1} 
              visible={visible}
              className="absolute top-0 right-0 lg:-right-20" 
              imageClassName="h-6 w-auto"
            />

            {/* Main Title */}
            <div>
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[70px] font-bold leading-tight mb-2 animate-text-shimmer"
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
                className="bg-gradient-to-r from-[#3399ff] to-[#0066FF] hover:from-[#0066FF] hover:to-[#0052CC] text-white px-8 h-14 text-lg shadow-lg shadow-blue-500/25 transition-all duration-300 border-0"
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
                className="bg-white text-black border-white hover:bg-gray-100 px-8 h-14 text-lg"
                asChild
              >
                <Link href="/request">Оставить заявку</Link>
              </Button>
            </motion.div>

            {/* Slot 2: Bottom Logo (Sick spot) - Moved right */}
            <LogoContainer 
              logo={getLogo(2)}
              index={2} 
              visible={visible}
              className="mt-4 ml-24" 
            />
          </div>

          {/* Right Column */}
          <div className="flex flex-col h-full relative min-h-[280px] lg:min-h-full">
            {/* Slot 3: Top Right Logo (ABB spot) */}
            <LogoContainer 
              logo={getLogo(3)}
              index={3} 
              visible={visible}
              className="absolute top-0 right-0" 
              imageClassName="h-10 w-auto"
            />

            {/* Features List */}
            <motion.div
              className="ml-auto flex flex-col gap-4 mt-10 lg:mt-14"
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
            
            {/* Slot 6: Yaskawa spot - Under Features List */}
            <LogoContainer 
               logo={getLogo(6)}
               index={6} 
               visible={visible}
               className="ml-auto mt-4 hidden lg:block"
               imageClassName="h-12 w-auto"
             />

            {/* Slot 4: Wago Logo (Moved to center-ish) */}
             <LogoContainer 
               logo={getLogo(4)}
               index={4} 
               visible={visible}
               className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block"
             />

            {/* Slot 5: Middle Right Logo (Siemens spot) - Moved and resized */}
            <LogoContainer 
              logo={getLogo(5)}
              index={5} 
              visible={visible}
              className="flex justify-end mt-6 mb-4 lg:mt-0 lg:mb-0 lg:absolute lg:bottom-8 lg:left-0" 
              imageClassName="h-8 lg:h-12 w-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
