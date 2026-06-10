export type Currency = 'IRT' | 'IRR' | 'USD' | 'EUR' | 'AED' | 'CNY' | 'GBP';

export interface MoneyValue {
  amount: number;
  currency: Currency;
}

export const CURRENCIES: { value: Currency; labelFa: string; symbol: string }[] = [
  { value: 'IRT', labelFa: 'تومان',        symbol: 'تومان' },
  { value: 'IRR', labelFa: 'ریال',         symbol: 'ریال'  },
  { value: 'USD', labelFa: 'دلار آمریکا',  symbol: '$'     },
  { value: 'EUR', labelFa: 'یورو',         symbol: '€'     },
  { value: 'AED', labelFa: 'درهم امارات', symbol: 'د.إ'   },
  { value: 'CNY', labelFa: 'یوان چین',    symbol: '¥'     },
  { value: 'GBP', labelFa: 'پوند انگلیس', symbol: '£'     },
];

// Currencies whose symbol goes after the number
const POST_SYMBOL = new Set<Currency>(['IRT', 'IRR', 'AED']);

const LOCALE_MAP: Record<string, string> = {
  fa: 'fa-IR',
  en: 'en-US',
  ar: 'ar-SA',
  zh: 'zh-CN',
};

export function formatMoney(
  value: MoneyValue | string | null | undefined,
  locale = 'fa',
): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value || '-';

  const { amount, currency } = value;
  const localeCode = LOCALE_MAP[locale] ?? 'en-US';
  const formatted = new Intl.NumberFormat(localeCode).format(amount);
  const cur = CURRENCIES.find((c) => c.value === currency);
  const symbol = cur?.symbol ?? currency;

  return POST_SYMBOL.has(currency) ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

export function isMoneyValue(v: unknown): v is MoneyValue {
  return (
    typeof v === 'object' &&
    v !== null &&
    'amount' in v &&
    'currency' in v
  );
}
