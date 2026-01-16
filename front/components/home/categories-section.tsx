'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/data/categories';
import { useCategories } from '@/lib/hooks/use-categories';
import { cn } from '@/lib/utils';

interface CategoryGridItem {
  slug: string;
  style: React.CSSProperties;
  size: 'lg' | 'md' | 'sm';
}

const GRID_CONFIG: CategoryGridItem[] = [
  { slug: 'kontrollery-i-sistemy-upravleniya', style: { gridColumn: '1 / 3', gridRow: '1 / 3' }, size: 'lg' },
  { slug: 'datchiki-i-izmeritelnye-pribory', style: { gridColumn: '3 / 4', gridRow: '1 / 2' }, size: 'sm' },
  { slug: 'privodnaya-tehnika', style: { gridColumn: '4 / 5', gridRow: '1 / 2' }, size: 'sm' },
  { slug: 'reduktory-i-mehanicheskaya-peredacha', style: { gridColumn: '5 / 7', gridRow: '1 / 2' }, size: 'md' },
  { slug: 'pnevmatika-i-gidravlika', style: { gridColumn: '3 / 4', gridRow: '2 / 3' }, size: 'sm' },
  { slug: 'promyshlennye-soediniteli-i-klemmy', style: { gridColumn: '4 / 5', gridRow: '2 / 3' }, size: 'sm' },
  { slug: 'elektrotehnika-i-kommutacionnoe-oborudovanie', style: { gridColumn: '5 / 7', gridRow: '2 / 3' }, size: 'md' },
  { slug: 'istochniki-pitaniya-i-ibp', style: { gridColumn: '1 / 2', gridRow: '3 / 4' }, size: 'sm' },
  { slug: 'servery-shd-i-setevoe-oborudovanie', style: { gridColumn: '2 / 4', gridRow: '3 / 4' }, size: 'md' },
  { slug: 'sistemy-videonablyudeniya-i-bezopasnosti', style: { gridColumn: '4 / 7', gridRow: '3 / 4' }, size: 'lg' },
];

const CATEGORY_IMAGES: Record<string, string | null> = {
  'kontrollery-i-sistemy-upravleniya': '/assets/categories/control.png',
  'privodnaya-tehnika': '/assets/categories/privod-tehnika.png',
  'reduktory-i-mehanicheskaya-peredacha': '/assets/categories/reductor-mehanich-peredacha.png',
  'pnevmatika-i-gidravlika': '/assets/categories/pnevmatika-gidravlika.png',
  'datchiki-i-izmeritelnye-pribory': '/assets/categories/datchiki-pribory.webp',
  'promyshlennye-soediniteli-i-klemmy': '/assets/categories/klemy.png',
  'elektrotehnika-i-kommutacionnoe-oborudovanie': '/assets/categories/komutacionnoe-oborudovanie.png',
  'istochniki-pitaniya-i-ibp': '/assets/categories/pitanie-ibp.png',
  'servery-shd-i-setevoe-oborudovanie': '/assets/categories/server-shd.png',
  'sistemy-videonablyudeniya-i-bezopasnosti': '/assets/categories/vidonabludanie-bezopassnost.png',
};

const PLACEHOLDER_EMOJIS: Record<string, string> = {
  'kontrollery-i-sistemy-upravleniya': '🎛️',
  'privodnaya-tehnika': '⚙️',
  'reduktory-i-mehanicheskaya-peredacha': '🔩',
  'pnevmatika-i-gidravlika': '💨',
  'datchiki-i-izmeritelnye-pribory': '📡',
  'promyshlennye-soediniteli-i-klemmy': '🔌',
  'elektrotehnika-i-kommutacionnoe-oborudovanie': '⚡',
  'istochniki-pitaniya-i-ibp': '🔋',
  'servery-shd-i-setevoe-oborudovanie': '🖥️',
  'sistemy-videonablyudeniya-i-bezopasnosti': '📹',
};

const IMG_SIZES: Record<CategoryGridItem['size'], string> = {
  lg: 'w-20 h-20 sm:w-24 sm:h-24 text-4xl sm:text-5xl',
  md: 'w-14 h-14 sm:w-16 sm:h-16 text-2xl sm:text-3xl',
  sm: 'w-12 h-12 text-xl',
};

const isHorizontalCard = (slug: string, size: string) => 
  size === 'sm' || size === 'md' || slug === 'sistemy-videonablyudeniya-i-bezopasnosti';

export function CategoriesSection() {
  const { data: apiCategories } = useCategories();

  const items = GRID_CONFIG.map((config) => {
    const localCategory = CATEGORIES.find((c) => c.slug === config.slug);
    const apiCategory = apiCategories?.find((c) => c.slug === config.slug);
    if (!localCategory) return null;
    return {
      ...localCategory,
      ...config,
      apiId: apiCategory?.id,
    };
  }).filter(Boolean) as (typeof CATEGORIES[number] & CategoryGridItem & { apiId?: string })[];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container-custom">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10">
          Популярные категории
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 auto-rows-[100px] sm:auto-rows-[110px]">
          {items.map((item, index) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              style={item.style}
              className="hidden lg:block"
            >
              <Link href={item.apiId ? `/catalog?categoryId=${item.apiId}` : `/catalog`} className="block h-full group">
                <div className={cn(
                  'h-full bg-card rounded-2xl border border-border/50 p-3 sm:p-4 transition-all duration-300 hover:bg-primary hover:border-primary hover:-translate-y-1 overflow-hidden',
                  isHorizontalCard(item.slug, item.size) ? 'flex flex-row items-center gap-3' : 'flex flex-col'
                )}>
                  <div className={cn(
                    'flex items-center justify-center shrink-0',
                    !isHorizontalCard(item.slug, item.size) && 'flex-1 mb-2'
                  )}>
                    <div className={cn('flex items-center justify-center rounded-xl transition-transform group-hover:scale-105', IMG_SIZES[item.size], !CATEGORY_IMAGES[item.slug] && 'bg-muted/50')}>
                      {CATEGORY_IMAGES[item.slug] ? (
                        <img src={CATEGORY_IMAGES[item.slug]!} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <span>{PLACEHOLDER_EMOJIS[item.slug]}</span>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className={cn(
                      'font-semibold text-foreground group-hover:text-white transition-colors leading-tight mb-0.5',
                      item.size === 'lg' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                    )}>
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground group-hover:text-white/70 transition-colors">
                      {item.brandSlugs.length} брендов
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Mobile/Tablet: simple grid */}
          {items.map((item, index) => (
            <motion.div
              key={`mobile-${item.slug}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="lg:hidden"
            >
              <Link href={item.apiId ? `/catalog?categoryId=${item.apiId}` : `/catalog`} className="block h-full group">
                <div className="h-full bg-card rounded-2xl border border-border/50 p-4 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/30 overflow-hidden">
                  <div className="flex-1 flex items-center justify-center mb-2">
                    <div className={cn('w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl text-2xl sm:text-3xl', !CATEGORY_IMAGES[item.slug] && 'bg-muted/50')}>
                      {CATEGORY_IMAGES[item.slug] ? (
                        <img src={CATEGORY_IMAGES[item.slug]!} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <span>{PLACEHOLDER_EMOJIS[item.slug]}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-tight mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {item.brandSlugs.length} брендов
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
