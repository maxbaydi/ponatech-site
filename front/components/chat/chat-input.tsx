'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Paperclip, Plus, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'xlsm', 'xlsb',
  'csv', 'txt', 'rtf', 'odt', 'ods', 'odp', 'ppt', 'pptx',
]);

interface ChatInputProps {
  onSend: (content: string, files: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Введите сообщение…',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (disabled) return;
    const trimmedMessage = message.trim();
    if (!trimmedMessage && files.length === 0) return;

    onSend(trimmedMessage, files);
    setMessage('');
    setFiles([]);
    setFileError(null);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const selectedFiles = Array.from(e.target.files ?? []);
    if (selectedFiles.length === 0) return;

    const nextFiles = [...files];
    let nextError: string | null = null;

    for (const file of selectedFiles) {
      if (nextFiles.length >= MAX_FILES) {
        nextError = `Максимум ${MAX_FILES} файлов.`;
        break;
      }

      if (file.size > MAX_FILE_SIZE) {
        nextError = `Файл "${file.name}" больше ${MAX_FILE_SIZE_MB} МБ.`;
        continue;
      }

      if (!isAllowedFile(file)) {
        nextError = `Формат "${file.name}" не поддерживается.`;
        continue;
      }

      nextFiles.push(file);
    }

    setFiles(nextFiles);
    setFileError(nextError);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileError(null);
  };

  return (
    <div className="border-t bg-background p-4">
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-1.5 text-sm animate-in fade-in-0 zoom-in-95 duration-150"
            >
              <span className="truncate chat-attachment-name">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Удалить файл ${file.name}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
      {fileError && (
        <p className="mb-3 text-xs text-destructive animate-in fade-in-0 duration-150" role="status">
          {fileError}
        </p>
      )}

      <form className="flex w-full flex-none items-center gap-2" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
        <div
          className={cn(
            'flex flex-1 items-center gap-2 rounded-md border border-input bg-card px-2 py-1 lg:gap-4',
            'focus-within:ring-1 focus-within:ring-ring focus-within:outline-hidden',
            'transition-shadow duration-150'
          )}
        >
          <div className="space-x-1 flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.xlsm,.xlsb,.csv,.txt,.rtf,.odt,.ods,.odp,.ppt,.pptx"
            />
            <input
              ref={imageInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={handleFileSelect}
              accept="image/*"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 rounded-md"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || files.length >= MAX_FILES}
              aria-label="Добавить файл"
            >
              <Paperclip size={20} className="stroke-muted-foreground" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="hidden h-8 rounded-md lg:inline-flex"
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled || files.length >= MAX_FILES}
              aria-label="Добавить изображение"
            >
              <ImagePlus size={20} className="stroke-muted-foreground" aria-hidden="true" />
            </Button>
          </div>

          <label className="flex-1">
            <span className="sr-only">{placeholder}</span>
            <input
              type="text"
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-disabled={disabled}
              className="h-8 w-full bg-inherit focus-visible:outline-hidden"
              aria-label="Сообщение"
              name="message"
              autoComplete="off"
            />
          </label>

          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            disabled={disabled || (!message.trim() && files.length === 0)}
            aria-label="Отправить сообщение"
          >
            <Send size={20} aria-hidden="true" />
          </Button>
        </div>

        <Button
          type="submit"
          className="h-9 shrink-0 sm:hidden"
          disabled={disabled || (!message.trim() && files.length === 0)}
        >
          <Send size={18} aria-hidden="true" /> Отправить
        </Button>
      </form>
    </div>
  );
}

function isAllowedFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!extension) return false;
  return ALLOWED_EXTENSIONS.has(extension);
}
