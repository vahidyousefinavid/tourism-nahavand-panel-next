'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateInvestmentDto, Investment } from '@/types';
import { Plus, Trash2, Star, Upload, MapPin, X } from 'lucide-react';
import { MoneyInput } from '@/components/ui/money-input';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/ui/map-component'), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Unified image entry: either a saved URL or a new local File
type ImageEntry =
  | { kind: 'existing'; url: string }
  | { kind: 'new'; file: File; preview: string };

const supportedLanguages = [
  { code: 'fa', label: 'فارسی' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'zh', label: '中文' },
];

const investmentCategories = [
  { value: 'real-estate', label: 'املاک' },
  { value: 'agriculture', label: 'کشاورزی' },
  { value: 'tourism', label: 'گردشگری' },
  { value: 'handicrafts', label: 'صنایع دستی' },
  { value: 'industry', label: 'صنعت' },
  { value: 'technology', label: 'فناوری' },
];

const riskLevels = [
  { value: 'low', label: 'کم' },
  { value: 'medium', label: 'متوسط' },
  { value: 'high', label: 'زیاد' },
];

const statuses = [
  { value: 'active', label: 'فعال' },
  { value: 'pending', label: 'در انتظار' },
  { value: 'completed', label: 'تکمیل شده' },
];

type MLFields = 'title' | 'shortDescription' | 'fullDescription' | 'contactInfo';

interface InvestmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInvestmentDto, files: File[]) => Promise<void>;
  investment?: Investment | null;
}

const emptyFormData = (): CreateInvestmentDto => ({
  title: { fa: '', en: '', ar: '', zh: '' } as any,
  shortDescription: { fa: '', en: '', ar: '', zh: '' } as any,
  fullDescription: { fa: '', en: '', ar: '', zh: '' } as any,
  category: 'real-estate',
  status: 'active',
  mainImageIndex: 0,
});

