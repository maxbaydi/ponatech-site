'use client';

import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useImportProductsCsv } from '@/lib/hooks/use-products';
import type { ProductCsvColumn, ProductStatus } from '@/lib/api/types';

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

const CSV_REQUIRED_COLUMNS: ProductCsvColumn[] = ['name', 'article', 'price', 'brand'];
const DEFAULT_IMPORT_STATUS: ProductStatus = 'PUBLISHED';

export function ImportProductsDialog() {
  const importCsv = useImportProductsCsv();

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [status, setStatus] = useState<ProductStatus>(DEFAULT_IMPORT_STATUS);
  const [updateBySku, setUpdateBySku] = useState(true);

  const columnStatus = useMemo(() => {
    const set = new Set(columns.map((c) => c.trim()));
    const requiredMissing = CSV_REQUIRED_COLUMNS.filter((c) => !set.has(c));
    const optionalPresent = CSV_COLUMNS.filter((c) => set.has(c));
    return { set, requiredMissing, optionalPresent };
  }, [columns]);

  const canImport = !!file && columnStatus.requiredMissing.length === 0 && !importCsv.isPending;

  const resetState = () => {
    setFile(null);
    setColumns([]);
    setPreviewRows([]);
    setStatus(DEFAULT_IMPORT_STATUS);
    setUpdateBySku(true);
  };

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setColumns([]);
    setPreviewRows([]);

    Papa.parse<Record<string, unknown>>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
      complete: (results) => {
        setColumns((results.meta.fields ?? []).map(String));
        setPreviewRows((results.data ?? []) as Record<string, unknown>[]);
      },
      error: () => {
        setColumns([]);
        setPreviewRows([]);
      },
    });
  };

  const handleImport = async () => {
    if (!file) return;

    const result = await importCsv.mutateAsync({
      file,
      opts: { status, updateBySku },
    });

    setOpen(false);
    resetState();

    const summary = `Импорт завершён. Всего: ${result.total}. Создано: ${result.created}. Обновлено: ${result.updated}. Ошибок: ${result.failed}.`;
    if (result.failed > 0) {
      const firstErrors = result.errors
        .slice(0, 10)
        .map((e) => `Строка ${e.row}: ${e.message}`)
        .join('\n');
      alert(`${summary}\n\nПервые ошибки:\n${firstErrors}`);
      return;
    }
    alert(summary);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetState();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Импорт
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:w-fit sm:min-w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Импорт товаров из CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="products-csv-file">CSV файл</Label>
            <Input
              id="products-csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) handleFileChange(selectedFile);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Статус импортируемых товаров</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">Опубликован</SelectItem>
                  <SelectItem value="DRAFT">Черновик</SelectItem>
                  <SelectItem value="ARCHIVED">В архиве</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Обновление</Label>
              <Label className="flex items-center gap-2 font-normal">
                <Checkbox checked={updateBySku} onCheckedChange={(v) => setUpdateBySku(v === true)} />
                <span className="text-sm">Если `id` пустой — обновлять товар по `article` (SKU)</span>
              </Label>
            </div>
          </div>

          {columns.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Проверка колонок</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {columnStatus.requiredMissing.length > 0 ? (
                  <div className="text-sm text-destructive">
                    Не найдены обязательные колонки: {columnStatus.requiredMissing.join(', ')}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Колонки распознаны корректно.</div>
                )}

                <div className="flex flex-wrap gap-2">
                  {CSV_COLUMNS.map((col) => (
                    <Badge
                      key={col}
                      variant={
                        columnStatus.set.has(col)
                          ? 'secondary'
                          : CSV_REQUIRED_COLUMNS.includes(col)
                            ? 'destructive'
                            : 'outline'
                      }
                    >
                      {col}
                      {columnStatus.set.has(col)
                        ? ' ✓'
                        : CSV_REQUIRED_COLUMNS.includes(col)
                          ? ' (обязательная)'
                          : ''}
                    </Badge>
                  ))}
                </div>

                {previewRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Пример данных (первые строки)</div>
                    <div className="overflow-auto border rounded-md max-h-48">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {columnStatus.optionalPresent.map((col) => (
                              <TableHead key={col} className="whitespace-nowrap">
                                {col}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewRows.map((row, idx) => (
                            <TableRow key={idx}>
                              {columnStatus.optionalPresent.map((col) => (
                                <TableCell key={col} className="max-w-[200px] truncate">
                                  {String(row[col] ?? '')}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleImport} disabled={!canImport}>
            {importCsv.isPending ? 'Импорт...' : 'Подтвердить импорт'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
