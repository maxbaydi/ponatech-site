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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategory, useCategories, useUpdateCategory } from '@/lib/hooks/use-categories';

const NONE_VALUE = '__none__';

const categorySchema = z.object({
  name: z.string().min(2, 'Введите название категории'),
  slug: z.string().min(2, 'Введите slug'),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const router = useRouter();
  const { data: category, isLoading: categoryLoading, error } = useCategory(categoryId);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const updateCategory = useUpdateCategory();
  const formInitialized = useRef(false);
  const prevCategoryId = useRef<string | null>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: '',
    },
  });

  useEffect(() => {
    if (prevCategoryId.current !== categoryId) {
      prevCategoryId.current = categoryId;
      formInitialized.current = false;
    }
  }, [categoryId]);

  useEffect(() => {
    if (category && categories && !formInitialized.current) {
      formInitialized.current = true;
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId || '',
      });
    }
  }, [category, categories, form]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const parentId = data.parentId === NONE_VALUE || !data.parentId ? undefined : data.parentId;
      await updateCategory.mutateAsync({
        id: categoryId,
        data: {
          ...data,
          parentId,
          description: data.description || undefined,
        },
      });
      router.push('/admin/manage-categories');
    } catch {
      alert('Ошибка при обновлении категории');
    }
  };

  const isLoading = categoryLoading || categoriesLoading;

  const availableParentCategories = categories?.filter((c) => c.id !== categoryId);

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
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div>
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin/manage-categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к списку
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">Категория не найдена</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/manage-categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к списку
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Редактирование категории</h1>
        <p className="text-muted-foreground">Изменение данных категории товаров</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о категории</CardTitle>
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
                        <Input placeholder="Название категории" {...field} />
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
                        <Input placeholder="category-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Родительская категория</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || NONE_VALUE}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите родительскую категорию (опционально)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>Нет (корневая категория)</SelectItem>
                        {availableParentCategories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Описание категории..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
                <Button variant="outline" type="button" asChild className="w-full sm:w-auto">
                  <Link href="/admin/manage-categories">Отмена</Link>
                </Button>
                <Button type="submit" disabled={updateCategory.isPending} className="w-full sm:w-auto">
                  {updateCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
