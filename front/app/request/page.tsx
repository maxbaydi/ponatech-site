'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle2, Package, Shield, Truck, Loader2, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import { buildCartDescription, useCartStore } from '@/lib/cart';
import { formatFileSize } from '@/lib/utils';
import {
  REQUEST_ATTACHMENT_ACCEPT,
  REQUEST_ATTACHMENT_MAX_FILES,
  REQUEST_ATTACHMENT_MAX_SIZE,
  getRequestAttachmentIssue,
  getRequestAttachmentKey,
  isRequestAttachmentImage,
} from '@/lib/requests/request-attachments';

const MIN_PHONE_LENGTH = 10;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_FILE_SIZE_MB = Math.round(REQUEST_ATTACHMENT_MAX_SIZE / 1024 / 1024);
const ATTACHMENTS_LABEL = 'Файлы';
const ATTACHMENTS_HELPER_SHORT = 'JPG, PNG, PDF, DOC, XLS и другие';
const ATTACHMENTS_HELPER_FULL =
  'JPG, PNG, WEBP, GIF, PDF, DOC, DOCX, XLS, XLSX, XLSM, XLSB, CSV, TXT, RTF, ODT, ODS, ODP, PPT, PPTX';
const ATTACHMENTS_LIMITS = `До ${REQUEST_ATTACHMENT_MAX_FILES} файлов, до ${MAX_FILE_SIZE_MB} МБ каждый`;
const ATTACHMENTS_BUTTON_LABEL = 'Добавить файлы';
const ATTACHMENTS_EMPTY_LABEL = 'Файлы не добавлены';
const REMOVE_ATTACHMENT_LABEL = 'Удалить файл';
const SUBMIT_BUTTON_LABEL = 'Отправить заявку';
const SUBMITTING_LABEL = 'Отправляем заявку...';
const SUBMITTING_FILES_LABEL = 'Загрузка файлов...';

const countPhoneDigits = (value: string): number => value.replace(/\D/g, '').length;

const requestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Укажите имя, чтобы мы знали, как к вам обращаться'),
  email: z
    .string()
    .trim()
    .email('Укажите корректный email, чтобы мы могли ответить'),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => countPhoneDigits(value) >= MIN_PHONE_LENGTH,
      'Укажите корректный номер телефона для связи',
    ),
  company: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || value.length >= 2, 'Название компании слишком короткое')
    .optional(),
  description: z
    .string()
    .trim()
    .min(MIN_DESCRIPTION_LENGTH, 'Опишите запрос, чтобы мы быстрее подготовили предложение'),
});

type RequestFormData = z.infer<typeof requestSchema>;

const FEATURES = [
  {
    icon: Package,
    title: 'Быстрый расчёт',
    description: 'Коммерческое предложение от 24 часов в зависимости от сложности запроса',
  },
  {
    icon: Shield,
    title: 'Гарантия качества',
    description: 'Предгрузочная проверка каждого заказа с фото- и видеоотчётом',
  },
  {
    icon: Truck,
    title: 'Доставка',
    description: 'Организуем доставку до вашего склада',
  },
];

