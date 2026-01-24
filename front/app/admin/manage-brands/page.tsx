'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import { BrandLogo } from '@/components/brands/brand-logo';
import { useBrands, useDeleteBrand } from '@/lib/hooks/use-brands';

export default function BrandsPage() {
  const [search, setSearch] = useState('');
  const { data: brands, isLoading } = useBrands();
  const deleteBrand = useDeleteBrand();

  const filteredBrands = brands?.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот бренд?')) {
      await deleteBrand.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Бренды</h1>
          <p className="text-muted-foreground">Управление брендами производителей</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/manage-brands/new">
            <Plus className="mr-2 h-4 w-4" />
            Добавить бренд
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск брендов..."
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
          ) : filteredBrands && filteredBrands.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Бренд</TableHead>
                    <TableHead className="hidden sm:table-cell">Slug</TableHead>
                    <TableHead className="hidden md:table-cell">Страна</TableHead>
                    <TableHead className="hidden sm:table-cell">Товары</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <BrandLogo
                            name={brand.name}
                            src={brand.logoUrl}
                            size="sm"
                            className="rounded shrink-0"
                          />
                          <div className="font-medium min-w-[100px]">{brand.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell">{brand.slug}</TableCell>
                      <TableCell className="hidden md:table-cell">{brand.country || '-'}</TableCell>
                      <TableCell className="text-muted-foreground hidden sm:table-cell">
                        {brand.productsCount ?? 0}
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
                              <Link href={`/admin/manage-brands/${brand.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Редактировать
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(brand.id)}
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
              <p>Бренды не найдены</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
