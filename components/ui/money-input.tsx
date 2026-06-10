'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Currency, MoneyValue, CURRENCIES } from '@/lib/formatMoney';

interface MoneyInputProps {
  value?: MoneyValue | null;
  onChange: (value: MoneyValue) => void;
  placeholder?: string;
}

export function MoneyInput({ value, onChange, placeholder }: MoneyInputProps) {
  const amount = value?.amount ?? '';
  const currency: Currency = value?.currency ?? 'IRT';

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        min="0"
        value={amount}
        onChange={(e) =>
          onChange({ amount: Number(e.target.value), currency })
        }
        placeholder={placeholder ?? 'مقدار'}
        className="flex-1"
      />
      <Select
        value={currency}
        onValueChange={(v) =>
          onChange({ amount: Number(amount) || 0, currency: v as Currency })
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.labelFa} ({c.symbol})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
