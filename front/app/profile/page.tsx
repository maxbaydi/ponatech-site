'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Shield, Key, Loader2, Phone, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/lib/auth/auth-context';
import { isApiError } from '@/lib/api/errors';
import { getProfileTab, PROFILE_TAB_PARAM, type ProfileTab } from '@/lib/requests/profile-navigation';
import { RequestsHistory } from './requests-history';

const ROLE_LABELS: Record<string, { label: string; color: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  CUSTOMER: { label: 'Клиент', color: 'outline' },
  MANAGER: { label: 'Менеджер', color: 'secondary' },
  ADMIN: { label: 'Администратор', color: 'default' },
  SUPER_ADMIN: { label: 'Супер-администратор', color: 'destructive' },
};

const MIN_PHONE_LENGTH = 10;
const PASSWORD_MIN_LENGTH = 8;
const CURRENT_PASSWORD_MESSAGE = 'Введите текущий пароль';
const NEW_PASSWORD_MESSAGE = `Новый пароль должен содержать минимум ${PASSWORD_MIN_LENGTH} символов`;
const PASSWORD_MISMATCH_MESSAGE = 'Пароли не совпадают';
const PASSWORD_ERROR_MESSAGE = 'Не удалось изменить пароль. Попробуйте ещё раз.';

const countPhoneDigits = (value: string): number => value.replace(/\D/g, '').length;

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || value.length >= 2, 'Укажите имя, чтобы мы знали, как к вам обращаться'),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || countPhoneDigits(value) >= MIN_PHONE_LENGTH,
      'Укажите корректный номер телефона для связи',
    ),
  company: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || value.length >= 2, 'Название компании слишком короткое'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(PASSWORD_MIN_LENGTH, CURRENT_PASSWORD_MESSAGE),
    newPassword: z.string().min(PASSWORD_MIN_LENGTH, NEW_PASSWORD_MESSAGE),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: PASSWORD_MISMATCH_MESSAGE,
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get(PROFILE_TAB_PARAM);
  const [activeTab, setActiveTab] = useState<ProfileTab>(() => getProfileTab(tabParam));
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      company: user?.company ?? '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    setActiveTab(getProfileTab(tabParam));
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(getProfileTab(value));
  };

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      name: user.name ?? '',
      phone: user.phone ?? '',
      company: user.company ?? '',
    });
  }, [profileForm, user]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const payload = {
        name: data.name.trim() ? data.name.trim() : null,
        phone: data.phone.trim() ? data.phone.trim() : null,
        company: data.company.trim() ? data.company.trim() : null,
      };
      await updateProfile(payload);
      profileForm.reset({
        name: payload.name ?? '',
        phone: payload.phone ?? '',
        company: payload.company ?? '',
      });
      setProfileSuccess('Готово! Данные сохранены и будут подставляться в заявку.');
    } catch (err: unknown) {
      const apiErr = err as { message?: string; fieldErrors?: Record<string, string> } | null;
      const message = apiErr?.message || 'Не удалось обновить профиль. Попробуйте ещё раз.';
      setProfileError(message);
      setProfileSuccess('');

      const fieldErrors = apiErr?.fieldErrors;
      if (fieldErrors?.name) {
        profileForm.setError('name', { message: fieldErrors.name });
      }
      if (fieldErrors?.phone) {
        profileForm.setError('phone', { message: fieldErrors.phone });
      }
      if (fieldErrors?.company) {
        profileForm.setError('company', { message: fieldErrors.company });
      }
    } finally {
      setIsProfileSaving(false);
    }
  };

  const onProfileInvalid = () => {
    setProfileSuccess('');
    setProfileError('Похоже, есть ошибки в форме. Проверьте поля, отмеченные красным.');
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      setPasswordSuccess('Пароль успешно изменён.');
      passwordForm.reset();
    } catch (err: unknown) {
      const apiErr = isApiError(err) ? err : null;
      const message = apiErr?.message || PASSWORD_ERROR_MESSAGE;
      setPasswordError(message);

      const passwordFieldError = apiErr?.fieldErrors?.password;

      if (passwordFieldError) {
        passwordForm.setError('newPassword', { message: passwordFieldError });
      } else if (apiErr?.status === 400 || apiErr?.status === 401) {
        passwordForm.setError('currentPassword', { message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordInvalid = () => {
    setPasswordSuccess('');
    setPasswordError('Проверьте поля пароля — есть ошибки.');
  };

  if (!user) return null;

  const roleInfo = ROLE_LABELS[user.role] || { label: user.role, color: 'outline' as const };
  const displayName = user.name?.trim() || user.email.split('@')[0];

  return (
    <div className="py-6 sm:py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Профиль</h1>
          <p className="text-muted-foreground">Управление аккаунтом и настройки</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div className="flex flex-col min-h-0 max-h-[524px]">
            <Card className="shrink-0">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                  <h2 className="font-semibold text-lg mb-1">{displayName}</h2>
                  <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                  <Badge variant={roleInfo.color}>{roleInfo.label}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4 flex-1 min-h-0 flex flex-col">
              <CardHeader className="pb-3 shrink-0">
                <CardTitle className="text-base">Информация об аккаунте</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 min-h-0">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Роль</p>
                    <p className="text-sm">{roleInfo.label}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Телефон</p>
                      <p className="text-sm">{user.phone}</p>
                    </div>
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Компания</p>
                      <p className="text-sm">{user.company}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="flex flex-wrap h-auto justify-start">
                <TabsTrigger value="profile" className="w-full sm:w-auto">Профиль</TabsTrigger>
                <TabsTrigger value="security" className="w-full sm:w-auto">Безопасность</TabsTrigger>
                <TabsTrigger value="history" className="w-full sm:w-auto">История заявок</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6 flex-1 min-h-0 flex flex-col">
                <Card>
                  <CardHeader>
                    <CardTitle>Данные профиля</CardTitle>
                    <CardDescription>
                      Заполните контактные данные — они автоматически подставятся в форму запроса.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profileError && (
                      <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        {profileError}
                      </div>
                    )}
                    {profileSuccess && (
                      <div className="mb-4 rounded-lg bg-secondary/10 p-3 text-sm text-secondary">
                        {profileSuccess}
                      </div>
                    )}
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit, onProfileInvalid)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Имя</FormLabel>
                                <FormControl>
                                  <Input placeholder="Иван Иванов" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
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
                        </div>
                        <FormField
                          control={profileForm.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Компания</FormLabel>
                              <FormControl>
                                <Input placeholder="ООО Ромашка" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={isProfileSaving}>
                          {isProfileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Сохранить изменения
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-6 flex-1 min-h-0 flex flex-col">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Смена пароля
                    </CardTitle>
                    <CardDescription>
                      Обновите пароль для защиты вашего аккаунта
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {passwordError && (
                      <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="mb-4 rounded-lg bg-secondary/10 p-3 text-sm text-secondary">
                        {passwordSuccess}
                      </div>
                    )}
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit, onPasswordInvalid)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Текущий пароль</FormLabel>
                              <FormControl>
                                <Input type="password" autoComplete="current-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Новый пароль</FormLabel>
                              <FormControl>
                                <Input type="password" autoComplete="new-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Подтвердите пароль</FormLabel>
                              <FormControl>
                                <Input type="password" autoComplete="new-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Изменить пароль
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6 flex-1 min-h-0 flex flex-col">
                <Card>
                  <CardHeader>
                    <CardTitle>История заявок</CardTitle>
                    <CardDescription>Ваши заявки на поставку оборудования</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RequestsHistory />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
