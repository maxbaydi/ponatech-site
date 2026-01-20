'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth/auth-context';
import { useSiteSettings, useUpdateSiteSettings } from '@/lib/hooks/use-site-settings';
import { DISPLAY_CURRENCY_OPTIONS, DEFAULT_DISPLAY_CURRENCY } from '@/lib/currency';
import type { DisplayCurrency } from '@/lib/api/types';

export default function SettingsPage() {
  const { isSuperAdmin } = useAuth();
  const { data: siteSettings, isLoading: isSettingsLoading } = useSiteSettings();
  const updateSiteSettings = useUpdateSiteSettings();

  const displayCurrency = siteSettings?.displayCurrency ?? DEFAULT_DISPLAY_CURRENCY;

  const handleCurrencyChange = (value: string) => {
    const nextCurrency = value as DisplayCurrency;
    if (nextCurrency === displayCurrency) return;
    updateSiteSettings.mutate({ displayCurrency: nextCurrency });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">Управление настройками сайта.</p>
      </div>

      {!isSuperAdmin ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">Доступно только супер-администратору.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Валюта отображения</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Выберите валюту, которая отображается на сайте.
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
      )}
    </div>
  );
}