export function InvestmentFormModal({ isOpen, onClose, onSubmit, investment }: InvestmentFormModalProps) {
  const [formData, setFormData] = useState<CreateInvestmentDto>(emptyFormData());
  const [imageList, setImageList] = useState<ImageEntry[]>([]);
  const [mainIdx, setMainIdx] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (investment) {
      setFormData({
        title: investment.title,
        shortDescription: investment.shortDescription,
        fullDescription: investment.fullDescription,
        category: investment.category,
        icon: investment.icon || '',
        minInvestment: investment.minInvestment ?? undefined,
        maxInvestment: investment.maxInvestment ?? undefined,
        expectedReturn: investment.expectedReturn || '',
        timeframe: investment.timeframe || '',
        riskLevel: investment.riskLevel || 'medium',
        features: investment.features || {},
        requirements: investment.requirements || {},
        benefits: investment.benefits || {},
        contactInfo: investment.contactInfo || {},
        supportPhone: investment.supportPhone || '',
        status: investment.status,
        latlng: (investment as any).latlng ?? null,
        mainImageIndex: investment.mainImageIndex ?? 0,
      });
      setImageList((investment.images || []).map((url) => ({ kind: 'existing', url })));
      setMainIdx(investment.mainImageIndex ?? 0);
    } else {
      setFormData(emptyFormData());
      setImageList([]);
      setMainIdx(0);
    }
    setErrors({});
  }, [investment, isOpen]);

  // Revoke object URLs on unmount / list change
  useEffect(() => {
    return () => {
      imageList.forEach((img) => {
        if (img.kind === 'new') URL.revokeObjectURL(img.preview);
      });
    };
  }, [imageList]);

  const handleChange = (field: keyof CreateInvestmentDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleMultiLangChange = (field: MLFields, lang: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: { ...(prev as any)[field], [lang]: value } }));
  };

  const handleArrayChange = (field: 'features' | 'requirements' | 'benefits', lang: string, values: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: { ...(prev as any)[field], [lang]: values } }));
  };

  const addArrayItem = (field: 'features' | 'requirements' | 'benefits', lang: string) => {
    setFormData((prev) => {
      const current = (prev as any)[field]?.[lang] || [];
      return { ...prev, [field]: { ...(prev as any)[field], [lang]: [...current, ''] } };
    });
  };

  const removeArrayItem = (field: 'features' | 'requirements' | 'benefits', lang: string, index: number) => {
    setFormData((prev) => {
      const current = (prev as any)[field]?.[lang] || [];
      return { ...prev, [field]: { ...(prev as any)[field], [lang]: current.filter((_: any, i: number) => i !== index) } };
    });
  };

  // Add new files to the unified list
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const added: ImageEntry[] = Array.from(e.target.files).map((file) => ({
      kind: 'new',
      file,
      preview: URL.createObjectURL(file),
    }));
    setImageList((prev) => [...prev, ...added]);
    // reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setImageList((prev) => {
      const entry = prev[idx];
      if (entry.kind === 'new') URL.revokeObjectURL(entry.preview);
      return prev.filter((_, i) => i !== idx);
    });
    setMainIdx((prev) => {
      if (prev === idx) return 0;
      return prev > idx ? prev - 1 : prev;
    });
  };

  const getPreview = (entry: ImageEntry) =>
    entry.kind === 'existing'
      ? (entry.url.startsWith('http') ? entry.url : `${API_URL}${entry.url}`)
      : entry.preview;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title?.fa?.trim()) newErrors.title = 'عنوان فارسی الزامی است';
    if (!formData.shortDescription?.fa?.trim()) newErrors.shortDescription = 'خلاصه فارسی الزامی است';
    if (!formData.fullDescription?.fa?.trim()) newErrors.fullDescription = 'توضیحات فارسی الزامی است';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const existingUrls = imageList.filter((img) => img.kind === 'existing').map((img) => (img as any).url as string);
      const newFiles = imageList.filter((img) => img.kind === 'new').map((img) => (img as any).file as File);
      const dto: CreateInvestmentDto = { ...formData, images: existingUrls, mainImageIndex: mainIdx };
      await onSubmit(dto, newFiles);
      onClose();
    } catch (err) {
      console.error('Error submitting investment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderArrayField = (field: 'features' | 'requirements' | 'benefits', label: string) => (
    <div key={field} className="space-y-2">
      <Label>{label}</Label>
      {supportedLanguages.map((lang) => (
        <div key={`${field}-${lang.code}`} className="mt-1 space-y-1">
          <Label className="text-xs opacity-70">{lang.label}</Label>
          {((formData as any)[field]?.[lang.code] || []).map((item: string, idx: number) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const newValues = [...((formData as any)[field]?.[lang.code] || [])];
                  newValues[idx] = e.target.value;
                  handleArrayChange(field, lang.code, newValues);
                }}
                placeholder={`آیتم ${idx + 1}`}
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem(field, lang.code, idx)} className="text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem(field, lang.code)} className="text-xs mt-1">
            <Plus className="h-3 w-3 mr-1" /> افزودن
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {investment ? 'ویرایش فرصت سرمایه‌گذاری' : 'افزودن فرصت سرمایه‌گذاری جدید'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* عنوان */}
          <div>
            <Label>عنوان *</Label>
            {supportedLanguages.map((lang) => (
              <div key={`title-${lang.code}`} className="mt-1">
                <Label className="text-xs opacity-70">{lang.label}</Label>
                <Input
                  value={formData.title[lang.code] || ''}
                  onChange={(e) => handleMultiLangChange('title', lang.code, e.target.value)}
                  placeholder={`عنوان (${lang.label})`}
                  className={errors.title && lang.code === 'fa' ? 'border-red-500' : ''}
                />
              </div>
            ))}
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* خلاصه کوتاه */}
          <div>
            <Label>خلاصه کوتاه *</Label>
            {supportedLanguages.map((lang) => (
              <div key={`shortDesc-${lang.code}`} className="mt-1">
                <Label className="text-xs opacity-70">{lang.label}</Label>
                <Textarea
                  value={formData.shortDescription[lang.code] || ''}
                  onChange={(e) => handleMultiLangChange('shortDescription', lang.code, e.target.value)}
                  placeholder={`خلاصه (${lang.label})`}
                  rows={2}
                  className={errors.shortDescription && lang.code === 'fa' ? 'border-red-500' : ''}
                />
              </div>
            ))}
          </div>

          {/* توضیحات کامل */}
          <div>
            <Label>توضیحات کامل *</Label>
            {supportedLanguages.map((lang) => (
              <div key={`fullDesc-${lang.code}`} className="mt-1">
                <Label className="text-xs opacity-70">{lang.label}</Label>
                <Textarea
                  value={formData.fullDescription[lang.code] || ''}
                  onChange={(e) => handleMultiLangChange('fullDescription', lang.code, e.target.value)}
                  placeholder={`توضیحات (${lang.label})`}
                  rows={4}
                  className={errors.fullDescription && lang.code === 'fa' ? 'border-red-500' : ''}
                />
              </div>
            ))}
          </div>

          {/* دسته‌بندی */}
          <div>
            <Label>دسته‌بندی</Label>
            <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {investmentCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* آیکون */}
          <div>
            <Label>آیکون (Lucide name)</Label>
            <Input value={formData.icon || ''} onChange={(e) => handleChange('icon', e.target.value)} placeholder="مثال: building2" />
          </div>

          {/* ─── تصاویر ─── */}
          <div className="space-y-3">
            <div>
              <Label>تصاویر</Label>
              <p className="text-xs text-gray-500 mt-0.5">
                روی ستاره <Star className="inline h-3 w-3 text-yellow-500" /> کلیک کنید تا تصویر اصلی را انتخاب کنید
              </p>
            </div>

            {/* unified image grid */}
            {imageList.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {imageList.map((entry, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={getPreview(entry)}
                      alt=""
                      className={`w-full aspect-square object-cover rounded-lg border-2 transition-all ${
                        idx === mainIdx ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-gray-200'
                      }`}
                    />

                    {/* main badge */}
                    {idx === mainIdx && (
                      <span className="absolute bottom-1 left-1 bg-yellow-400 text-white text-[10px] px-1 rounded">اصلی</span>
                    )}

                    {/* new badge */}
                    {entry.kind === 'new' && idx !== mainIdx && (
                      <span className="absolute bottom-1 left-1 bg-green-500 text-white text-[10px] px-1 rounded">جدید</span>
                    )}

                    {/* star button — set as main */}
                    <button
                      type="button"
                      onClick={() => setMainIdx(idx)}
                      title="انتخاب به عنوان تصویر اصلی"
                      className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center shadow transition-all ${
                        idx === mainIdx
                          ? 'bg-yellow-400 text-white'
                          : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-yellow-500'
                      }`}
                    >
                      <Star className="h-3.5 w-3.5" fill={idx === mainIdx ? 'currentColor' : 'none'} />
                    </button>

                    {/* remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-all"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* upload button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 ml-2" />
                {imageList.length === 0 ? 'انتخاب تصاویر' : 'افزودن تصاویر بیشتر'}
              </Button>
            </div>
          </div>

          {/* اطلاعات سرمایه‌گذاری */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>حداقل سرمایه</Label>
              <MoneyInput value={formData.minInvestment} onChange={(v) => handleChange('minInvestment', v)} />
            </div>
            <div>
              <Label>حداکثر سرمایه</Label>
              <MoneyInput value={formData.maxInvestment} onChange={(v) => handleChange('maxInvestment', v)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>بازدهی مورد انتظار</Label>
              <Input value={formData.expectedReturn || ''} onChange={(e) => handleChange('expectedReturn', e.target.value)} placeholder="مثال: ۲۵٪ سالانه" />
            </div>
            <div>
              <Label>بازه زمانی</Label>
              <Input value={formData.timeframe || ''} onChange={(e) => handleChange('timeframe', e.target.value)} placeholder="مثال: ۲ سال" />
            </div>
          </div>

          {/* سطح ریسک */}
          <div>
            <Label>سطح ریسک</Label>
            <Select value={formData.riskLevel || 'medium'} onValueChange={(v) => handleChange('riskLevel', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {riskLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* وضعیت */}
          <div>
            <Label>وضعیت</Label>
            <Select value={formData.status || 'active'} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* شماره پشتیبانی */}
          <div>
            <Label>شماره پشتیبانی</Label>
            <Input value={formData.supportPhone || ''} onChange={(e) => handleChange('supportPhone', e.target.value)} placeholder="مثال: ۰۲۱-۱۲۳۴۵۶۷۸" />
          </div>

          {/* اطلاعات تماس */}
          <div>
            <Label>اطلاعات تماس</Label>
            {supportedLanguages.map((lang) => (
              <div key={`contact-${lang.code}`} className="mt-1">
                <Label className="text-xs opacity-70">{lang.label}</Label>
                <Input
                  value={formData.contactInfo?.[lang.code] || ''}
                  onChange={(e) => handleMultiLangChange('contactInfo', lang.code, e.target.value)}
                  placeholder={`تماس (${lang.label})`}
                />
              </div>
            ))}
          </div>

          {renderArrayField('features', 'ویژگی‌ها')}
          {renderArrayField('requirements', 'شرایط و الزامات')}
          {renderArrayField('benefits', 'مزایا')}

          {/* موقعیت جغرافیایی — برای اطلس سرمایه‌گذاری */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  موقعیت جغرافیایی (اطلس)
                </Label>
                <p className="text-xs text-gray-400 mt-0.5">
                  روی نقشه کلیک کنید تا موقعیت انتخاب شود
                </p>
              </div>
              {(formData as any).latlng && (
                <button
                  type="button"
                  onClick={() => handleChange('latlng' as any, null)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <X className="h-3 w-3" />
                  حذف موقعیت
                </button>
              )}
            </div>

            <MapComponent
              center={(formData as any).latlng ?? undefined}
              selectedLocation={(formData as any).latlng ?? null}
              onLocationSelect={(latlng) => handleChange('latlng' as any, latlng)}
              height="260px"
            />

            {(formData as any).latlng ? (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span dir="ltr" className="font-mono">
                  {((formData as any).latlng.lat as number).toFixed(6)}
                  {' , '}
                  {((formData as any).latlng.lng as number).toFixed(6)}
                </span>
                <span className="text-blue-400 mr-auto">موقعیت انتخاب شد ✓</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-400">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                موقعیتی انتخاب نشده — روی نقشه کلیک کنید
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>انصراف</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              {isSubmitting ? (investment ? 'در حال ویرایش...' : 'در حال افزودن...') : investment ? 'ویرایش' : 'افزودن'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
