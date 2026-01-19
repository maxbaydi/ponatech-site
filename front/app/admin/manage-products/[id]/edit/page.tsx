'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { MediaLibraryPicker } from '@/components/admin/media-library-picker';
import { SpecsEditor, specsItemsToRecord, specsRecordToItems } from '@/components/admin/specs-editor';
import { useProduct, useUpdateProduct } from '@/lib/hooks/use-products';
import { useBrands } from '@/lib/hooks/use-brands';
import { useCategories } from '@/lib/hooks/use-categories';
import { getMainProductImage } from '@/lib/products';
import type { MediaFile } from '@/lib/api/types';

const productSchema = z.object({
  title: z.string().min(2, 'Введите название товара'),
  slug: z.string().min(2, 'Введите slug'),
  sku: z.string().min(2, 'Введите SKU'),
  description: z.string().optional(),
  characteristics: z.string().optional(),
  specs: z.array(z.object({ key: z.string(), value: z.string() })),
  price: z.coerce.number().min(0, 'Цена должна быть положительной'),
  currency: z.string().default('RUB'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  stock: z.union([z.coerce.number().min(0), z.null()]).default(null),
  brandId: z.string().min(1, 'Выберите бренд'),
  categoryId: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const toMainImageId = (file: MediaFile | null): string | null => {
  const id = file?.id?.trim();
  return id ? id : null;
};

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const router = useRouter();
  const { data: product, isLoading: productLoading, error: productError } = useProduct(productId);
  const updateProduct = useUpdateProduct();
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const formInitialized = useRef(false);
  const prevProductId = useRef<string | null>(null);
  const initialMainImageId = useRef<string | null>(null);
  const [trackStock, setTrackStock] = useState(false);
  const [mainImage, setMainImage] = useState<MediaFile | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      slug: '',
      sku: '',
      description: '',
      characteristics: '',
      specs: [],
      price: 0,
      currency: 'RUB',
      status: 'DRAFT',
      stock: 0,
      brandId: '',
      categoryId: '',
    },
  });

  useEffect(() => {
    if (prevProductId.current !== productId) {
      prevProductId.current = productId;
      formInitialized.current = false;
    }
  }, [productId]);

  useEffect(() => {
    const hasBrands = brands && brands.length > 0;
    const hasCategories = categories && categories.length >= 0;
    const canInitialize = product && hasBrands && hasCategories && !formInitialized.current;
    
    if (canInitialize) {
      const brandExists = brands.some((b) => b.id === product.brandId);
      const validBrandId = brandExists ? product.brandId : '';
      const validStatus = ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(product.status) 
        ? product.status 
        : 'DRAFT';
      const hasStock = typeof product.stock === 'number';
      
      const productMainImage = getMainProductImage(product.images);
      if (productMainImage) {
        initialMainImageId.current = productMainImage.mediaFileId ?? null;
        setMainImage({
          id: productMainImage.mediaFileId ?? '',
          filename: '',
          originalName: productMainImage.alt || product.title,
          mimeType: 'image/jpeg',
          size: 0,
          url: productMainImage.url,
          alt: productMainImage.alt,
          createdAt: '',
          updatedAt: '',
        });
      } else {
        initialMainImageId.current = null;
        setMainImage(null);
      }
      
      setTrackStock(hasStock);
      formInitialized.current = true;
      form.reset({
        title: product.title,
        slug: product.slug,
        sku: product.sku,
        description: product.description || '',
        characteristics: product.characteristics || '',
        specs: specsRecordToItems(product.specs ?? undefined),
        price: Number(product.price),
        currency: product.currency,
        status: validStatus as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
        stock: hasStock ? product.stock : null,
        brandId: validBrandId,
        categoryId: product.categoryId ?? '',
      });
    }
  }, [product, brands, categories, form]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      const selectedMainImageId = toMainImageId(mainImage);
      const mainImageChanged = selectedMainImageId !== initialMainImageId.current;
      const specs = specsItemsToRecord(data.specs);

      await updateProduct.mutateAsync({
        id: productId,
        data: {
          ...data,
          specs,
          stock: trackStock ? data.stock : null,
          categoryId: data.categoryId || undefined,
          attributes: product?.attributes || {},
          ...(mainImageChanged ? { mainImageId: selectedMainImageId } : {}),
        },
      });
      router.push('/admin/manage-products');
    } catch {
      alert('Ошибка при обновлении товара');
    }
  };

  const isLoading = productLoading || brandsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div>
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin/manage-products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к списку
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">Товар не найден</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/manage-products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к списку
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Редактирование товара</h1>
        <p className="text-muted-foreground">Изменение данных товара в каталоге</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Информация о товаре</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название *</FormLabel>
                        <FormControl>
                          <Input placeholder="Название товара" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug *</FormLabel>
                        <FormControl>
                          <Input placeholder="slug-tovara" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Цена *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание</FormLabel>
                      <FormControl>
                        <RichTextEditor value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="characteristics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Характеристики</FormLabel>
                      <FormControl>
                        <RichTextEditor value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Характеристики (таблица)</FormLabel>
                      <FormControl>
                        <SpecsEditor
                          value={field.value}
                          onChange={field.onChange}
                          keyPlaceholder="Название"
                          valuePlaceholder="Значение"
                          addLabel="Добавить характеристику"
                          removeLabel="Удалить характеристику"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
                  <Button variant="outline" type="button" asChild className="w-full sm:w-auto">
                    <Link href="/admin/manage-products">Отмена</Link>
                  </Button>
                  <Button type="submit" disabled={updateProduct.isPending} className="w-full sm:w-auto">
                    {updateProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Сохранить изменения
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Изображение</CardTitle>
                </CardHeader>
                <CardContent>
                  <MediaLibraryPicker value={mainImage} onChange={setMainImage} />
                  <p className="text-xs text-muted-foreground mt-2">
                    Выберите изображение из медиабиблиотеки или загрузите новое
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Параметры</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Бренд *</FormLabel>
                        <Select 
                          key={`brand-${field.value}`}
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите бренд" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands?.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Категория</FormLabel>
                        <Select 
                          key={`category-${field.value}`}
                          onValueChange={field.onChange} 
                          value={field.value || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Статус</FormLabel>
                        <Select 
                          key={`status-${field.value}`}
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите статус" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DRAFT">Черновик</SelectItem>
                            <SelectItem value="PUBLISHED">Опубликован</SelectItem>
                            <SelectItem value="ARCHIVED">В архиве</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Остаток</FormLabel>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="track-stock"
                              checked={trackStock}
                              onCheckedChange={(checked) => {
                                setTrackStock(!!checked);
                                if (!checked) {
                                  field.onChange(null);
                                } else {
                                  field.onChange(0);
                                }
                              }}
                            />
                            <label 
                              htmlFor="track-stock" 
                              className="text-sm text-muted-foreground cursor-pointer"
                            >
                              Учитывать остаток
                            </label>
                          </div>
                          {trackStock && (
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                value={field.value === null ? '' : String(field.value)}
                                onChange={(e) => {
                                  const next = e.target.value.trim();
                                  field.onChange(next === '' ? 0 : Number(next));
                                }}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
