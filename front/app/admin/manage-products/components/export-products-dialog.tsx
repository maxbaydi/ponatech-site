'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExportProductsCsv } from '@/lib/hooks/use-products';
import { useBrands } from '@/lib/hooks/use-brands';
import type { ExportProductsCsvRequest, ProductCsvColumn } from '@/lib/api/types';

const CSV_COLUMNS: ProductCsvColumn[] = [
  'id',
  'name',
  'article',
  'price',
  'img',
  'description',
  'characteristics',
  'brand',
  'category',
];

const ALL_BRANDS_VALUE = '__ALL_BRANDS__';

interface ExportProductsDialogProps {
  searchQuery?: string;
  selectedIds?: string[];
}

export function ExportProductsDialog({ searchQuery, selectedIds }: ExportProductsDialogProps) {
  const { data: brands } = useBrands();
  const exportCsv = useExportProductsCsv();

  const [open, setOpen] = useState(false);
  const [columns, setColumns] = useState<Set<ProductCsvColumn>>(() => new Set(CSV_COLUMNS));
  const [brandId, setBrandId] = useState<string>(ALL_BRANDS_VALUE);
  const [exportSelected, setExportSelected] = useState(false);
  const selectedCount = selectedIds?.length ?? 0;
  const canExportSelected = selectedCount > 0;
  const disableFilters = exportSelected && canExportSelected;

  const toggleColumn = (column: ProductCsvColumn) => {
    setColumns((prev) => {
      const next = new Set(prev);
      if (next.has(column)) next.delete(column);
      else next.add(column);
      return next;
    });
  };

  const handleExport = async () => {
    const useSelected = exportSelected && canExportSelected;
    const payload: ExportProductsCsvRequest = {
      columns: Array.from(columns),
      ids: useSelected ? selectedIds : undefined,
      brandId: useSelected ? undefined : brandId === ALL_BRANDS_VALUE ? undefined : brandId,
      search: useSelected ? undefined : searchQuery || undefined,
    };

    const blob = await exportCsv.mutateAsync(payload);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Экспорт
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Экспорт товаров в CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Экспортируются товары, соответствующие текущим фильтрам.
          </p>

          <div className="space-y-2">
            <Label>Область экспорта</Label>
            <Label className="flex items-center gap-2 font-normal">
              <Checkbox
                checked={exportSelected}
                onCheckedChange={(v) => setExportSelected(v === true)}
                disabled={!canExportSelected}
              />
              <span className="text-sm">Только выделенные ({selectedCount})</span>
            </Label>
            {!canExportSelected && (
              <p className="text-xs text-muted-foreground">
                Выберите товары в списке, чтобы экспортировать только выделенные.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Бренд</Label>
            <Select value={brandId} onValueChange={setBrandId} disabled={disableFilters}>
              <SelectTrigger>
                <SelectValue placeholder="Все бренды" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_BRANDS_VALUE}>Все бренды</SelectItem>
                {brands?.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Колонки</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CSV_COLUMNS.map((col) => (
                <Label key={col} className="flex items-center gap-2 font-normal">
                  <Checkbox checked={columns.has(col)} onCheckedChange={() => toggleColumn(col)} />
                  <span className="font-mono text-sm">{col}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleExport} disabled={exportCsv.isPending || columns.size === 0}>
            {exportCsv.isPending ? 'Экспорт...' : 'Скачать CSV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
