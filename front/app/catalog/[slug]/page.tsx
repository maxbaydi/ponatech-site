'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Package,
  ArrowLeft,
  Send,
  Shield,
  Truck,
  Clock,
  CheckCircle2,
  Phone,
  ZoomIn,
  ChevronLeft,
  X,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ProductCard } from '@/components/catalog';
import { useProductBySlug, useProducts } from '@/lib/hooks/use-products';
import { formatPrice } from '@/lib/utils';
import type { ProductImage } from '@/lib/api/types';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function ImageGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const mainImage = images[selectedIndex] || images[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <div className="space-y-4">
        <motion.div
          className="relative aspect-square bg-muted rounded-2xl flex items-center justify-center overflow-hidden group cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedIndex}
              src={mainImage.url}
              alt={mainImage.alt || title}
              className="object-contain w-full h-full p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-foreground/0 group-hover:text-foreground/50 transition-colors" />
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </motion.div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, index) => (
              <motion.button
                key={img.id}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                  index === selectedIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <img src={img.url} alt={img.alt || ''} className="object-contain w-full h-full p-1" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-4xl p-0 bg-black/95">
          <DialogTitle className="sr-only">Просмотр изображения: {title}</DialogTitle>
          <div className="relative aspect-square">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <img
              src={mainImage.url}
              alt={mainImage.alt || title}
              className="object-contain w-full h-full"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
          </div>
          <div className="flex justify-center gap-2 p-4">
            {images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setSelectedIndex(index)}
                className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                  index === selectedIndex ? 'border-white' : 'border-white/30 hover:border-white/60'
                }`}
              >
                <img src={img.url} alt="" className="object-contain w-full h-full" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProductPlaceholder({ title }: { title: string }) {
  return (
    <motion.div
      className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Package className="w-24 h-24 text-muted-foreground/20 mb-4" />
      <p className="text-muted-foreground/50 text-sm">Изображение недоступно</p>
    </motion.div>
  );
}

const DELIVERY_FEATURES = [
  {
    icon: Shield,
    title: 'Гарантия качества',
    description: 'Предгрузочная инспекция с фото/видео отчётом',
  },
  {
    icon: Truck,
    title: 'Международная доставка',
    description: 'Из Китая, Европы, США и Японии',
  },
  {
    icon: Clock,
    title: 'Сроки поставки',
    description: '2-6 недель в зависимости от маршрута',
  },
  {
    icon: CheckCircle2,
    title: 'Документы',
    description: 'Полное таможенное оформление',
  },
];

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const { data: product, isLoading, error } = useProductBySlug(slug);

  const { data: relatedProducts } = useProducts({
    categoryId: product?.categoryId,
    limit: 4,
    status: 'PUBLISHED',
  });

  const filteredRelated = relatedProducts?.filter((p) => p.id !== product?.id).slice(0, 4);

  if (error) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container-custom">
          {isLoading ? (
            <div className="space-y-8">
              <Skeleton className="h-6 w-64" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <Skeleton className="aspect-square rounded-2xl" />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-12 w-40" />
                  <Skeleton className="h-14 w-full" />
                </div>
              </div>
            </div>
          ) : product ? (
            <>
              <motion.nav
                className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link href="/catalog" className="hover:text-foreground transition-colors">
                  Каталог
                </Link>
                <ChevronRight className="h-4 w-4" />
                {product.category && (
                  <>
                    <Link
                      href={`/catalog?categoryId=${product.categoryId}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {product.category.name}
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
                {product.brand && (
                  <>
                    <Link
                      href={`/catalog?brandId=${product.brandId}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {product.brand.name}
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
                <span className="text-foreground truncate max-w-[200px]">{product.title}</span>
              </motion.nav>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {product.images && product.images.length > 0 ? (
                  <ImageGallery images={product.images} title={product.title} />
                ) : (
                  <ProductPlaceholder title={product.title} />
                )}

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.brand && (
                      <Link href={`/brands/${product.brand.slug}`}>
                        <Badge variant="secondary" className="hover:bg-secondary/80 transition-colors cursor-pointer">
                          {product.brand.name}
                        </Badge>
                      </Link>
                    )}
                    {product.category && (
                      <Badge variant="outline">{product.category.name}</Badge>
                    )}
                    {product.status === 'PUBLISHED' && product.stock > 0 && (
                      <Badge variant="success" className="bg-success/10 text-success border-success/20">
                        В наличии
                      </Badge>
                    )}
                    {product.stock === 0 && (
                      <Badge variant="destructive">Под заказ</Badge>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                    {product.title}
                  </h1>
                  
                  <p className="text-muted-foreground mb-6 flex items-center gap-4">
                    <span>Артикул: <span className="font-mono">{product.sku}</span></span>
                    {product.brand?.country && (
                      <span className="text-sm">Страна: {product.brand.country}</span>
                    )}
                  </p>

                  <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 mb-6">
                    <p className="text-sm text-muted-foreground mb-1">Цена</p>
                    <div className="text-3xl md:text-4xl font-bold text-primary">
                      {formatPrice(product.price, product.currency)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      * Цена указана для справки, точную стоимость уточняйте у менеджера
                    </p>
                  </div>

                  {product.description && (
                    <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <Button size="lg" className="flex-1 h-14 text-base" asChild>
                      <Link href={`/request?product=${encodeURIComponent(product.title)}&sku=${product.sku}`}>
                        <Send className="mr-2 h-5 w-5" />
                        Запросить цену
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 text-base" asChild>
                      <Link href="tel:+78000000000">
                        <Phone className="mr-2 h-5 w-5" />
                        Позвонить
                      </Link>
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  <Tabs defaultValue="specs" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 h-auto p-1">
                      <TabsTrigger value="specs" className="py-2.5">Характеристики</TabsTrigger>
                      <TabsTrigger value="delivery" className="py-2.5">Доставка</TabsTrigger>
                      <TabsTrigger value="warranty" className="py-2.5">Гарантии</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="specs" className="mt-4">
                      {product.specs && Object.keys(product.specs).length > 0 ? (
                        <Card className="border-border/50">
                          <CardContent className="p-4">
                            <dl className="divide-y divide-border/50">
                              {Object.entries(product.specs as Record<string, unknown>).map(([key, value]) => (
                                <div key={key} className="py-3 flex justify-between gap-4">
                                  <dt className="text-muted-foreground">{key}</dt>
                                  <dd className="font-medium text-right">{String(value)}</dd>
                                </div>
                              ))}
                            </dl>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="border-border/50">
                          <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground mb-3">
                              Технические характеристики уточняйте у менеджера
                            </p>
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/contacts">Связаться с нами</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="delivery" className="mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {DELIVERY_FEATURES.map((feature, index) => (
                          <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="h-full border-border/50">
                              <CardContent className="p-4 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <feature.icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">{feature.title}</h4>
                                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="warranty" className="mt-4">
                      <Card className="border-border/50">
                        <CardContent className="p-4 space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Гарантия производителя</h4>
                            <p className="text-sm text-muted-foreground">
                              На всё оборудование распространяется заводская гарантия производителя. 
                              Срок гарантии зависит от типа оборудования и производителя.
                            </p>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2">Проверка качества</h4>
                            <p className="text-sm text-muted-foreground">
                              Перед отправкой каждая единица товара проходит проверку на нашем складе 
                              в Китае. Вы получаете фото- и видеоотчёт о состоянии товара.
                            </p>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2">Возврат и обмен</h4>
                            <p className="text-sm text-muted-foreground">
                              В случае выявления заводского брака мы организуем возврат или обмен 
                              товара за свой счёт.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </div>

              {filteredRelated && filteredRelated.length > 0 && (
                <motion.section
                  className="mt-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Похожие товары</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredRelated.map((relatedProduct) => (
                      <ProductCard key={relatedProduct.id} product={relatedProduct} />
                    ))}
                  </div>
                </motion.section>
              )}

              <motion.div
                className="mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button variant="ghost" asChild>
                  <Link href="/catalog">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Вернуться в каталог
                  </Link>
                </Button>
              </motion.div>
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
