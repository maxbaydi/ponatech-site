'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth/auth-context';
import { useUpdateUser, useUpdateUserPassword, useUser } from '@/lib/hooks/use-users';
import type { UserRole } from '@/lib/api/types';
import { UserFormFields, type UserBaseFields } from '../../components/user-form-fields';
import { ROLES, USER_COMPANY_MIN_LENGTH, USER_NAME_MIN_LENGTH, USER_PASSWORD_MIN_LENGTH, USER_PHONE_MIN_LENGTH } from '../../users.constants';

const ROLE_VALUES = ROLES as [UserRole, ...UserRole[]];
const DEFAULT_ROLE: UserRole = 'CUSTOMER';
const PAGE_TITLE = 'Редактирование пользователя';
const PAGE_SUBTITLE = 'Изменение данных пользователя';
const CARD_TITLE = 'Основные данные';
const PASSWORD_CARD_TITLE = 'Смена пароля';
const BACK_LABEL = 'Назад к списку';
const CANCEL_LABEL = 'Отмена';
const SUBMIT_LABEL = 'Сохранить изменения';
const PASSWORD_SUBMIT_LABEL = 'Обновить пароль';
const PASSWORD_LABEL = 'Новый пароль';
const PASSWORD_PLACEHOLDER = 'Введите новый пароль';
const UPDATE_ERROR_MESSAGE = 'Ошибка при обновлении пользователя';
const PASSWORD_ERROR_MESSAGE = 'Ошибка при обновлении пароля';
const USER_NOT_FOUND_MESSAGE = 'Пользователь не найден';
const EMAIL_INVALID_MESSAGE = 'Введите корректный email';
const PASSWORD_MIN_MESSAGE = `Введите пароль (минимум ${USER_PASSWORD_MIN_LENGTH} символов)`;
const NAME_MIN_MESSAGE = 'Введите имя';
const PHONE_MIN_MESSAGE = 'Введите телефон';
const COMPANY_MIN_MESSAGE = 'Введите компанию';

const updateUserSchema = z.object({
  email: z.string().email(EMAIL_INVALID_MESSAGE),
  role: z.enum(ROLE_VALUES),
  name: z.string().min(USER_NAME_MIN_LENGTH, NAME_MIN_MESSAGE).optional().or(z.literal('')),
  phone: z.string().min(USER_PHONE_MIN_LENGTH, PHONE_MIN_MESSAGE).optional().or(z.literal('')),
  company: z.string().min(USER_COMPANY_MIN_LENGTH, COMPANY_MIN_MESSAGE).optional().or(z.literal('')),
  isActive: z.boolean(),
});

const passwordSchema = z.object({
  password: z.string().min(USER_PASSWORD_MIN_LENGTH, PASSWORD_MIN_MESSAGE),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const DEFAULT_VALUES: UpdateUserFormValues = {
  email: '',
  role: DEFAULT_ROLE,
  name: '',
  phone: '',
  company: '',
  isActive: true,
};

const DEFAULT_PASSWORD_VALUES: PasswordFormValues = {
  password: '',
};

export default function EditUserPage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();
  const updatePassword = useUpdateUserPassword();
  const prevUserId = useRef<string | null>(null);

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: DEFAULT_PASSWORD_VALUES,
  });

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAdmin, router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const nextValues: UpdateUserFormValues = {
      email: user.email,
      role: user.role,
      name: user.name ?? '',
      phone: user.phone ?? '',
      company: user.company ?? '',
      isActive: user.isActive,
    };

    const isSameUser = prevUserId.current === userId;

    if (!isSameUser) {
      prevUserId.current = userId;
      form.reset(nextValues);
      return;
    }

    if (!form.formState.isDirty) {
      form.reset(nextValues);
    }
  }, [form, user, userId, form.formState.isDirty]);

  const onSubmit = async (data: UpdateUserFormValues) => {
    try {
      await updateUser.mutateAsync({
        userId,
        data: {
          email: data.email,
          role: data.role,
          name: data.name ?? '',
          phone: data.phone ?? '',
          company: data.company ?? '',
          isActive: data.isActive,
        },
      });
      router.push('/admin/users');
    } catch {
      alert(UPDATE_ERROR_MESSAGE);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await updatePassword.mutateAsync({ userId, data });
      passwordForm.reset(DEFAULT_PASSWORD_VALUES);
    } catch {
      alert(PASSWORD_ERROR_MESSAGE);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {BACK_LABEL}
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">{USER_NOT_FOUND_MESSAGE}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {BACK_LABEL}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{PAGE_TITLE}</h1>
        <p className="text-muted-foreground">{PAGE_SUBTITLE}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{CARD_TITLE}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <UserFormFields form={form as unknown as UseFormReturn<UserBaseFields>} />
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
                  <Button variant="outline" type="button" asChild className="w-full sm:w-auto">
                    <Link href="/admin/users">{CANCEL_LABEL}</Link>
                  </Button>
                  <Button type="submit" disabled={updateUser.isPending} className="w-full sm:w-auto">
                    {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {SUBMIT_LABEL}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{PASSWORD_CARD_TITLE}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{PASSWORD_LABEL}</FormLabel>
                      <FormControl>
                        <Input placeholder={PASSWORD_PLACEHOLDER} type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
                  <Button type="submit" disabled={updatePassword.isPending} className="w-full sm:w-auto">
                    {updatePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {PASSWORD_SUBMIT_LABEL}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
