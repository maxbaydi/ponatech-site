'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle2, Package, Shield, Truck, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiClient } from '@/lib/api/client';

const MIN_PHONE_LENGTH = 10;
const MIN_DESCRIPTION_LENGTH = 10;

const requestSchema = z.object({
  name: z.string().min(2, 'Введите ваше имя'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().min(MIN_PHONE_LENGTH, 'Введите корректный номер телефона'),
  company: z.string().optional(),
  description: z.string().min(MIN_DESCRIPTION_LENGTH, 'Опишите ваш запрос (минимум 10 символов)'),
});

type RequestFormData = z.infer<typeof requestSchema>;

const FEATURES = [
  {
    icon: Package,
    title: 'Быстрый расчёт',
    description: 'Получите коммерческое предложение в течение 24 часов',
  },
  {
    icon: Shield,
    title: 'Гарантия качества',
    description: 'Предгрузочная проверка каждого заказа',
  },
  {
    icon: Truck,
    title: 'Доставка',
    description: 'Организуем доставку до вашего склада',
  },
];

function RequestForm() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const productFromUrl = searchParams.get('product') || '';
  const skuFromUrl = searchParams.get('sku') || '';
  const brandFromUrl = searchParams.get('brand') || '';

  const prefilledDescription = useMemo(() => {
    const product = productFromUrl.trim();
    const sku = skuFromUrl.trim();
    const brand = brandFromUrl.trim();

    if (product) {
      return `Товар: ${product}${sku ? ` (SKU: ${sku})` : ''}\n\nЗапрос:\n`;
    }

    if (brand) {
      return `Бренд: ${brand}\n\nЗапрос:\n`;
    }

    return '';
  }, [brandFromUrl, productFromUrl, skuFromUrl]);

  const initialValues: RequestFormData = {
    name: '',
    email: '',
    phone: '',
    company: '',
    description: prefilledDescription,
  };

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      await apiClient.createSupplyRequest(data);
      setSubmitSuccess('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
      form.reset(initialValues);
    } catch (err: unknown) {
      const apiErr = err as { message?: string; fieldErrors?: Record<string, string> } | null;
      const message = apiErr?.message || 'Не удалось отправить заявку. Попробуйте ещё раз.';
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
      if (fieldErrors?.description) {
        form.setError('description', { message: fieldErrors.description });
      }
    } finally {
      setIsSubmitting(false);
    }
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Отправить заявку
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
      <main className="flex-1 py-8 lg:py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Оставить заявку</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Заполните форму заявки на поставку оборудования. Наши специалисты свяжутся с вами в 
              течение 24 часов для уточнения деталей и расчёта стоимости.
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
