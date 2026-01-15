'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { MediaLibraryPicker } from '@/components/admin/media-library-picker';
import { SpecsEditor, specsItemsToRecord } from '@/components/admin/specs-editor';
import { useCreateProduct } from '@/lib/hooks/use-products';
import { useBrands } from '@/lib/hooks/use-brands';
import { useCategories } from '@/lib/hooks/use-categories';
import { slugify } from '@/lib/utils';
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

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();
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
      stock: null,
      brandId: '',
      categoryId: '',
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      const specs = specsItemsToRecord(data.specs);
      await createProduct.mutateAsync({
        ...data,
        specs,
        stock: trackStock ? data.stock : null,
        categoryId: data.categoryId || undefined,
        attributes: {},
        mainImageId: toMainImageId(mainImage),
      });
      router.push('/admin/manage-products');
    } catch {
      alert('Ошибка при создании товара');
    }
  };

  const handleTitleChange = (value: string) => {
    form.setValue('title', value);
    if (!form.getValues('slug')) {
      form.setValue('slug', slugify(value));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/manage-products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к списку
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Новый товар</h1>
        <p className="text-muted-foreground">Создание нового товара в каталоге</p>
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
                          <Input
                            placeholder="Название товара"
                            {...field}
                            onChange={(e) => handleTitleChange(e.target.value)}
                          />
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
                  <Button type="submit" disabled={createProduct.isPending} className="w-full sm:w-auto">
                    {createProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Создать товар
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
