'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateBrand } from '@/lib/hooks/use-brands';
import { slugify } from '@/lib/utils';

const brandSchema = z.object({
  name: z.string().min(2, 'Введите название бренда'),
  slug: z.string().min(2, 'Введите slug'),
  description: z.string().optional(),
  logoUrl: z.string().url('Введите корректный URL').optional().or(z.literal('')),
  country: z.string().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

export default function NewBrandPage() {
  const router = useRouter();
  const createBrand = useCreateBrand();
  const isSlugManuallyEdited = useRef(false);

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      country: '',
    },
  });

  const onSubmit = async (data: BrandFormData) => {
    try {
      await createBrand.mutateAsync({
        ...data,
        logoUrl: data.logoUrl || undefined,
      });
      router.push('/admin/manage-brands');
    } catch {
      alert('Ошибка при создании бренда');
    }
  };

  const handleNameChange = (value: string) => {
    form.setValue('name', value);
    if (!isSlugManuallyEdited.current) {
      form.setValue('slug', slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    isSlugManuallyEdited.current = true;
    form.setValue('slug', value);
  };

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/manage-brands">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к списку
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Новый бренд</h1>
        <p className="text-muted-foreground">Добавление нового производителя</p>
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
                        <Input
                          placeholder="Название бренда"
                          {...field}
                          onChange={(e) => handleNameChange(e.target.value)}
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
                        <Input
                          placeholder="brand-slug"
                          {...field}
                          onChange={(e) => handleSlugChange(e.target.value)}
                        />
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

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
                <Button variant="outline" type="button" asChild className="w-full sm:w-auto">
                  <Link href="/admin/manage-brands">Отмена</Link>
                </Button>
                <Button type="submit" disabled={createBrand.isPending} className="w-full sm:w-auto">
                  {createBrand.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Создать бренд
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
