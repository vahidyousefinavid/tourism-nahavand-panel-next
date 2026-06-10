'use client';

import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Users, Edit, Trash2, Eye, DollarSign, Clock } from 'lucide-react';
import { formatMoney } from '@/lib/formatMoney';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export function EventDetailsModal({ isOpen, onClose, event, onEdit, onDelete }: EventDetailsModalProps) {
  if (!event) return null;

  const imgSrc = event.image
    ? event.image.startsWith('data:') ? event.image : `${API_URL}${event.image}`
    : null;

  const priceLabel = !event.price || (event.price as any)?.amount === 0
    ? 'رایگان'
    : formatMoney(event.price as any, 'fa');

  const remaining = (event.capacity || 0) - (event.registered || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            جزئیات رویداد
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Image + header */}
          {imgSrc && (
            <div className="relative h-48 rounded-xl overflow-hidden">
              <img src={imgSrc} alt={event.title?.fa} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 right-3 text-white font-bold text-lg leading-tight">
                {event.title?.fa}
              </div>
            </div>
          )}

          {!imgSrc && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{event.title?.fa}</h2>
              {event.title?.en && <p className="text-gray-500 text-sm mt-0.5">{event.title.en}</p>}
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                مکان برگزاری
              </div>
              <div className="font-medium text-gray-800">{event.location?.fa || '—'}</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                برگزارکننده
              </div>
              <div className="font-medium text-gray-800">{event.organizer?.fa || '—'}</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                قیمت
              </div>
              <div className={`font-semibold ${!event.price || (event.price as any)?.amount === 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
                {priceLabel}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                ظرفیت
              </div>
              <div className="font-medium text-gray-800">
                {event.registered || 0} / {event.capacity || 0}
                {remaining <= 10 && remaining > 0 && (
                  <span className="mr-1.5 text-xs text-red-500">(ظرفیت محدود)</span>
                )}
                {remaining === 0 && (
                  <span className="mr-1.5 text-xs text-red-600">(تکمیل)</span>
                )}
              </div>
            </div>
          </div>

          {/* بازدیدها */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>{event.views?.toLocaleString('fa') || '۰'} بازدید</span>
          </div>

          {/* توضیحات */}
          {event.description?.fa && (
            <div>
              <div className="text-xs text-gray-400 mb-1.5 font-medium">توضیحات</div>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl p-3">
                {event.description.fa}
              </p>
            </div>
          )}

          {/* زمان‌بندی */}
          {event.timeRanges && event.timeRanges.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-2 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                زمان‌بندی رویداد
              </div>
              <div className="space-y-2">
                {event.timeRanges.map((tr, i) => (
                  <div key={tr.id || i} className="bg-blue-50 rounded-lg px-3 py-2 text-sm text-blue-800">
                    <span className="font-medium">
                      {tr.startDate ? new Date(tr.startDate).toLocaleDateString('fa-IR') : '—'}
                    </span>
                    {tr.endDate && (
                      <span className="text-blue-600"> تا {new Date(tr.endDate).toLocaleDateString('fa-IR')}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} size="sm">
              بستن
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { onDelete(event); onClose(); }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 ml-1.5" />
              حذف
            </Button>
            <Button
              size="sm"
              onClick={() => { onEdit(event); onClose(); }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="h-4 w-4 ml-1.5" />
              ویرایش
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
