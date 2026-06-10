'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Investment } from '@/types';
import { Eye, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { formatMoney } from '@/lib/formatMoney';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface InvestmentTableProps {
  investments: Investment[];
  loading: boolean;
  onEdit: (investment: Investment) => void;
  onDelete: (investment: Investment) => void;
  onViewDetails: (investment: Investment) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; badge: string }> = {
  'real-estate': { label: 'املاک',       badge: 'bg-blue-50 text-blue-700'    },
  'agriculture': { label: 'کشاورزی',     badge: 'bg-green-50 text-green-700'  },
  'tourism':     { label: 'گردشگری',     badge: 'bg-purple-50 text-purple-700' },
  'handicrafts': { label: 'صنایع دستی', badge: 'bg-amber-50 text-amber-700'   },
  'industry':    { label: 'صنعت',        badge: 'bg-gray-100 text-gray-700'   },
  'technology':  { label: 'فناوری',      badge: 'bg-cyan-50 text-cyan-700'    },
};

const RISK_LABELS: Record<string, { label: string; badge: string }> = {
  low:    { label: 'کم',      badge: 'bg-emerald-50 text-emerald-700' },
  medium: { label: 'متوسط',   badge: 'bg-yellow-50 text-yellow-700'  },
  high:   { label: 'زیاد',    badge: 'bg-red-50 text-red-700'        },
};

const STATUS_LABELS: Record<string, { label: string; badge: string; dot: string }> = {
  active:    { label: 'فعال',         badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  pending:   { label: 'در انتظار',    badge: 'bg-yellow-50 text-yellow-700',   dot: 'bg-yellow-500'  },
  completed: { label: 'تکمیل شده',    badge: 'bg-blue-50 text-blue-700',       dot: 'bg-blue-500'    },
};

export function InvestmentTable({ investments, loading, onEdit, onDelete, onViewDetails }: InvestmentTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (investments.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-amber-300" />
        </div>
        <p className="text-gray-400 text-sm">هیچ فرصت سرمایه‌گذاری یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 w-14">تصویر</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">عنوان</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">دسته‌بندی</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">حداقل سرمایه</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">بازدهی</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">ریسک</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">وضعیت</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">بازدید</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {investments.map(item => {
              const imgSrc = item.images?.length
                ? `${API_URL}${item.images[item.mainImageIndex ?? 0]}`
                : null;
              const cat    = CATEGORY_LABELS[item.category]          || { label: item.category,    badge: 'bg-gray-100 text-gray-600' };
              const risk   = RISK_LABELS[item.riskLevel ?? 'medium'] || RISK_LABELS.medium;
              const status = STATUS_LABELS[item.status]              || STATUS_LABELS.pending;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                  onClick={() => onViewDetails(item)}
                >
                  <td className="py-3 px-4">
                    {imgSrc ? (
                      <img src={imgSrc} alt="" className="w-10 h-10 object-cover rounded-lg" />
                    ) : (
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-lg">💼</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-800 line-clamp-1">{item.title?.fa || '—'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cat.badge}`}>{cat.label}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {formatMoney(item.minInvestment, 'fa') || '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">{item.expectedReturn || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${risk.badge}`}>{risk.label}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {(item.views ?? 0).toLocaleString('fa-IR')}
                  </td>
                  <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => onViewDetails(item)}
                        className="w-8 h-8 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" title="مشاهده جزئیات">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(item)}
                        className="w-8 h-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="ویرایش">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(item)}
                        className="w-8 h-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {investments.map(item => {
          const imgSrc = item.images?.length ? `${API_URL}${item.images[item.mainImageIndex ?? 0]}` : null;
          const cat    = CATEGORY_LABELS[item.category]          || { label: item.category,  badge: 'bg-gray-100 text-gray-600' };
          const status = STATUS_LABELS[item.status]              || STATUS_LABELS.pending;

          return (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow border-0 shadow-sm">
              <div className="flex items-start gap-3">
                {imgSrc ? (
                  <img src={imgSrc} alt="" className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">💼</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm mb-1 truncate">{item.title?.fa}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${cat.badge}`}>{cat.label}</span>
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${status.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{formatMoney(item.minInvestment, 'fa') || '—'}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onViewDetails(item)} className="w-8 h-8 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="w-8 h-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(item)} className="w-8 h-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
