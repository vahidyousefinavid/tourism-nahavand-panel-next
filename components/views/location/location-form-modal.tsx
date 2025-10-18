'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateLocationDto, UpdateLocationDto, Location, LatLng } from '@/types';
import MapComponentWrapper from '@/components/ui/mapPicker';

const supportedLanguages = [
    { code: 'fa', label: 'فارسی' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'zh', label: '中文' },
];

type MLKeys = 'name' | 'description' | 'openingHours' | 'entryFee';

interface LocationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
    location?: Location | null;
}

export function LocationFormModal({ isOpen, onClose, onSubmit, location }: LocationFormModalProps) {
    const defaultFormData: CreateLocationDto | UpdateLocationDto = {
        name: { fa: '', en: '', ar: '', zh: '' },
        description: { fa: '', en: '', ar: '', zh: '' },
        category: 'historical',
        images: [],
        mainImageIndex: 0,
        latlng: { lat: 35.6892, lng: 51.389 },
        facilities: { fa: [], en: [], ar: [], zh: [] },
        openingHours: { fa: '', en: '', ar: '', zh: '' },
        entryFee: { fa: '', en: '', ar: '', zh: '' },
        rating: 0,
        reviews: 0,
    };

    const [formData, setFormData] = useState<CreateLocationDto | UpdateLocationDto>(defaultFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newFiles, setNewFiles] = useState<File[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (location) {
                setFormData({
                    ...defaultFormData,
                    ...location,
                    latlng: location.latlng || defaultFormData.latlng,
                    images: location.images || [],
                    facilities: location.facilities || defaultFormData.facilities,
                });
            } else {
                setFormData(defaultFormData);
            }
            setNewFiles([]);
            setErrors({});
        }
    }, [isOpen, location]);

    const handleChange = (field: keyof CreateLocationDto | keyof UpdateLocationDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleMultiLangChange = (field: MLKeys, lang: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...(prev as any)[field], [lang]: value },
        }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleFacilitiesChange = (lang: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            facilities: { ...(prev.facilities || {}), [lang]: value.split(',').map(f => f.trim()).filter(f => f) },
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setNewFiles(Array.from(e.target.files));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.fa.trim()) newErrors.name = 'نام فارسی الزامی است';
        if (!formData.description?.fa.trim()) newErrors.description = 'توضیحات فارسی الزامی است';
        if (!formData.openingHours?.fa?.trim()) newErrors.openingHours = 'ساعات بازدید فارسی الزامی است';
        if (!formData.entryFee?.fa?.trim()) newErrors.entryFee = 'هزینه ورود فارسی الزامی است';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = new FormData();

            // آپلود فایل‌ها
            newFiles.forEach(file => payload.append('images', file));

            // حذف images از dto اصلی چون فایل‌ها جدا هستند
            const copy = { ...formData };
            delete copy.images;

            payload.append('dto', JSON.stringify(copy));

            await onSubmit(payload);
            onClose();
        } catch (err) {
            console.error('Error submitting location:', err);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        {location ? 'ویرایش لوکیشن' : 'افزودن لوکیشن جدید'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* نام و توضیحات چندزبانه */}
                    {(['name', 'description', 'openingHours', 'entryFee'] as MLKeys[]).map(field => (
                        <div key={field}>
                            <Label>{field} *</Label>
                            <div className="mt-2 space-y-2">
                                {supportedLanguages.map(lang => (
                                    <div key={`${field}-${lang.code}`}>
                                        <Label className="text-xs opacity-70 mb-1 block">{`${field} (${lang.label})`}</Label>
                                        {field === 'description' || field === 'openingHours' || field === 'entryFee' ? (
                                            <Textarea
                                                value={(formData as any)[field][lang.code] || ''}
                                                onChange={e => handleMultiLangChange(field, lang.code, e.target.value)}
                                                rows={3}
                                            />
                                        ) : (
                                            <Input
                                                value={(formData as any)[field][lang.code] || ''}
                                                onChange={e => handleMultiLangChange(field, lang.code, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors[field] && <p className="text-sm text-red-500 mt-1">{errors[field]}</p>}
                        </div>
                    ))}

                    {/* دسته‌بندی */}
                    <div>
                        <Label>دسته‌بندی</Label>
                        <select
                            value={formData.category}
                            onChange={e => handleChange('category', e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="historical">تاریخی</option>
                            <option value="natural">طبیعی</option>
                            <option value="cultural">فرهنگی</option>
                            <option value="religious">مذهبی</option>
                        </select>
                    </div>

                    {/* نقشه */}
                    <div className="w-full h-64 border rounded-lg shadow-sm">
                        <MapComponentWrapper
                            center={formData.latlng || { lat: 35.6892, lng: 51.389 }}
                            selectedLocation={formData.latlng || null}
                            onLocationSelect={(coords: LatLng) => handleChange('latlng', coords)}
                        />
                    </div>

                    {/* تصاویر */}
                    <div>
                        <Label htmlFor="images">تصاویر</Label>
                        <Input id="images" type="file" accept="image/*" multiple onChange={handleFileChange} />
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {formData?.images?.map((img, idx) => (
                                <div key={idx} className="relative">
                                    <img
                                        src={img.startsWith('data:') ? img : `${process.env.NEXT_PUBLIC_API_URL}${img}`}
                                        alt={`تصویر ${idx + 1}`}
                                        className={`w-24 h-24 object-cover border rounded ${idx === formData.mainImageIndex ? 'border-blue-500' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1 right-1 text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                        onClick={() =>
                                            setFormData(prev => ({
                                                ...prev,
                                                images: prev?.images?.filter((_, i) => i !== idx),
                                                mainImageIndex: prev.mainImageIndex === idx ? 0 : prev.mainImageIndex,
                                            }))
                                        }
                                    >
                                        ×
                                    </button>
                                    <button
                                        type="button"
                                        className="absolute bottom-1 left-1 text-white bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                        onClick={() => setFormData(prev => ({ ...prev, mainImageIndex: idx }))}
                                    >
                                        ★
                                    </button>
                                </div>
                            ))}
                            {newFiles.map((file, idx) => (
                                <div key={`new-${idx}`} className="relative">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`new ${idx}`}
                                        className="w-24 h-24 object-cover border rounded border-green-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* امکانات چندزبانه */}
                    {supportedLanguages.map(lang => (
                        <div key={`facilities-${lang.code}`}>
                            <Label>امکانات ({lang.label})</Label>
                            <Input
                                placeholder="با کاما جدا کنید: وای‌فای, پارکینگ"
                                value={(formData.facilities?.[lang.code] || []).join(', ')}
                                onChange={e => handleFacilitiesChange(lang.code, e.target.value)}
                            />
                        </div>
                    ))}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            انصراف
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-green-600 to-teal-600">
                            {isSubmitting ? (location ? 'در حال ویرایش...' : 'در حال افزودن...') : location ? 'ویرایش لوکیشن' : 'افزودن لوکیشن'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
