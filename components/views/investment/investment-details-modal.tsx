'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Investment } from '@/types';
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMoney } from '@/lib/formatMoney';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface InvestmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: Investment | null;
  onEdit: (investment: Investment) => void;
  onDelete: (investment: Investment) => void;
}

const categoryLabels: Record<string, string> = {
  'real-estate': 'املاک',
  'agriculture': 'کشاورزی',
  'tourism': 'گردشگری',
  'handicrafts': 'صنایع دستی',
  'industry': 'صنعت',
  'technology': 'فناوری',
};

const riskLabels: Record<string, string> = {
  'low': 'کم',
  'medium': 'متوسط',
  'high': 'زیاد',
};

const statusLabels: Record<string, string> = {
  'active': 'فعال',
  'pending': 'در انتظار',
  'completed': 'تکمیل شده',
};

export function InvestmentDetailsModal({ isOpen, onClose, investment, onEdit, onDelete }: InvestmentDetailsModalProps) {
  const [activeImg, setActiveImg] = useState(0);

  if (!investment) return null;

  const images = investment.images || [];
  const mainIdx = investment.mainImageIndex ?? 0;

  const prev = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveImg((i) => (i + 1) % images.length);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setActiveImg(0); onClose(); } }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">جزئیات فرصت سرمایه‌گذاری</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* carousel */}
          {images.length > 0 && (
            <div className="relative w-full h-56 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={`${API_URL}${images[activeImg]}`}
                className="w-full h-full object-cover"
                alt=""
              />
              {activeImg === mainIdx && (
                <span className="absolute top-2 right-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full">تصویر اصلی</span>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`w-2 h-2 rounded-full ${i === activeImg ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}>
                  <img
                    src={`${API_URL}${img}`}
                    className={`w-16 h-16 object-cover rounded border-2 ${i === activeImg ? 'border-blue-500' : i === mainIdx ? 'border-yellow-400' : 'border-gray-200'}`}
                    alt=""
                  />
                </button>
              ))}
            </div>
          )}

          {/* عنوان */}
          <div>
            <h3 className="font-semibold text-lg">{investment.title?.fa || '-'}</h3>
          </div>

          {/* اطلاعات کلی */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <span className="text-sm text-gray-600">دسته‌بندی:</span>
              <Badge variant="outline" className="mr-2">
                {categoryLabels[investment.category] || investment.category}
              </Badge>
            </div>
            <div>
              <span className="text-sm text-gray-600">وضعیت:</span>
              <Badge className="bg-blue-100 text-blue-800">
                {statusLabels[investment.status] || investment.status}
              </Badge>
            </div>
            <div>
              <span className="text-sm text-gray-600">سطح ریسک:</span>
              <Badge variant="secondary">
                {riskLabels[investment.riskLevel || 'medium']}
              </Badge>
            </div>
            <div>
              <span className="text-sm text-gray-600">بازدید:</span>
              <span className="mr-2">{investment.views || 0}</span>
            </div>
          </div>

          {/* خلاصه */}
          <div>
            <h4 className="font-semibold mb-1">خلاصه کوتاه:</h4>
            <p className="text-gray-700">{investment.shortDescription?.fa || '-'}</p>
          </div>

          {/* توضیحات کامل */}
          <div>
            <h4 className="font-semibold mb-1">توضیحات کامل:</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{investment.fullDescription?.fa || '-'}</p>
          </div>

          {/* اطلاعات مالی */}
          {(investment.minInvestment || investment.maxInvestment || investment.expectedReturn) && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">اطلاعات مالی:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {investment.minInvestment && (
                  <div><span className="text-gray-600">حداقل سرمایه:</span> <span className="font-medium">{formatMoney(investment.minInvestment, 'fa')}</span></div>
                )}
                {investment.maxInvestment && (
                  <div><span className="text-gray-600">حداکثر سرمایه:</span> <span className="font-medium">{formatMoney(investment.maxInvestment, 'fa')}</span></div>
                )}
                {investment.expectedReturn && (
                  <div><span className="text-gray-600">بازدهی مورد انتظار:</span> {investment.expectedReturn}</div>
                )}
                {investment.timeframe && (
                  <div><span className="text-gray-600">بازه زمانی:</span> {investment.timeframe}</div>
                )}
              </div>
            </div>
          )}

          {/* پشتیبانی */}
          {investment.supportPhone && (
            <div>
              <h4 className="font-semibold">شماره پشتیبانی:</h4>
              <p className="text-gray-700">{investment.supportPhone}</p>
            </div>
          )}

          {/* ویژگی‌ها */}
          {investment.features && Object.keys(investment.features).length > 0 && (
            <div>
              <h4 className="font-semibold mb-1">ویژگی‌ها:</h4>
              <ul className="list-disc list-inside">
                {(investment.features.fa || []).map((f: string, i: number) => (
                  <li key={i} className="text-gray-700">{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* شرایط */}
          {investment.requirements && Object.keys(investment.requirements).length > 0 && (
            <div>
              <h4 className="font-semibold mb-1">شرایط و الزامات:</h4>
              <ul className="list-disc list-inside">
                {(investment.requirements.fa || []).map((r: string, i: number) => (
                  <li key={i} className="text-gray-700">{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* تاریخچه */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            <p>ایجاد: {investment.createdAt ? new Date(investment.createdAt).toLocaleDateString('fa') : '-'}</p>
            <p>بروزرسانی: {investment.updatedAt ? new Date(investment.updatedAt).toLocaleDateString('fa') : '-'}</p>
          </div>

          {/* عملیات */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onEdit(investment)}>
              <Pencil className="h-4 w-4 ml-1" />
              ویرایش
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(investment)}
            >
              <Trash2 className="h-4 w-4 ml-1" />
              حذف
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}