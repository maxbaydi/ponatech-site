'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, type LucideIcon } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SITE_CONTACTS } from '@/lib/site-contacts';
import { cn } from '@/lib/utils';

const contactSchema = z.object({
  name: z.string().min(2, 'Введите ваше имя'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов'),
});

type ContactFormData = z.infer<typeof contactSchema>;

type ContactItem = {
  icon: LucideIcon;
  title: string;
  value: string | string[];
  href: string | null;
  className?: string;
};

const CONTACTS: ContactItem[] = [
  {
    icon: Phone,
    title: 'Telegram',
    value: SITE_CONTACTS.phones.telegram.display,
    href: `tel:${SITE_CONTACTS.phones.telegram.tel}`,
  },
  {
    icon: Phone,
    title: 'Офис',
    value: SITE_CONTACTS.phones.office.display,
    href: `tel:${SITE_CONTACTS.phones.office.tel}`,
  },
  {
    icon: Mail,
    title: 'Email',
    value: SITE_CONTACTS.email.display,
    href: SITE_CONTACTS.email.mailto,
    className: 'sm:col-span-2',
  },
  {
    icon: MapPin,
    title: 'Адрес',
    value: [...SITE_CONTACTS.address.lines],
    href: null,
    className: 'sm:col-span-2',
  },
];

export default function ContactsPage() {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    alert('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
    form.reset();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 sm:py-8 lg:py-16">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Контакты</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Свяжитесь с нами для обсуждения вашего проекта. Наши специалисты помогут подобрать 
              оптимальное решение и рассчитают стоимость поставки.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {CONTACTS.map((contact) => (
                  <Card key={contact.title} className={cn("card-hover", contact.className)}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <contact.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{contact.title}</p>
                        {contact.href ? (
                          <a
                            href={contact.href}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {Array.isArray(contact.value) ? (
                              <span className="flex flex-col">
                                {contact.value.map((line) => (
                                  <span key={line}>{line}</span>
                                ))}
                              </span>
                            ) : (
                              contact.value
                            )}
                          </a>
                        ) : (
                          <p className="font-medium">
                            {Array.isArray(contact.value) ? (
                              <span className="flex flex-col">
                                {contact.value.map((line) => (
                                  <span key={line}>{line}</span>
                                ))}
                              </span>
                            ) : (
                              contact.value
                            )}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-primary text-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Почему выбирают нас</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">1</span>
                      </div>
                      <span className="text-white/90">Прямые закупки от 70+ мировых производителей</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">2</span>
                      </div>
                      <span className="text-white/90">Предгрузочная проверка на нашем складе в Китае</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">3</span>
                      </div>
                      <span className="text-white/90">Партнёрские цены и оптимальные сроки поставки</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Напишите нам</CardTitle>
              </CardHeader>
              <CardContent>
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
                              <Input
                                type="email"
                                placeholder="email@example.com"
                                autoComplete="off"
                                inputMode="email"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                {...field}
                              />
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
                            <FormLabel>Телефон</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+7 (___) ___-__-__"
                                autoComplete="off"
                                inputMode="tel"
                                {...field}
                              />
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
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Сообщение *</FormLabel>
                          <FormControl>
                              <Textarea
                                placeholder="Опишите ваш запрос…"
                                className="min-h-[120px]"
                                {...field}
                              />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" size="lg">
                      <Send className="mr-2 h-4 w-4" />
                      Отправить сообщение
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