function RequestForm() {
  const searchParams = useSearchParams();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentsError, setAttachmentsError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productFromUrl = searchParams.get('product') || '';
  const skuFromUrl = searchParams.get('sku') || '';
  const brandFromUrl = searchParams.get('brand') || '';

  const prefilledDescription = useMemo(() => {
    const product = productFromUrl.trim();
    const sku = skuFromUrl.trim();
    const brand = brandFromUrl.trim();
    const cartBlock = buildCartDescription(cartItems);
    const blocks: string[] = [];

    if (cartBlock) {
      blocks.push(cartBlock);
    }

    if (product) {
      blocks.push(`Товар: ${product}${sku ? ` (SKU: ${sku})` : ''}`);
    } else if (brand) {
      blocks.push(`Бренд: ${brand}`);
    }

    if (blocks.length === 0) {
      return '';
    }

    return `${blocks.join('\n\n')}\n\nЗапрос:\n`;
  }, [brandFromUrl, cartItems, productFromUrl, skuFromUrl]);

  const initialValues: RequestFormData = useMemo(
    () => ({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      company: user?.company ?? '',
      description: prefilledDescription,
    }),
    [prefilledDescription, user?.company, user?.email, user?.name, user?.phone],
  );

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: initialValues,
  });

  const isDescriptionDirty = form.formState.dirtyFields.description;

  useEffect(() => {
    if (!isDescriptionDirty) {
      form.setValue('description', prefilledDescription, { shouldDirty: false });
    }
  }, [prefilledDescription, form, isDescriptionDirty]);

  useEffect(() => {
    if (!user) return;

    const fields: Array<keyof RequestFormData> = ['name', 'email', 'phone', 'company'];
    fields.forEach((field) => {
      if (form.formState.dirtyFields[field]) {
        return;
      }

      const currentValue = form.getValues(field);
      const nextValue =
        field === 'name'
          ? user.name ?? ''
          : field === 'email'
            ? user.email ?? ''
            : field === 'phone'
              ? user.phone ?? ''
              : user.company ?? '';

      if (!currentValue && nextValue) {
        form.setValue(field, nextValue, { shouldDirty: false });
      }
    });
  }, [form, user]);

  const buildAttachmentError = useCallback(
    (file: File, issue: 'empty' | 'too_large' | 'unsupported') => {
      if (issue === 'empty') {
        return `Файл "${file.name}" пустой.`;
      }
      if (issue === 'too_large') {
        return `Файл "${file.name}" больше ${MAX_FILE_SIZE_MB} МБ.`;
      }
      return `Файл "${file.name}" не подходит по формату.`;
    },
    [],
  );

  const handleAttachmentSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files ?? []);
      if (selectedFiles.length === 0) return;

      const existingKeys = new Set(attachments.map(getRequestAttachmentKey));
      const nextFiles: File[] = [];
      const errors: string[] = [];
      let remainingSlots = REQUEST_ATTACHMENT_MAX_FILES - attachments.length;

      for (const file of selectedFiles) {
        if (remainingSlots <= 0) {
          errors.push(`Можно прикрепить не более ${REQUEST_ATTACHMENT_MAX_FILES} файлов.`);
          break;
        }

        const key = getRequestAttachmentKey(file);
        if (existingKeys.has(key)) {
          continue;
        }

        const issue = getRequestAttachmentIssue(file);
        if (issue) {
          errors.push(buildAttachmentError(file, issue));
          continue;
        }

        nextFiles.push(file);
        existingKeys.add(key);
        remainingSlots -= 1;
      }

      if (nextFiles.length > 0) {
        setAttachments((prev) => [...prev, ...nextFiles]);
      }

      setAttachmentsError(errors.length > 0 ? errors.join('\n') : '');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [attachments, buildAttachmentError],
  );

  const handleAttachmentRemove = useCallback((fileKey: string) => {
    setAttachments((prev) => prev.filter((file) => getRequestAttachmentKey(file) !== fileKey));
    setAttachmentsError('');
  }, []);

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      if (attachments.length > 0) {
        await apiClient.createSupplyRequestWithAttachments(data, attachments);
      } else {
        await apiClient.createSupplyRequest(data);
      }
      await clearCart();
      setSubmitSuccess('Спасибо! Заявка получена. Мы свяжемся с вами как только запрос будет обработан.');
      form.reset(initialValues);
      setAttachments([]);
      setAttachmentsError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string; fieldErrors?: Record<string, string> } | null;
      const message =
        apiErr?.message || 'Не получилось отправить заявку. Попробуйте ещё раз или напишите нам.';
      setSubmitError(message);

      const fieldErrors = apiErr?.fieldErrors;
      if (fieldErrors?.name) {
        form.setError('name', { message: fieldErrors.name });
      }
      if (fieldErrors?.email) {
        form.setError('email', { message: fieldErrors.email });
      }
      if (fieldErrors?.phone) {
        form.setError('phone', { message: fieldErrors.phone });
      }
      if (fieldErrors?.company) {
        form.setError('company', { message: fieldErrors.company });
      }
      if (fieldErrors?.description) {
        form.setError('description', { message: fieldErrors.description });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = () => {
    setSubmitSuccess('');
    setSubmitError('Похоже, форма заполнена не полностью. Проверьте поля, отмеченные красным.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Заявка на поставку</CardTitle>
        <CardDescription>Заполните форму, и мы подготовим коммерческое предложение</CardDescription>
      </CardHeader>
      <CardContent>
        {submitError && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{submitError}</div>
        )}
        {submitSuccess && (
          <div className="mb-4 rounded-lg bg-secondary/10 p-3 text-sm text-secondary">{submitSuccess}</div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ваше имя" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Телефон *</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+7 (___) ___-__-__" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Компания</FormLabel>
                    <FormControl>
                      <Input placeholder="Название компании" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ваш запрос *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Впишите список товаров/брендов/SKU и количество, требования, сроки, особенности доставки..."
                      className="min-h-[160px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>{ATTACHMENTS_LABEL}</FormLabel>
              <div className="rounded-lg border border-dashed p-4">
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={REQUEST_ATTACHMENT_ACCEPT}
                  onChange={handleAttachmentSelect}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-xs text-muted-foreground cursor-help underline decoration-dotted underline-offset-2">
                            {ATTACHMENTS_HELPER_SHORT}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          {ATTACHMENTS_HELPER_FULL}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-xs text-muted-foreground">{ATTACHMENTS_LIMITS}</div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    {ATTACHMENTS_BUTTON_LABEL}
                  </Button>
                </div>
              </div>

              {attachmentsError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive whitespace-pre-wrap">
                  {attachmentsError}
                </div>
              )}

              {attachments.length === 0 ? (
                <div className="text-xs text-muted-foreground">{ATTACHMENTS_EMPTY_LABEL}</div>
              ) : (
                <div className="space-y-2">
                  {attachments.map((file) => {
                    const isImage = isRequestAttachmentImage(file.type);
                    const fileKey = getRequestAttachmentKey(file);

                    return (
                      <div key={fileKey} className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                          {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{file.name}</div>
                          <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAttachmentRemove(fileKey)}
                          aria-label={REMOVE_ATTACHMENT_LABEL}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              {isSubmitting && attachments.length > 0 && (
                <p className="text-xs text-muted-foreground" aria-live="polite">
                  {SUBMITTING_FILES_LABEL}
                </p>
              )}

              <p className="text-xs text-muted-foreground/70">
                Если требуется прикрепить видео или большие файлы, воспользуйтесь облачным хранилищем и прикрепите ссылку на ваш файл к запросу.
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? SUBMITTING_LABEL : SUBMIT_BUTTON_LABEL}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function RequestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 sm:py-8 lg:py-16">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Оставить заявку</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Заполните форму заявки на поставку оборудования. Наши специалисты свяжутся с вами 
              от 24 часов в рабочее время для уточнения деталей и расчёта стоимости.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <Suspense fallback={<div>Загрузка...</div>}>
                <RequestForm />
              </Suspense>
            </div>

            <div className="space-y-6">
              <Card className="bg-muted/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    Что входит в заявку
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Расчёт стоимости оборудования</li>
                    <li>• Проверка наличия и сроков</li>
                    <li>• Варианты доставки и логистики</li>
                    <li>• Документальное сопровождение</li>
                    <li>• Предгрузочная инспекция</li>
                  </ul>
                </CardContent>
              </Card>

              {FEATURES.map((feature) => (
                <Card key={feature.title} className="card-hover">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
