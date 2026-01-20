import type { DisplayCurrency } from '@/lib/api/types';

export const DISPLAY_CURRENCIES: DisplayCurrency[] = ['RUB', 'CNY'];
export const DEFAULT_DISPLAY_CURRENCY: DisplayCurrency = 'RUB';

export const DISPLAY_CURRENCY_OPTIONS: Array<{ value: DisplayCurrency; label: string; symbol: string }> = [
  { value: 'RUB', label: 'Рубли (₽)', symbol: '₽' },
  { value: 'CNY', label: 'Юани (¥)', symbol: '¥' },
];

const CURRENCY_SYMBOLS: Record<DisplayCurrency, string> = {
  RUB: '₽',
  CNY: '¥',
};

export const getCurrencySymbol = (currency: DisplayCurrency): string =>
  CURRENCY_SYMBOLS[currency] ?? CURRENCY_SYMBOLS[DEFAULT_DISPLAY_CURRENCY];
