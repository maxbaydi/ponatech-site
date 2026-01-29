'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/lib/auth/auth-context';
import { isApiError } from '@/lib/api/errors';
import { useSiteSettings, useUpdateSiteSettings } from '@/lib/hooks/use-site-settings';
import { DISPLAY_CURRENCY_OPTIONS, DEFAULT_DISPLAY_CURRENCY } from '@/lib/currency';
import type { DisplayCurrency } from '@/lib/api/types';

const TELEGRAM_HINT_TEXT = 'Напишите боту @get_channel_id_bot — он пришлёт Chat ID для поля выше.';
const TELEGRAM_SAVE_ERROR = 'Не удалось сохранить настройки Telegram. Попробуйте ещё раз.';
const TELEGRAM_CHAT_ID_REQUIRED = 'Укажите Chat ID для включения уведомлений.';
const TELEGRAM_SAVE_SUCCESS = 'Настройки Telegram сохранены.';
const TOKEN_SAVE_ERROR = 'Не удалось обновить токен Telegram.';

export default function SettingsPage() {
  const { user, updateProfile, isSuperAdmin } = useAuth();
  const { data: siteSettings, isLoading: isSettingsLoading } = useSiteSettings();
  const updateSiteSettings = useUpdateSiteSettings();

  const displayCurrency = siteSettings?.displayCurrency ?? DEFAULT_DISPLAY_CURRENCY;
  const botTokenConfigured = siteSettings?.telegramBotTokenSet ?? false;

  const [botToken, setBotToken] = useState('');
  const [botTokenError, setBotTokenError] = useState('');
  const [botTokenSuccess, setBotTokenSuccess] = useState('');

  const [telegramChatId, setTelegramChatId] = useState(user?.telegramChatId ?? '');
  const [telegramEnabled, setTelegramEnabled] = useState(!!user?.telegramNotificationsEnabled);
  const [telegramError, setTelegramError] = useState('');
  const [telegramSuccess, setTelegramSuccess] = useState('');
  const [isTelegramSaving, setIsTelegramSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setTelegramChatId(user.telegramChatId ?? '');
    setTelegramEnabled(!!user.telegramNotificationsEnabled);
  }, [user?.telegramChatId, user?.telegramNotificationsEnabled, user]);

  const handleCurrencyChange = (value: string) => {
    const nextCurrency = value as DisplayCurrency;
    if (nextCurrency === displayCurrency) return;
    updateSiteSettings.mutate({ displayCurrency: nextCurrency });
  };

  const handleBotTokenSave = async () => {
    setBotTokenError('');
    setBotTokenSuccess('');

    try {
      const tokenValue = botToken.trim();
      await updateSiteSettings.mutateAsync({
        telegramBotToken: tokenValue.length > 0 ? tokenValue : null,
      });
      setBotToken('');
      setBotTokenSuccess(tokenValue.length > 0 ? 'Токен сохранён.' : 'Токен очищен.');
    } catch (err) {
      const apiError = isApiError(err) ? err : null;
      setBotTokenError(apiError?.message ?? TOKEN_SAVE_ERROR);
    }
  };

  const handleTelegramSave = async () => {
    setTelegramError('');
    setTelegramSuccess('');

    const normalizedChatId = telegramChatId.trim();
    if (telegramEnabled && normalizedChatId.length === 0) {
      setTelegramError(TELEGRAM_CHAT_ID_REQUIRED);
      return;
    }

    setIsTelegramSaving(true);
    try {
      await updateProfile({
        telegramChatId: normalizedChatId.length > 0 ? normalizedChatId : null,
        telegramNotificationsEnabled: telegramEnabled,
      });
      setTelegramSuccess(TELEGRAM_SAVE_SUCCESS);
    } catch (err) {
      const apiError = isApiError(err) ? err : null;
      setTelegramError(apiError?.message ?? TELEGRAM_SAVE_ERROR);
    } finally {
      setIsTelegramSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">Управление настройками сайта и уведомлениями.</p>
      </div>

      <div className="space-y-6">
        {isSuperAdmin && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Валюта отображения</CardTitle>
                <CardDescription>Выберите валюту, которая отображается на сайте.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Изменение валюты влияет на отображение цен в каталоге и админке.
                </div>
                <div className="w-full sm:w-[220px]">
                  <Select
                    value={displayCurrency}
                    onValueChange={handleCurrencyChange}
                    disabled={isSettingsLoading || updateSiteSettings.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите валюту" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISPLAY_CURRENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {updateSiteSettings.isPending && (
                    <p className="text-xs text-muted-foreground mt-2">Сохраняем...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Telegram бот</CardTitle>
                <CardDescription>Укажите токен бота для отправки уведомлений.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {botTokenError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {botTokenError}
                  </div>
                )}
                {botTokenSuccess && (
                  <div className="rounded-lg bg-secondary/10 p-3 text-sm text-secondary">
                    {botTokenSuccess}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="telegram-bot-token">Токен бота</Label>
                  <Input
                    id="telegram-bot-token"
                    type="password"
                    placeholder="123456:ABCDEF..."
                    value={botToken}
                    onChange={(event) => setBotToken(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Токен не отображается после сохранения. Чтобы отключить бота, сохраните пустое значение.
                  </p>
                </div>
                <Button onClick={handleBotTokenSave} disabled={updateSiteSettings.isPending}>
                  {updateSiteSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Сохранить токен
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Telegram уведомления</CardTitle>
            <CardDescription>Получайте уведомления о новых заявках и сообщениях в Telegram.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!botTokenConfigured && (
              <div className="rounded-lg border border-dashed border-muted p-3 text-sm text-muted-foreground">
                Бот ещё не подключён. Попросите супер-администратора добавить токен в настройках.
              </div>
            )}
            {telegramError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {telegramError}
              </div>
            )}
            {telegramSuccess && (
              <div className="rounded-lg bg-secondary/10 p-3 text-sm text-secondary">
                {telegramSuccess}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="telegram-enabled"
                  checked={telegramEnabled}
                  onCheckedChange={(value) => setTelegramEnabled(value === true)}
                />
                <Label htmlFor="telegram-enabled" className="text-sm leading-5">
                  Включить уведомления о новых заявках и сообщениях
                </Label>
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-[200px]">
                <Label htmlFor="telegram-chat-id" className="shrink-0 text-sm">
                  Chat ID
                </Label>
                <Input
                  id="telegram-chat-id"
                  className="max-w-[180px]"
                  inputMode="numeric"
                  placeholder="123456789"
                  value={telegramChatId}
                  onChange={(event) => setTelegramChatId(event.target.value)}
                />
              </div>
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="telegram-hint">
                <AccordionTrigger>Как узнать Chat ID</AccordionTrigger>
                <AccordionContent>{TELEGRAM_HINT_TEXT}</AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button onClick={handleTelegramSave} disabled={isTelegramSaving}>
              {isTelegramSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить настройки
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
