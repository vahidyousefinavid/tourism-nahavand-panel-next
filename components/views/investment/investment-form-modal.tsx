'use client';

import { useState, useEffect } from 'react';
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
import { CreateInvestmentDto, UpdateInvestmentDto, Investment } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

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
  onSubmit: (data: CreateInvestmentDto) => Promise<void>;
  investment?: Investment | null;
}

export function InvestmentFormModal({ isOpen, onClose, onSubmit, investment }: InvestmentFormModalProps) {
  const [formData, setFormData] = useState<CreateInvestmentDto>({
    title: { fa: '', en: '', ar: '', zh: '' } as any,
    shortDescription: { fa: '', en: '', ar: '', zh: '' } as any,
    fullDescription: { fa: '', en: '', ar: '', zh: '' } as any,
    category: 'real-estate',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (investment) {
        setFormData({
          title: investment.title,
          shortDescription: investment.shortDescription,
          fullDescription: investment.fullDescription,
          image: investment.image || '',
          category: investment.category,
          icon: investment.icon || '',
          minInvestment: investment.minInvestment || '',
          maxInvestment: investment.maxInvestment || '',
          expectedReturn: investment.expectedReturn || '',
          timeframe: investment.timeframe || '',
          riskLevel: investment.riskLevel || 'medium',
          features: investment.features || {},
          requirements: investment.requirements || {},
          benefits: investment.benefits || {},
          contactInfo: investment.contactInfo || {},
          supportPhone: investment.supportPhone || '',
          status: investment.status,
        });
      } else {
        setFormData({
          title: { fa: '', en: '', ar: '', zh: '' } as any,
          shortDescription: { fa: '', en: '', ar: '', zh: '' } as any,
          fullDescription: { fa: '', en: '', ar: '', zh: '' } as any,
          category: 'real-estate',
          status: 'active',
        });
      }
      setErrors({});
    }
  }, [investment, isOpen]);

  const handleChange = (field: keyof CreateInvestmentDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleMultiLangChange = (field: MLFields, lang: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...(prev as any)[field], [lang]: value },
    }));
  };

  const handleArrayChange = (field: 'features' | 'requirements' | 'benefits', lang: string, values: string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...(prev as any)[field], [lang]: values },
    }));
  };

  const addArrayItem = (field: 'features' | 'requirements' | 'benefits', lang: string) => {
    setFormData((prev) => {
      const current = (prev as any)[field]?.[lang] || [];
      return {
        ...prev,
        [field]: { ...(prev as any)[field], [lang]: [...current, ''] },
      };
    });
  };

  const removeArrayItem = (field: 'features' | 'requirements' | 'benefits', lang: string, index: number) => {
    setFormData((prev) => {
      const current = (prev as any)[field]?.[lang] || [];
      return {
        ...prev,
        [field]: { ...(prev as any)[field], [lang]: current.filter((_: any, i: number) => i !== index) },
      };
    });
  };

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
      await onSubmit(formData);
      if (!investment) {
        setFormData({
          title: { fa: '', en: '', ar: '', zh: '' } as any,
          shortDescription: { fa: '', en: '', ar: '', zh: '' } as any,
          fullDescription: { fa: '', en: '', ar: '', zh: '' } as any,
          category: 'real-estate',
          status: 'active',
        });
      }
      onClose();
    } catch (err) {
      console.error('Error submitting investment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMultiLangField = (field: MLFields, label: string, isTextarea = false) => (
    <div key={field} className="space-y-2">
      <Label>{label}</Label>
      {supportedLanguages.map((lang) => (
        <div key={`${field}-${lang.code}`}>
          <Label className="text-xs opacity-70 mb-1 block">{lang.label}</Label>
          {isTextarea ? (
            <Textarea
              value={(formData as any)[field][lang.code] || ''}
              onChange={(e) => handleMultiLangChange(field, lang.code, e.target.value)}
              placeholder={`${label} (${lang.label})`}
              rows={3}
            />
          ) : (
            <Input
              value={(formData as any)[field][lang.code] || ''}
              onChange={(e) => handleMultiLangChange(field, lang.code, e.target.value)}
              placeholder={`${label} (${lang.label})`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderArrayField = (field: 'features' | 'requirements' | 'benefits', label: string) => (
    <div key={field} className="space-y-2">
      <Label>{label}</Label>
      {supportedLanguages.map((lang) => (
        <div key={`${field}-${lang.code}`} className="mt-1 space-y-1">
          <Label className="text-xs opacity-70">{lang.label}</Label>
          {((formData as any)[field]?.[lang] || []).map((item: string, idx: number) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const newValues = [...((formData as any)[field]?.[lang] || [])];
                  newValues[idx] = e.target.value;
                  handleArrayChange(field, lang.code, newValues);
                }}
                placeholder={`آیتم ${idx + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem(field, lang.code, idx)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem(field, lang.code)}
            className="text-xs mt-1"
          >
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
            <Input
              value={formData.icon || ''}
              onChange={(e) => handleChange('icon', e.target.value)}
              placeholder="مثال: building2"
            />
          </div>

          {/* اطلاعات سرمایه‌گذاری */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>حداقل سرمایه</Label>
              <Input
                value={formData.minInvestment || ''}
                onChange={(e) => handleChange('minInvestment', e.target.value)}
                placeholder="مثال: 100 میلیون تومان"
              />
            </div>
            <div>
              <Label>حداکثر سرمایه</Label>
              <Input
                value={formData.maxInvestment || ''}
                onChange={(e) => handleChange('maxInvestment', e.target.value)}
                placeholder="مثال: 5 میلیارد تومان"
              />
            </div>
            <div>
              <Label>بازدهی مورد انتظار</Label>
              <Input
                value={formData.expectedReturn || ''}
                onChange={(e) => handleChange('expectedReturn', e.target.value)}
                placeholder="مثال: 25% سالانه"
              />
            </div>
            <div>
              <Label>بازه زمانی</Label>
              <Input
                value={formData.timeframe || ''}
                onChange={(e) => handleChange('timeframe', e.target.value)}
                placeholder="مثال: 2 سال"
              />
            </div>
          </div>

          {/* سطح ریسک */}
          <div>
            <Label>سطح ریسک</Label>
            <Select value={formData.riskLevel || 'medium'} onValueChange={(v) => handleChange('riskLevel', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
            <Input
              value={formData.supportPhone || ''}
              onChange={(e) => handleChange('supportPhone', e.target.value)}
              placeholder="مثال: 021-12345678"
            />
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

          {/* ویژگی‌ها، شرایط، مزایا */}
          {renderArrayField('features', 'ویژگی‌ها و مزایا')}
          {renderArrayField('requirements', 'شرایط و الزامات')}
          {renderArrayField('benefits', 'مزایا')}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (investment ? 'در حال ویرایش...' : 'در حال افزودن...') : investment ? 'ویرایش' : 'افزودن'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}