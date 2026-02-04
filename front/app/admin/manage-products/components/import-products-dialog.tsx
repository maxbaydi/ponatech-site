'use client';

import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Progress } from '@/components/ui/progress';
import { useImportProductsCsv } from '@/lib/hooks/use-products';
import { useIndeterminateProgress } from '@/lib/hooks/use-indeterminate-progress';
import type { ImportProductsCsvStrategy, ProductCsvColumn, ProductStatus } from '@/lib/api/types';

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
const IMPORT_DIALOG_DESCRIPTION =
  'Загрузите CSV-файл с товарами. Поля name, article, price и brand обязательны для импорта.';
const IMPORT_MERGE_STRATEGIES: Array<{ value: ImportProductsCsvStrategy; label: string; description: string }> = [
  {
    value: 'replace',
    label: 'Перезаписать',
    description: 'Полностью перезаписать выбранные поля у совпавших товаров и создать новые.',
  },
  {
    value: 'update',
    label: 'Обновить отличия',
    description: 'Обновлять только поля, которые отличаются; остальные оставить как есть.',
  },
];
const PARSE_ERROR_MESSAGE =
  'Не удалось прочитать CSV. Проверьте кодировку (UTF-8) и разделитель.';

export function ImportProductsDialog() {
  const importCsv = useImportProductsCsv();
  const progressValue = useIndeterminateProgress(importCsv.isPending);

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<Set<ProductCsvColumn>>(new Set());
  const [status, setStatus] = useState<ProductStatus>(DEFAULT_IMPORT_STATUS);
  const [updateBySku, setUpdateBySku] = useState(true);
  const [mergeStrategy, setMergeStrategy] = useState<ImportProductsCsvStrategy>('replace');
  const [parseError, setParseError] = useState<string | null>(null);

  const columnStatus = useMemo(() => {
    const set = new Set(columns.map((c) => c.trim()));
    const available = CSV_COLUMNS.filter((c) => set.has(c));
    const requiredMissing = CSV_REQUIRED_COLUMNS.filter((c) => !set.has(c));
    const requiredNotSelected = CSV_REQUIRED_COLUMNS.filter((c) => !selectedColumns.has(c));
    const ignored = columns.filter((c) => !CSV_COLUMNS.includes(c as ProductCsvColumn));
    return { set, available, requiredMissing, requiredNotSelected, ignored };
  }, [columns, selectedColumns]);

  const requiresFullSet =
    mergeStrategy === 'replace'
    && columnStatus.requiredMissing.length === 0
    && columnStatus.requiredNotSelected.length === 0;

  const canImport = !!file && selectedColumns.size > 0 && !importCsv.isPending
    && (mergeStrategy === 'update' || requiresFullSet);

  const previewColumns = useMemo(
    () => columnStatus.available.filter((col) => selectedColumns.has(col)),
    [columnStatus.available, selectedColumns],
  );

  const resetState = () => {
    setFile(null);
    setColumns([]);
    setPreviewRows([]);
    setSelectedColumns(new Set());
    setStatus(DEFAULT_IMPORT_STATUS);
    setUpdateBySku(true);
    setMergeStrategy('replace');
    setParseError(null);
  };

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setColumns([]);
    setPreviewRows([]);
    setParseError(null);

    Papa.parse<Record<string, unknown>>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
      complete: (results) => {
        const fields = (results.meta.fields ?? []).map((field) => String(field).trim());
        const available = fields.filter((field) => CSV_COLUMNS.includes(field as ProductCsvColumn)) as ProductCsvColumn[];
        setColumns(fields);
        setSelectedColumns(new Set(available));
        setPreviewRows((results.data ?? []) as Record<string, unknown>[]);
      },
      error: () => {
        setColumns([]);
        setPreviewRows([]);
        setSelectedColumns(new Set());
        setParseError(PARSE_ERROR_MESSAGE);
      },
    });
  };

  const toggleSelectedColumn = (column: ProductCsvColumn) => {
    setSelectedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(column)) next.delete(column);
      else next.add(column);
      return next;
    });
  };

  const selectAllColumns = () => {
    setSelectedColumns(new Set(columnStatus.available));
  };

  const clearSelectedColumns = () => {
    setSelectedColumns(new Set());
  };

  const handleImport = async () => {
    if (!file) return;

    const result = await importCsv.mutateAsync({
      file,
      opts: { status, updateBySku, columns: Array.from(selectedColumns), mergeStrategy },
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
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[90vw] sm:w-fit sm:min-w-[500px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Импорт товаров из CSV</DialogTitle>
          <DialogDescription>{IMPORT_DIALOG_DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
            <div className="space-y-2 flex flex-col items-start min-w-0">
              <Label htmlFor="products-csv-file">CSV файл</Label>
              <Input
                id="products-csv-file"
                type="file"
                accept=".csv,text/csv"
                className="text-center w-full justify-center items-start align-middle pb-0 pt-1 pl-1 file:rounded-md file:border file:border-input file:bg-muted file:px-2.5 file:py-1 file:mr-2 file:text-xs file:font-semibold file:text-foreground file:shadow-sm file:cursor-pointer file:select-none file:transition-colors file:hover:bg-muted/80"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileChange(selectedFile);
                }}
              />
              {file && (
                <p className="text-sm text-muted-foreground truncate w-full" title={file.name}>
                  {file.name}
                </p>
              )}
              {parseError && (
                <p className="text-sm text-destructive" role="alert">
                  {parseError}
                </p>
              )}
            </div>
            <div className="space-y-2 flex flex-col items-start min-w-0">
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
          </div>

          <div className="space-y-2 flex flex-col justify-center">
            <Label>Обновление</Label>
            <Label className="flex items-start gap-2 font-normal cursor-pointer">
              <Checkbox
                checked={updateBySku}
                onCheckedChange={(v) => setUpdateBySku(v === true)}
                className="mt-0.5 shrink-0"
              />
              <span className="text-sm flex-1 min-w-0">
                Если <code className="text-xs bg-muted px-1 rounded">id</code> пустой — обновлять товар по{' '}
                <code className="text-xs bg-muted px-1 rounded">article</code> (SKU)
              </span>
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Режим импорта</Label>
            <Select value={mergeStrategy} onValueChange={(v) => setMergeStrategy(v as ImportProductsCsvStrategy)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMPORT_MERGE_STRATEGIES.map((strategy) => (
                  <SelectItem key={strategy.value} value={strategy.value}>
                    {strategy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {IMPORT_MERGE_STRATEGIES.find((strategy) => strategy.value === mergeStrategy)?.description}
            </p>
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

                {columnStatus.ignored.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Игнорируемые колонки: {columnStatus.ignored.join(', ')}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="text-sm">Колонки для импорта</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={selectAllColumns}
                        disabled={columnStatus.available.length === 0}
                      >
                        Выбрать все
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSelectedColumns}
                        disabled={selectedColumns.size === 0}
                      >
                        Очистить
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {columnStatus.available.map((col) => (
                      <Label key={col} className="flex items-center gap-2 font-normal">
                        <Checkbox checked={selectedColumns.has(col)} onCheckedChange={() => toggleSelectedColumn(col)} />
                        <span className="font-mono text-sm">{col}</span>
                        {CSV_REQUIRED_COLUMNS.includes(col) && (
                          <span className="text-xs text-muted-foreground">(обязательная)</span>
                        )}
                      </Label>
                    ))}
                  </div>
                  {mergeStrategy === 'replace' && columnStatus.requiredNotSelected.length > 0 && (
                    <p className="text-xs text-destructive">
                      Для режима «Перезаписать» выберите обязательные колонки: {columnStatus.requiredNotSelected.join(', ')}.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {CSV_COLUMNS.map((col) => {
                    const isPresent = columnStatus.set.has(col);
                    const isSelected = selectedColumns.has(col);
                    const isRequired = CSV_REQUIRED_COLUMNS.includes(col);
                    const variant = isPresent ? (isSelected ? 'secondary' : 'outline') : isRequired ? 'destructive' : 'outline';
                    return (
                      <Badge key={col} variant={variant}>
                        {col}
                        {isPresent && isSelected ? ' ✓' : ''}
                        {!isPresent && isRequired ? ' (обязательная)' : ''}
                        {isPresent && !isSelected ? ' (не выбрана)' : ''}
                      </Badge>
                    );
                  })}
                </div>

                {previewRows.length > 0 && previewColumns.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Пример данных (первые строки)</div>
                    <div className="overflow-auto border rounded-md max-h-40 sm:max-h-48">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {previewColumns.map((col) => (
                              <TableHead key={col} className="whitespace-nowrap">
                                {col}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewRows.map((row, idx) => (
                            <TableRow key={idx}>
                              {previewColumns.map((col) => (
                                <TableCell key={col} className="max-w-[100px] sm:max-w-[200px] truncate">
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
                {previewRows.length > 0 && previewColumns.length === 0 && (
                  <p className="text-xs text-muted-foreground">Выберите колонки для предпросмотра.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {importCsv.isPending && (
          <div className="pt-2">
            <Progress value={progressValue} />
          </div>
        )}

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Отмена
          </Button>
          <Button onClick={handleImport} disabled={!canImport} className="w-full sm:w-auto">
            {importCsv.isPending ? 'Импорт...' : 'Подтвердить импорт'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
