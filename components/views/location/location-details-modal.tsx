'use client';

import { Location } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { MapPin, Star, Eye, DollarSign, Clock, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { formatMoney } from '@/lib/formatMoney';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const CATEGORY_LABELS: Record<string, { label: string; className: string }> = {
  historical: { label: 'تاریخی', className: 'bg-amber-100 text-amber-800' },
  natural:    { label: 'طبیعی',  className: 'bg-emerald-100 text-emerald-800' },
  cultural:   { label: 'فرهنگی', className: 'bg-blue-100 text-blue-800' },
  religious:  { label: 'مذهبی',  className: 'bg-purple-100 text-purple-800' },
};

interface LocationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
}

export function LocationDetailsModal({ isOpen, onClose, location, onEdit, onDelete }: LocationDetailsModalProps) {
  const [imgIdx, setImgIdx] = useState(0);

  if (!location) return null;

  const images = location.images || [];
  const activeIdx = imgIdx < images.length ? imgIdx : 0;
  const imgSrc = images[activeIdx] ? `${API_URL}${images[activeIdx]}` : null;

  const entryFeeLabel = !location.entryFee || (location.entryFee as any)?.amount === 0
    ? 'رایگان'
    : location.entryFee
      ? formatMoney(location.entryFee as any, 'fa')
      : '—';

  const cat = CATEGORY_LABELS[location.category] || { label: location.category, className: 'bg-gray-100 text-gray-700' };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            جزئیات مکان
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Gallery */}
          {images.length > 0 && (
            <div className="relative h-52 rounded-xl overflow-hidden bg-gray-100">
              {imgSrc && (
                <img src={imgSrc} alt={location.name?.fa} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {/* category badge */}
              <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${cat.className}`}>
                {cat.label}
              </span>

              {/* image nav */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeIdx ? 'bg-white' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="absolute bottom-3 right-3 text-white font-bold text-base leading-tight">
                {location.name?.fa}
              </div>
            </div>
          )}

          {images.length === 0 && (
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-2xl font-bold text-gray-900">{location.name?.fa}</h2>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cat.className}`}>{cat.label}</span>
              </div>
              {location.name?.en && <p className="text-gray-500 text-sm">{location.name.en}</p>}
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                ورودیه
              </div>
              <div className={`font-semibold ${!location.entryFee || (location.entryFee as any)?.amount === 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
                {entryFeeLabel}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                امتیاز
              </div>
              <div className="font-semibold text-amber-600 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {Number(location.rating).toFixed(1)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ساعت بازدید
              </div>
              <div className="font-medium text-gray-800 text-xs leading-relaxed">
                {location.openingHours?.fa || '—'}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                بازدیدها
              </div>
              <div className="font-medium text-gray-800">
                {location.views?.toLocaleString('fa-IR') || '۰'}
              </div>
            </div>
          </div>

          {/* توضیحات */}
          {location.description?.fa && (
            <div>
              <div className="text-xs text-gray-400 mb-1.5 font-medium">توضیحات</div>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl p-3">
                {location.description.fa}
              </p>
            </div>
          )}

          {/* امکانات */}
          {location.facilities?.fa && location.facilities.fa.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-2 font-medium">امکانات</div>
              <div className="flex flex-wrap gap-1.5">
                {location.facilities.fa.map((f, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* مختصات */}
          {location.latlng && (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-mono">{location.latlng.lat}, {location.latlng.lng}</span>
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
              onClick={() => { onDelete(location); onClose(); }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 ml-1.5" />
              حذف
            </Button>
            <Button
              size="sm"
              onClick={() => { onEdit(location); onClose(); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
