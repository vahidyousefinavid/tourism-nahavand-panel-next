'use client';

import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, Eye, MapPin, Users, DollarSign } from 'lucide-react';
import { formatMoney } from '@/lib/formatMoney';

interface EventTableProps {
  events: Event[];
  loading: boolean;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onViewDetails: (event: Event) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function EventTable({ events, loading, onEdit, onDelete, onViewDetails }: EventTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-blue-300" />
        </div>
        <p className="text-gray-400 text-sm">هیچ رویدادی یافت نشد</p>
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
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">مکان</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">قیمت</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">ظرفیت</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">برگزارکننده</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500">بازدید</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {events.map(event => {
              const imgSrc = event.image
                ? event.image.startsWith('data:')
                  ? event.image
                  : `${API_URL}${event.image}`
                : null;
              const remaining = event.capacity - event.registered;
              const isLow = remaining < 10;

              return (
                <tr
                  key={event.id}
                  className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                  onClick={() => onViewDetails(event)}
                >
                  <td className="py-3 px-4">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={event.title?.fa}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-300 text-xs">
                        📅
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-800 line-clamp-1">{event.title?.fa}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate max-w-[120px]">{event.location?.fa}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      !event.price || (event.price as any)?.amount === 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <DollarSign className="w-3 h-3" />
                      {!event.price || (event.price as any)?.amount === 0
                        ? 'رایگان'
                        : formatMoney(event.price as any, 'fa')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      isLow ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Users className="w-3 h-3" />
                      {event.registered}/{event.capacity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{event.organizer?.fa}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {(event.views ?? 0).toLocaleString('fa-IR')}
                  </td>
                  <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(event)}
                        className="w-8 h-8 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="مشاهده جزئیات"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(event)}
                        className="w-8 h-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        title="ویرایش"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(event)}
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
        {events.map(event => {
          const imgSrc = event.image ? `${API_URL}${event.image}` : null;
          return (
            <Card key={event.id} className="p-4 hover:shadow-md transition-shadow border-0 shadow-sm">
              <div className="flex items-start gap-3">
                {imgSrc ? (
                  <img src={imgSrc} alt={event.title?.fa} className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📅</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm mb-0.5 truncate">{event.title?.fa}</p>
                  <p className="text-gray-500 text-xs mb-1">{event.location?.fa}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-full">
                      ظرفیت: {event.capacity}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${!event.price || (event.price as any)?.amount === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {!event.price || (event.price as any)?.amount === 0 ? 'رایگان' : formatMoney(event.price as any, 'fa')}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Eye className="w-3 h-3" />
                      {(event.views ?? 0).toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onViewDetails(event)} className="w-8 h-8 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(event)} className="w-8 h-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(event)} className="w-8 h-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50">
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
