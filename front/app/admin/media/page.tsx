'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Search,
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Copy,
  Check,
  Download,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  useMediaFiles,
  useUploadMedia,
  useDeleteMediaFile,
  useDeleteMediaFilesBatch,
  useDownloadMediaFilesBatch,
} from '@/lib/hooks/use-media';
import type { MediaFile } from '@/lib/api/types';

const ITEMS_PER_PAGE = 24;

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const downloadFile = async (url: string, filename: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

const downloadBlob = (blob: Blob, filename: string) => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

export default function MediaLibraryPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useMediaFiles({ search: search || undefined, page, limit: ITEMS_PER_PAGE });
  const uploadMedia = useUploadMedia();
  const deleteMediaFile = useDeleteMediaFile();
  const deleteMediaFilesBatch = useDeleteMediaFilesBatch();
  const downloadMediaFilesBatch = useDownloadMediaFilesBatch();

  const files = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;

  const isSelectionMode = selectedIds.size > 0;
  const allSelected = files.length > 0 && files.every((file) => selectedIds.has(file.id));
  const someSelected = files.some((file) => selectedIds.has(file.id)) && !allSelected;

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles?.length) return;

    for (const file of Array.from(selectedFiles)) {
      await uploadMedia.mutateAsync({ file });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadMedia]);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Удалить этот файл?')) {
      await deleteMediaFile.mutateAsync(id);
      setSelectedFile(null);
    }
  }, [deleteMediaFile]);

  const handleDeleteBatch = useCallback(async () => {
    const count = selectedIds.size;
    if (confirm(`Удалить ${count} ${count === 1 ? 'файл' : count < 5 ? 'файла' : 'файлов'}?`)) {
      const result = await deleteMediaFilesBatch.mutateAsync(Array.from(selectedIds));
      const failedIds = result.failedIds ?? [];
      setSelectedIds(new Set(failedIds));
    }
  }, [deleteMediaFilesBatch, selectedIds]);

  const handleDownloadBatch = useCallback(async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadMediaFilesBatch.mutateAsync(Array.from(selectedIds));
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      downloadBlob(blob, `media-files-${timestamp}.zip`);
    } finally {
      setIsDownloading(false);
    }
  }, [downloadMediaFilesBatch, selectedIds]);

  const handleCopyUrl = useCallback(async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles?.length) return;

    for (const file of Array.from(droppedFiles)) {
      if (file.type.startsWith('image/')) {
        await uploadMedia.mutateAsync({ file });
      }
    }
  }, [uploadMedia]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const toggleFileSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(files.map((f) => f.id)));
    }
  }, [allSelected, files]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const paginationNumbers = useMemo(() => {
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
      if (totalPages <= 5) return i + 1;
      if (page <= 3) return i + 1;
      if (page >= totalPages - 2) return totalPages - 4 + i;
      return page - 2 + i;
    });
  }, [page, totalPages]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Медиабиблиотека</h1>
          <p className="text-muted-foreground">Управление изображениями и файлами</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMedia.isPending}>
            {uploadMedia.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Загрузить
          </Button>
        </div>
      </div>

      {isSelectionMode && (
        <div className="mb-4 flex flex-wrap items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            Выбрано: {selectedIds.size}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadBatch}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Скачать
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteBatch}
              disabled={deleteMediaFilesBatch.isPending}
            >
              {deleteMediaFilesBatch.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Удалить
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="mr-2 h-4 w-4" />
              Отменить
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              {files.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleSelectAll}
                  title={allSelected ? 'Снять выбор' : 'Выбрать все'}
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : someSelected ? (
                    <CheckSquare className="h-4 w-4 opacity-50" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </Button>
              )}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск файлов..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            {data?.total !== undefined && (
              <div className="text-sm text-muted-foreground sm:ml-auto">Всего: {data.total}</div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : files.length > 0 ? (
            <>
              <div
                className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {files.map((file) => {
                  const isSelected = selectedIds.has(file.id);
                  return (
                    <div key={file.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelectionMode) {
                            toggleFileSelection(file.id);
                          } else {
                            setSelectedFile(file);
                          }
                        }}
                        className={`relative w-full aspect-square rounded-lg overflow-hidden border bg-muted hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        <img
                          src={file.url}
                          alt={file.alt || file.originalName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <span className="text-white text-xs px-2 text-center truncate max-w-full">
                            {file.originalName}
                          </span>
                        </div>
                      </button>
                      <div
                        className={`absolute top-2 left-2 z-10 transition-opacity ${
                          isSelectionMode || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white/90 border-gray-400 shadow-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent className="flex-wrap justify-center">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => Math.max(1, p - 1));
                          }}
                          aria-disabled={page <= 1}
                          className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}
                        />
                      </PaginationItem>
                      {paginationNumbers.map((pageNum) => (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(pageNum);
                            }}
                            isActive={pageNum === page}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => Math.min(totalPages, p + 1));
                          }}
                          aria-disabled={page >= totalPages}
                          className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <ImageIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-2">Нет загруженных файлов</p>
              <p className="text-sm text-muted-foreground mb-4">
                Перетащите файлы сюда или нажмите кнопку "Загрузить"
              </p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Выбрать файлы
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Информация о файле</DialogTitle>
          </DialogHeader>

          {selectedFile && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={selectedFile.url}
                  alt={selectedFile.alt || selectedFile.originalName}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Имя файла</div>
                  <div className="font-medium truncate">{selectedFile.originalName}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Размер</div>
                  <div className="font-medium">{formatFileSize(selectedFile.size)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Тип</div>
                  <div className="font-medium">{selectedFile.mimeType}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Размеры</div>
                  <div className="font-medium">
                    {selectedFile.width && selectedFile.height
                      ? `${selectedFile.width} × ${selectedFile.height}`
                      : '-'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Input value={selectedFile.url} readOnly className="flex-1 text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyUrl(selectedFile.url)}
                >
                  {copiedUrl ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => selectedFile && downloadFile(selectedFile.url, selectedFile.originalName)}
            >
              <Download className="mr-2 h-4 w-4" />
              Скачать
            </Button>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setSelectedFile(null)}>
                Закрыть
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedFile && handleDelete(selectedFile.id)}
                disabled={deleteMediaFile.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
