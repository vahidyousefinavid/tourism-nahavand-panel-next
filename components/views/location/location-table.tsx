'use client';

import { Location } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, Eye, MapPin, Clock, DollarSign, Star } from 'lucide-react';
import { formatMoney } from '@/lib/formatMoney';

interface LocationTableProps {
  locations: Location[];
  loading: boolean;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
  onViewDetails: (location: Location) => void;
  language?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const CATEGORY_LABELS: Record<string, { label: string; badge: string }> = {
  historical: { label: 'تاریخی',  badge: 'bg-amber-50 text-amber-700'   },
  natural:    { label: 'طبیعی',   badge: 'bg-emerald-50 text-emerald-700' },
  cultural:   { label: 'فرهنگی',  badge: 'bg-blue-50 text-blue-700'      },
  religious:  { label: 'مذهبی',   badge: 'bg-purple-50 text-purple-700'  },
};

export function LocationTable({ locations, loading, onEdit, onDelete, onViewDetails, language = 'fa' }: LocationTableProps) {
  const getText = (text: Record<string, string> | undefined) => text?.[language] || text?.fa || '';

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-emerald-300" />
        </div>
        <p className="text-gray-400 text-sm">هیچ مکانی یافت نشد</p>
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
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">نام</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">دسته‌بندی</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">ورودیه</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">ساعت بازدید</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">امتیاز</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">بازدید</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {locations.map(location => {
              const mainImage = location.images?.length
                ? location.images[location.mainImageIndex ?? 0]
                : null;
              const cat = CATEGORY_LABELS[location.category] || { label: location.category, badge: 'bg-gray-100 text-gray-600' };

              return (
                <tr
                  key={location.id}
                  className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                  onClick={() => onViewDetails(location)}
                >
                  <td className="py-3 px-4">
                    {mainImage ? (
                      <img
                        src={`${API_URL}${mainImage}`}
                        alt={getText(location.name)}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-lg">
                        📍
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-800">{getText(location.name)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cat.badge}`}>
                      {cat.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      !location.entryFee || (location.entryFee as any)?.amount === 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <DollarSign className="w-3 h-3" />
                      {!location.entryFee || (location.entryFee as any)?.amount === 0
                        ? 'رایگان'
                        : formatMoney(location.entryFee as any, 'fa')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-gray-500 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {getText(location.openingHours) || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {location.rating != null ? Number(location.rating).toFixed(1) : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {(location.views ?? 0).toLocaleString('fa-IR')}
                  </td>
                  <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => onViewDetails(location)}
                        className="w-8 h-8 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="مشاهده جزئیات"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => onEdit(location)}
                        className="w-8 h-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        title="ویرایش"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => onDelete(location)}
                        className="w-8 h-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        title="حذف"
                      >
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
        {locations.map(location => {
          const mainImage = location.images?.length
            ? location.images[location.mainImageIndex ?? 0]
            : null;
          const cat = CATEGORY_LABELS[location.category] || { label: location.category, badge: 'bg-gray-100 text-gray-600' };

          return (
            <Card key={location.id} className="overflow-hidden hover:shadow-md transition-shadow border-0 shadow-sm">
              {mainImage && (
                <img
                  src={`${API_URL}${mainImage}`}
                  alt={getText(location.name)}
                  className="w-full h-36 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{getText(location.name)}</p>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${cat.badge}`}>{cat.label}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onViewDetails(location)} className="w-8 h-8 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(location)} className="w-8 h-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(location)} className="w-8 h-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{getText(location.openingHours)}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{location.entryFee ? formatMoney(location.entryFee as any, 'fa') : 'رایگان'}</span>
                  <span className="flex items-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-amber-400" />{location.rating != null ? Number(location.rating).toFixed(1) : '—'}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
