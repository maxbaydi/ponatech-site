'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, FolderTree, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories, useDeleteCategory } from '@/lib/hooks/use-categories';
import type { Category } from '@/lib/api/types';

interface CategoryWithLevel extends Category {
  level: number;
}

function flattenCategories(categories: Category[], level = 0): CategoryWithLevel[] {
  const result: CategoryWithLevel[] = [];

  for (const category of categories) {
    result.push({ ...category, level });

    if (category.children && category.children.length > 0) {
      const childItems = flattenCategories(category.children, level + 1);
      result.push(...childItems);
    }
  }

  return result;
}

export default function CategoriesPage() {
  const [search, setSearch] = useState('');
  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  const hierarchicalCategories = useMemo(() => {
    if (!categories) return [];
    return flattenCategories(categories);
  }, [categories]);

  const filteredCategories = hierarchicalCategories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
      await deleteCategory.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Категории</h1>
          <p className="text-muted-foreground">Управление категориями товаров</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/manage-categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Добавить категорию
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-none">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск категорий..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredCategories && filteredCategories.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Категория</TableHead>
                    <TableHead className="hidden sm:table-cell">Slug</TableHead>
                    <TableHead className="hidden md:table-cell">Товары</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 sm:gap-3">
                          {category.level > 0 && (
                            <div 
                              className="flex items-center text-muted-foreground"
                              style={{ marginLeft: `${(category.level - 1) * 12}px` }}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          )}
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-muted flex items-center justify-center shrink-0">
                            <FolderTree className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                          </div>
                          <div className="font-medium text-sm sm:text-base min-w-[100px]">{category.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell">{category.slug}</TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {category.productsCount ?? 0}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/manage-categories/${category.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Редактировать
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(category.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>Категории не найдены</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
