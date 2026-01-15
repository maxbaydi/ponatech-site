'use client';

import { Package, Building2, FolderTree, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/lib/hooks/use-products';
import { useBrands } from '@/lib/hooks/use-brands';
import { useCategories } from '@/lib/hooks/use-categories';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: allProductsPage } = useProducts({ page: 1, limit: 1 });
  const { data: publishedProductsPage } = useProducts({ status: 'PUBLISHED', page: 1, limit: 1 });
  const { data: draftProductsPage } = useProducts({ status: 'DRAFT', page: 1, limit: 1 });
  const { data: latestProductsPage } = useProducts({ page: 1, limit: 5, sort: 'created_desc' });
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

  const totalProducts = allProductsPage?.total ?? 0;
  const publishedProducts = publishedProductsPage?.total ?? 0;
  const draftProducts = draftProductsPage?.total ?? 0;
  const latestProducts = latestProductsPage?.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <p className="text-muted-foreground">Обзор системы управления каталогом</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Всего товаров"
          value={totalProducts}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          description={`${publishedProducts} опубликовано, ${draftProducts} черновиков`}
        />
        <StatCard
          title="Бренды"
          value={brands?.length || 0}
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
          description="Активных производителей"
        />
        <StatCard
          title="Категории"
          value={categories?.length || 0}
          icon={<FolderTree className="h-4 w-4 text-muted-foreground" />}
          description="Категорий товаров"
        />
        <StatCard
          title="Активность"
          value="+12%"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="За последний месяц"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Последние товары</CardTitle>
          </CardHeader>
          <CardContent>
            {latestProducts.length > 0 ? (
              <div className="space-y-4">
                {latestProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{product.title}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.status === 'PUBLISHED'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {product.status === 'PUBLISHED' ? 'Опубликован' : 'Черновик'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Нет товаров</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Популярные бренды</CardTitle>
          </CardHeader>
          <CardContent>
            {brands && brands.length > 0 ? (
              <div className="space-y-4">
                {brands.slice(0, 5).map((brand) => (
                  <div key={brand.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <span className="text-xs font-bold">{brand.name.slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{brand.name}</p>
                        <p className="text-xs text-muted-foreground">{brand.country}</p>
                      </div>
                    </div>
                    {brand.isFeatured && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        Featured
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Нет брендов</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
