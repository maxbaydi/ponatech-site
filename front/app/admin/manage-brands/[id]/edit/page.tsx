'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useRef } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useBrand, useUpdateBrand } from '@/lib/hooks/use-brands';

const brandSchema = z.object({
  name: z.string().min(2, 'Введите название бренда'),
  slug: z.string().min(2, 'Введите slug'),
  description: z.string().optional(),
  logoUrl: z.string().url('Введите корректный URL').optional().or(z.literal('')),
  country: z.string().optional(),
  isFeatured: z.boolean().default(false),
});

type BrandFormData = z.infer<typeof brandSchema>;

export default function EditBrandPage() {
  const params = useParams();
  const brandId = params.id as string;
  const router = useRouter();
  const { data: brand, isLoading, error } = useBrand(brandId);
  const updateBrand = useUpdateBrand();
  const formInitialized = useRef(false);
  const prevBrandId = useRef<string | null>(null);

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      country: '',
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (prevBrandId.current !== brandId) {
      prevBrandId.current = brandId;
      formInitialized.current = false;
    }
  }, [brandId]);

  useEffect(() => {
    if (brand && !formInitialized.current) {
      formInitialized.current = true;
      form.reset({
        name: brand.name,
        slug: brand.slug,
        description: brand.description || '',
        logoUrl: brand.logoUrl || '',
        country: brand.country || '',
        isFeatured: brand.isFeatured,
      });
    }
  }, [brand, form]);

  const onSubmit = async (data: BrandFormData) => {
    try {
      await updateBrand.mutateAsync({
        id: brandId,
        data: {
          ...data,
          logoUrl: data.logoUrl || undefined,
          description: data.description || undefined,
          country: data.country || undefined,
        },
      });
      router.push('/admin/manage-brands');
    } catch {
      alert('Ошибка при обновлении бренда');
    }
  };

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
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div>
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin/manage-brands">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к списку
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">Бренд не найден</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/manage-brands">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к списку
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Редактирование бренда</h1>
        <p className="text-muted-foreground">Изменение данных производителя</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о бренде</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название *</FormLabel>
                      <FormControl>
                        <Input placeholder="Название бренда" {...field} />
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
                        <Input placeholder="brand-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Страна</FormLabel>
                      <FormControl>
                        <Input placeholder="Германия" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL логотипа</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
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
                      <Textarea placeholder="Описание бренда..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Избранный бренд</FormLabel>
                      <FormDescription>
                        Избранные бренды отображаются на главной странице
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
                <Button variant="outline" type="button" asChild className="w-full sm:w-auto">
                  <Link href="/admin/manage-brands">Отмена</Link>
                </Button>
                <Button type="submit" disabled={updateBrand.isPending} className="w-full sm:w-auto">
                  {updateBrand.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Сохранить изменения
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
