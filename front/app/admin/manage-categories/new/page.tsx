'use client';

import { useRef, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateCategory, useCategories } from '@/lib/hooks/use-categories';
import { slugify } from '@/lib/utils';
import type { Category } from '@/lib/api/types';

function flattenCategoriesForSelect(categories: Category[], prefix = ''): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = [];
  for (const cat of categories) {
    result.push({ id: cat.id, name: prefix ? `${prefix} → ${cat.name}` : cat.name });
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategoriesForSelect(cat.children, prefix ? `${prefix} → ${cat.name}` : cat.name));
    }
  }
  return result;
}

const ROOT_CATEGORY_VALUE = '__ROOT_CATEGORY__';

const categorySchema = z.object({
  name: z.string().min(2, 'Введите название категории'),
  slug: z.string().min(2, 'Введите slug'),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function NewCategoryPage() {
  const router = useRouter();
  const createCategory = useCreateCategory();
  const { data: categories } = useCategories();
  const isSlugManuallyEdited = useRef(false);

  const flatCategories = useMemo(() => {
    if (!categories) return [];
    return flattenCategoriesForSelect(categories);
  }, [categories]);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: '',
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      await createCategory.mutateAsync({
        ...data,
        parentId: data.parentId && data.parentId !== ROOT_CATEGORY_VALUE ? data.parentId : undefined,
      });
      router.push('/admin/manage-categories');
    } catch {
      alert('Ошибка при создании категории');
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
          <Link href="/admin/manage-categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к списку
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Новая категория</h1>
        <p className="text-muted-foreground">Создание новой категории товаров</p>
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
                        <Input
                          placeholder="Название категории"
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
                          placeholder="category-slug"
                          {...field}
                          onChange={(e) => handleSlugChange(e.target.value)}
                        />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите родительскую категорию (опционально)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ROOT_CATEGORY_VALUE}>Нет (корневая категория)</SelectItem>
                        {flatCategories.map((category) => (
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Описание категории…" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
                <Button variant="outline" type="button" asChild className="w-full sm:w-auto">
                  <Link href="/admin/manage-categories">Отмена</Link>
                </Button>
                <Button type="submit" disabled={createCategory.isPending} className="w-full sm:w-auto">
                  {createCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Создать категорию
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
