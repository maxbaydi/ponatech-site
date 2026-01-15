'use client';

import { useCallback, useRef, useState } from 'react';
import { Search, Upload, Image as ImageIcon, Loader2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaFiles, useUploadMedia } from '@/lib/hooks/use-media';
import type { MediaFile } from '@/lib/api/types';

interface MediaLibraryPickerProps {
  value?: MediaFile | null;
  onChange: (file: MediaFile | null) => void;
  trigger?: React.ReactNode;
}

const ITEMS_PER_PAGE = 24;

export function MediaLibraryPicker({ value, onChange, trigger }: MediaLibraryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MediaFile | null>(value ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useMediaFiles({ search: search || undefined, limit: ITEMS_PER_PAGE });
  const uploadMedia = useUploadMedia();

  const files = data?.data ?? [];

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      const uploaded = await uploadMedia.mutateAsync({ file: selectedFile });
      setSelected(uploaded);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [uploadMedia]
  );

  const handleConfirm = useCallback(() => {
    onChange(selected);
    setOpen(false);
  }, [selected, onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setSelected(null);
  }, [onChange]);

  const defaultTrigger = (
    <button
      type="button"
      className="relative w-full max-w-[10rem] sm:max-w-[12rem] aspect-square border-2 border-dashed rounded-lg overflow-hidden bg-muted hover:bg-muted/80 transition-colors flex flex-col items-center justify-center gap-2"
    >
      {value ? (
        <>
          <img
            src={value.url}
            alt={value.alt || value.originalName}
            className="absolute inset-0 w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm">Изменить</span>
          </div>
        </>
      ) : (
        <>
          <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground">Выбрать</span>
        </>
      )}
    </button>
  );

  return (
    <div className="space-y-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
        <DialogContent className="w-full max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Выбор изображения</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMedia.isPending}
            >
              {uploadMedia.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Загрузить
            </Button>
          </div>

          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : files.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {files.map((file) => {
                  const isSelected = selected?.id === file.id;
                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => setSelected(isSelected ? null : file)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      <img
                        src={file.url}
                        alt={file.alt || file.originalName}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                <p>Нет изображений</p>
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleConfirm}>Выбрать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {value && (
        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={handleClear}>
          <X className="mr-1 h-3 w-3" />
          Удалить изображение
        </Button>
      )}
    </div>
  );
}
