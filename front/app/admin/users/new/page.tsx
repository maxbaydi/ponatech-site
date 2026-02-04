'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/auth-context';
import { useCreateUser } from '@/lib/hooks/use-users';
import type { UserRole } from '@/lib/api/types';
import { UserFormFields, type UserBaseFields } from '../components/user-form-fields';
import { ROLES, USER_COMPANY_MIN_LENGTH, USER_NAME_MIN_LENGTH, USER_PASSWORD_MIN_LENGTH, USER_PHONE_MIN_LENGTH } from '../users.constants';

const ROLE_VALUES = ROLES as [UserRole, ...UserRole[]];
const DEFAULT_ROLE: UserRole = 'CUSTOMER';
const PAGE_TITLE = 'Новый пользователь';
const PAGE_SUBTITLE = 'Добавление нового пользователя';
const CARD_TITLE = 'Данные пользователя';
const BACK_LABEL = 'Назад к списку';
const CANCEL_LABEL = 'Отмена';
const SUBMIT_LABEL = 'Создать пользователя';
const PASSWORD_LABEL = 'Пароль *';
const PASSWORD_PLACEHOLDER = 'Введите пароль';
const CREATE_ERROR_MESSAGE = 'Ошибка при создании пользователя';
const EMAIL_INVALID_MESSAGE = 'Введите корректный email';
const PASSWORD_MIN_MESSAGE = `Введите пароль (минимум ${USER_PASSWORD_MIN_LENGTH} символов)`;
const NAME_MIN_MESSAGE = 'Введите имя';
const PHONE_MIN_MESSAGE = 'Введите телефон';
const COMPANY_MIN_MESSAGE = 'Введите компанию';

const createUserSchema = z.object({
  email: z.string().email(EMAIL_INVALID_MESSAGE),
  password: z.string().min(USER_PASSWORD_MIN_LENGTH, PASSWORD_MIN_MESSAGE),
  role: z.enum(ROLE_VALUES),
  name: z.string().min(USER_NAME_MIN_LENGTH, NAME_MIN_MESSAGE).optional().or(z.literal('')),
  phone: z.string().min(USER_PHONE_MIN_LENGTH, PHONE_MIN_MESSAGE).optional().or(z.literal('')),
  company: z.string().min(USER_COMPANY_MIN_LENGTH, COMPANY_MIN_MESSAGE).optional().or(z.literal('')),
  isActive: z.boolean(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const DEFAULT_VALUES: CreateUserFormValues = {
  email: '',
  password: '',
  role: DEFAULT_ROLE,
  name: '',
  phone: '',
  company: '',
  isActive: true,
};

export default function NewUserPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const createUser = useCreateUser();

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAdmin, router]);

  const onSubmit = async (data: CreateUserFormValues) => {
    try {
      await createUser.mutateAsync({
        email: data.email,
        password: data.password,
        role: data.role,
        name: data.name || undefined,
        phone: data.phone || undefined,
        company: data.company || undefined,
        isActive: data.isActive,
      });
      router.push('/admin/users');
    } catch {
      alert(CREATE_ERROR_MESSAGE);
    }
  };

  if (!isAdmin) {
    return null;
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

      <Card>
        <CardHeader>
          <CardTitle>{CARD_TITLE}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <UserFormFields form={form as unknown as UseFormReturn<UserBaseFields>} />
              <FormField
                control={form.control}
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
                <Button variant="outline" type="button" asChild className="w-full sm:w-auto">
                  <Link href="/admin/users">{CANCEL_LABEL}</Link>
                </Button>
                <Button type="submit" disabled={createUser.isPending} className="w-full sm:w-auto">
                  {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {SUBMIT_LABEL}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
