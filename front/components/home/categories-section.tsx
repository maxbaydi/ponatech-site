'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/data/categories';
import { useCategories } from '@/lib/hooks/use-categories';
import { cn } from '@/lib/utils';

interface CategoryGridItem {
  slug: string;
  size: 'lg' | 'md' | 'sm';
}

const GRID_CONFIG: CategoryGridItem[] = [
  { slug: 'kontrollery-i-sistemy-upravleniya', size: 'lg' },
  { slug: 'datchiki-i-izmeritelnye-pribory', size: 'sm' },
  { slug: 'privodnaya-tehnika', size: 'sm' },
  { slug: 'reduktory-i-mehanicheskaya-peredacha', size: 'md' },
  { slug: 'pnevmatika-i-gidravlika', size: 'sm' },
  { slug: 'promyshlennye-soediniteli-i-klemmy', size: 'sm' },
  { slug: 'elektrotehnika-i-kommutacionnoe-oborudovanie', size: 'md' },
  { slug: 'istochniki-pitaniya-i-ibp', size: 'sm' },
  { slug: 'servery-shd-i-setevoe-oborudovanie', size: 'md' },
  { slug: 'sistemy-videonablyudeniya-i-bezopasnosti', size: 'lg' },
];

const CATEGORY_IMAGES: Record<string, string | null> = {
  'kontrollery-i-sistemy-upravleniya': '/assets/categories/control.webp',
  'privodnaya-tehnika': '/assets/categories/privod-tehnika.webp',
  'reduktory-i-mehanicheskaya-peredacha': '/assets/categories/reductor-mehanich-peredacha.webp',
  'pnevmatika-i-gidravlika': '/assets/categories/pnevmatika-gidravlika.webp',
  'datchiki-i-izmeritelnye-pribory': '/assets/categories/datchiki-pribory.webp',
  'promyshlennye-soediniteli-i-klemmy': '/assets/categories/klemy.webp',
  'elektrotehnika-i-kommutacionnoe-oborudovanie': '/assets/categories/komutacionnoe-oborudovanie.webp',
  'istochniki-pitaniya-i-ibp': '/assets/categories/pitanie-ibp.webp',
  'servery-shd-i-setevoe-oborudovanie': '/assets/categories/server-shd.webp',
  'sistemy-videonablyudeniya-i-bezopasnosti': '/assets/categories/vidonabludanie-bezopassnost.webp',
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

const isHorizontalCard = (slug: string, size: CategoryGridItem['size']) =>
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

        <div className="category-grid">
          {items.map((item, index) => {
            const isHorizontal = isHorizontalCard(item.slug, item.size);

            return (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                data-category={item.slug}
                data-size={item.size}
                className="category-grid-item"
              >
                <Link href={item.apiId ? `/catalog?categoryId=${item.apiId}` : `/catalog`} className="block h-full">
                  <div
                    className={cn(
                      'category-card',
                      isHorizontal ? 'category-card--horizontal' : 'category-card--vertical'
                    )}
                  >
                    <div className={cn('category-card-media', !isHorizontal && 'category-card-media--stacked')}>
                      <div
                        className={cn(
                          'category-icon',
                          `category-icon--${item.size}`,
                          !CATEGORY_IMAGES[item.slug] && 'category-icon--placeholder'
                        )}
                      >
                        {CATEGORY_IMAGES[item.slug] ? (
                          <img
                            src={CATEGORY_IMAGES[item.slug]!}
                            alt={item.name}
                            width={96}
                            height={96}
                            loading="lazy"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span>{PLACEHOLDER_EMOJIS[item.slug]}</span>
                        )}
                      </div>
                    </div>
                    <div className="category-card-body">
                      <h3 className="category-title">{item.name}</h3>
                      <p className="category-count">{item.brandSlugs.length} брендов</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
