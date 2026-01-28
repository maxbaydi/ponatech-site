'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/lib/auth/auth-context';
import { buildAuthRedirectHref, resolveNextPath } from '@/lib/auth/login-redirect';
import { clearGuestRequest, getGuestRequest, isGuestRequestEmailMatch } from '@/lib/requests/guest-request';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageFallback() {
  return (
    <div className="space-y-4">
      <div className="space-y-2 text-center">
        <Skeleton className="h-6 w-40 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestRequest] = useState(() => getGuestRequest());

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const nextPath = useMemo(
    () => resolveNextPath(searchParams.get('next')),
    [searchParams]
  );

  const registerHref = useMemo(
    () => buildAuthRedirectHref('/register', nextPath),
    [nextPath]
  );

  useEffect(() => {
    if (!guestRequest) return;
    const current = form.getValues('email');
    if (current) return;
    form.setValue('email', guestRequest.email, { shouldDirty: false });
  }, [form, guestRequest]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    try {
      await login({ email: data.email, password: data.password });
      if (guestRequest && isGuestRequestEmailMatch(guestRequest, data.email)) {
        clearGuestRequest();
      }
      router.push(nextPath ?? '/profile');
    } catch (err: unknown) {
      const apiErr = err as { message?: string; fieldErrors?: Record<string, string> } | null;
      const message = apiErr?.message || 'Не удалось выполнить вход. Попробуйте ещё раз.';
      setError(message);

      const fieldErrors = apiErr?.fieldErrors;
      if (fieldErrors?.email) {
        form.setError('email', { message: fieldErrors.email });
      }
      if (fieldErrors?.password) {
        form.setError('password', { message: fieldErrors.password });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const emailValue = form.watch('email');
  const showEmailMismatch =
    !!guestRequest && !!emailValue && !isGuestRequestEmailMatch(guestRequest, emailValue);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Вход в аккаунт</h1>
        <p className="text-muted-foreground">Введите данные для входа в систему</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}
      {guestRequest && (
        <div className="mb-4 p-3 rounded-lg bg-muted text-muted-foreground text-sm">
          Для доступа к чату и истории заявок используйте email: <span className="font-medium">{guestRequest.email}</span>
        </div>
      )}
      {showEmailMismatch && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          Введённый email отличается от email в заявке. История и чат могут быть недоступны.
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm font-normal cursor-pointer">Запомнить меня</FormLabel>
                </FormItem>
              )}
            />
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Забыли пароль?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Войти
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Нет аккаунта?{' '}
        <Link href={registerHref} className="text-primary hover:underline font-medium">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
