'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BRANDS } from '@/data/brands';
import { cn } from '@/lib/utils';

type GridSize = 'xl' | 'lg' | 'sm';

interface GridItem {
  slug: string;
  style: React.CSSProperties;
  size: GridSize;
}

const GRID_ITEMS: GridItem[] = [
  { slug: 'siemens', style: { gridColumn: '1 / 3', gridRow: '1 / 3' }, size: 'xl' },
  { slug: 'rockwell-automation', style: { gridColumn: '3 / 4', gridRow: '1 / 2' }, size: 'sm' },
  { slug: 'ifm', style: { gridColumn: '4 / 5', gridRow: '1 / 2' }, size: 'sm' },
  { slug: 'schneider-electric', style: { gridColumn: '5 / 7', gridRow: '1 / 3' }, size: 'xl' },
  { slug: 'sick', style: { gridColumn: '7 / 8', gridRow: '1 / 2' }, size: 'sm' },
  { slug: 'br', style: { gridColumn: '8 / 9', gridRow: '1 / 2' }, size: 'sm' },
  { slug: 'keyence', style: { gridColumn: '3 / 4', gridRow: '2 / 3' }, size: 'sm' },
  { slug: 'abb', style: { gridColumn: '4 / 5', gridRow: '2 / 3' }, size: 'sm' },
  { slug: 'pepperl-fuchs', style: { gridColumn: '7 / 8', gridRow: '2 / 3' }, size: 'sm' },
  { slug: 'eaton', style: { gridColumn: '8 / 9', gridRow: '2 / 3' }, size: 'sm' },
  { slug: 'festo', style: { gridColumn: '1 / 2', gridRow: '3 / 4' }, size: 'sm' },
  { slug: 'balluff', style: { gridColumn: '2 / 3', gridRow: '3 / 4' }, size: 'sm' },
  { slug: 'omron', style: { gridColumn: '3 / 5', gridRow: '3 / 5' }, size: 'lg' },
  { slug: 'lenze', style: { gridColumn: '5 / 6', gridRow: '3 / 4' }, size: 'sm' },
  { slug: 'phoenix-contact', style: { gridColumn: '6 / 7', gridRow: '3 / 4' }, size: 'sm' },
  { slug: 'beckhoff', style: { gridColumn: '7 / 9', gridRow: '3 / 5' }, size: 'lg' },
  { slug: 'sew-eurodrive', style: { gridColumn: '1 / 2', gridRow: '4 / 5' }, size: 'sm' },
  { slug: 'pilz', style: { gridColumn: '2 / 3', gridRow: '4 / 5' }, size: 'sm' },
  { slug: 'wago', style: { gridColumn: '5 / 6', gridRow: '4 / 5' }, size: 'sm' },
  { slug: 'fanuc', style: { gridColumn: '6 / 7', gridRow: '4 / 5' }, size: 'sm' },
];

const LOGO_SIZES: Record<GridSize, string> = {
  xl: 'w-40 h-40 sm:w-52 sm:h-52',
  lg: 'w-32 h-32 sm:w-44 sm:h-44',
  sm: 'w-14 h-14 sm:w-20 sm:h-20',
};

function BrandLogoBox({ name, src, size }: { name: string; src?: string; size: GridSize }) {
  const initials = name.slice(0, 2).toUpperCase();
  
  return (
    <div className={cn('flex items-center justify-center', LOGO_SIZES[size])}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-contain" />
      ) : (
        <span className="font-bold text-muted-foreground text-xl">{initials}</span>
      )}
    </div>
  );
}

export function TopBrandsGrid() {
  const items = GRID_ITEMS.map(item => {
    const brand = BRANDS.find(b => b.slug === item.slug);
    return brand ? { ...brand, ...item } : null;
  }).filter(Boolean) as (typeof BRANDS[number] & GridItem)[];

  return (
    <section className="mb-10 sm:mb-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">Топ 20 брендов</h2>
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 auto-rows-[70px] sm:auto-rows-[85px]">
        {items.map((item, index) => (
          <motion.div
            key={item.slug}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            style={item.style}
          >
            <Link href={`/brands/${item.slug}`} className="block h-full">
              <div className="relative h-full bg-card rounded-xl border border-border/50 shadow-sm flex items-center justify-center transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 group overflow-hidden">
                <BrandLogoBox name={item.name} src={item.logo} size={item.size} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
