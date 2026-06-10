'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateEventDto, UpdateEventDto, Event, EventTimeRange, MoneyValue } from '@/types';
import { MoneyInput } from '@/components/ui/money-input';
import { TimeRangePicker } from './time-range-picker';
import MapComponentWrapper from '@/components/ui/mapPicker';

const supportedLanguages = [
    { code: 'fa', label: 'فارسی' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'zh', label: '中文' },
];

type MLKeys = 'title' | 'description' | 'location' | 'organizer';

interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (eventData: FormData) => Promise<void>;
    event?: Event | null; // اگر پاس داده شد، حالت ویرایش است
}

export function EventFormModal({ isOpen, onClose, onSubmit, event }: EventFormModalProps) {
    const [formData, setFormData] = useState<CreateEventDto | UpdateEventDto>({
        title: { fa: '', en: '', ar: '', zh: '' } as any,
        description: { fa: '', en: '', ar: '', zh: '' } as any,
        location: { fa: '', en: '', ar: '', zh: '' } as any,
        organizer: { fa: '', en: '', ar: '', zh: '' } as any,
        image: '',
        latlng: { lat: 35.6892, lng: 51.389 },
        price: undefined,
        capacity: 0,
        registered: 0,
        timeRanges: [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // پر کردن فرم در حالت ویرایش
    useEffect(() => {
        if (isOpen) {
            if (event) {
                // حالت ویرایش
                setFormData({
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    organizer: event.organizer,
                    image: event.image || '',
                    latlng: event.latlng || { lat: 35.6892, lng: 51.389 },
                    price: event.price ?? undefined,
                    capacity: event.capacity ?? 0,
                    registered: event.registered ?? 0,
                    timeRanges: event.timeRanges || [],
                });
            } else {
                // حالت افزودن => فرم ریست شود
                setFormData({
                    title: { fa: '', en: '', ar: '', zh: '' } as any,
                    description: { fa: '', en: '', ar: '', zh: '' } as any,
                    location: { fa: '', en: '', ar: '', zh: '' } as any,
                    organizer: { fa: '', en: '', ar: '', zh: '' } as any,
                    image: '',
                    latlng: { lat: 35.6892, lng: 51.389 },
                    price: undefined,
                    capacity: 0,
                    registered: 0,
                    timeRanges: [],
                });
            }
            setErrors({});
        }
    }, [event, isOpen]);


    const handleChange = (field: keyof CreateEventDto | keyof UpdateEventDto, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleMultiLangChange = (field: MLKeys, lang: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: { ...(prev as any)[field], [lang]: value },
        }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title?.fa.trim()) newErrors.title = 'عنوان فارسی الزامی است';
        if (!formData.description?.fa.trim()) newErrors.description = 'توضیحات فارسی الزامی است';
        if (!formData.location?.fa.trim()) newErrors.location = 'مکان فارسی الزامی است';
        if (!formData.organizer?.fa.trim()) newErrors.organizer = 'برگزارکننده فارسی الزامی است';
        if (formData.capacity !== undefined && (formData.capacity < 0 || !Number.isInteger(formData.capacity))) {
            newErrors.capacity = 'ظرفیت باید عدد صحیح مثبت باشد';
        }
        if (formData.price !== undefined && formData.price < 0) {
            newErrors.price = 'قیمت نامعتبر است';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = new FormData();

            const fileInput = document.getElementById("image") as HTMLInputElement;
            if (fileInput?.files?.[0]) {
                payload.append("image", fileInput.files[0]);
            }

            const copy = { ...formData };
            delete copy.image;
            payload.append("dto", JSON.stringify(copy));

            await onSubmit(payload);

            if (!event) { // در حالت افزودن، فرم ریست شود
                setFormData({
                    title: { fa: '', en: '', ar: '', zh: '' } as any,
                    description: { fa: '', en: '', ar: '', zh: '' } as any,
                    location: { fa: '', en: '', ar: '', zh: '' } as any,
                    organizer: { fa: '', en: '', ar: '', zh: '' } as any,
                    image: '',
                    latlng: { lat: 35.6892, lng: 51.389 },
                    price: undefined,
                    capacity: 0,
                    registered: 0,
                    timeRanges: [],
                });
                setErrors({});
            }

            onClose();
        } catch (err) {
            console.error("Error submitting event:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const multilingualFields: { key: MLKeys; label: string; isTextarea?: boolean }[] = [
        { key: 'title', label: 'عنوان' },
        { key: 'description', label: 'توضیحات', isTextarea: true },
        { key: 'location', label: 'مکان' },
        { key: 'organizer', label: 'برگزارکننده' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        {event ? 'ویرایش رویداد' : 'افزودن رویداد جدید'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {multilingualFields.map(({ key, label, isTextarea }) => (
                        <div key={key}>
                            <Label>{label} *</Label>
                            <div className="mt-2 space-y-2">
                                {supportedLanguages.map((lang) => (
                                    <div key={`${key}-${lang.code}`}>
                                        <Label className="text-xs opacity-70 mb-1 block">{`${label} (${lang.label})`}</Label>
                                        {isTextarea ? (
                                            <Textarea
                                                value={(formData as any)[key][lang.code] || ''}
                                                onChange={(e) => handleMultiLangChange(key, lang.code, e.target.value)}
                                                placeholder={`${label} (${lang.label})`}
                                                className={errors[key] && lang.code === 'fa' ? 'border-red-500' : ''}
                                                rows={4}
                                            />
                                        ) : (
                                            <Input
                                                value={(formData as any)[key][lang.code] || ''}
                                                onChange={(e) => handleMultiLangChange(key, lang.code, e.target.value)}
                                                placeholder={`${label} (${lang.label})`}
                                                className={errors[key] && lang.code === 'fa' ? 'border-red-500' : ''}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors[key] && <p className="text-sm text-red-500 mt-1">{errors[key]}</p>}
                        </div>
                    ))}

                    {/* نقشه */}
                    <div className="w-full h-64 border rounded-lg shadow-sm">
                        <MapComponentWrapper
                            center={formData.latlng || { lat: 35.6892, lng: 51.389 }}
                            selectedLocation={formData.latlng || null}
                            onLocationSelect={(coords: any) => handleChange('latlng', coords)}
                        />
                    </div>

                    {/* تصویر */}
                    <div>
                        <Label htmlFor="image">تصویر رویداد</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        handleChange('image', reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        {formData.image && (
                            <div className="mt-2">
                                <img
                                    src={
                                        formData.image.startsWith('data:')
                                            ? formData.image
                                            : `${process.env.NEXT_PUBLIC_API_URL}${formData.image}`
                                    }
                                    alt="پیش‌نمایش"
                                    className="w-32 h-32 object-cover rounded border"
                                />
                            </div>
                        )}
                    </div>

                    {/* قیمت */}
                    <div>
                        <Label>قیمت بلیت</Label>
                        <MoneyInput
                            value={(formData.price as MoneyValue | undefined) ?? undefined}
                            onChange={(v) => handleChange('price', v)}
                            placeholder="مبلغ"
                        />
                        {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                    </div>

                    {/* ظرفیت */}
                    <div>
                        <Label htmlFor="capacity">ظرفیت</Label>
                        <Input
                            id="capacity"
                            type="number"
                            value={formData.capacity ?? 0}
                            onChange={(e) => handleChange('capacity', Number(e.target.value))}
                            min={0}
                            step={1}
                        />
                        {errors.capacity && <p className="text-sm text-red-500 mt-1">{errors.capacity}</p>}
                    </div>

                    {/* بازه‌های زمانی */}
                    <div>
                        <Label htmlFor="timeRanges">بازه‌های زمانی</Label>
                        <TimeRangePicker
                            value={(formData.timeRanges || []) as EventTimeRange[]}
                            onChange={(ranges: EventTimeRange[]) => handleChange('timeRanges', ranges)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            انصراف
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            {isSubmitting ? (event ? 'در حال ویرایش...' : 'در حال افزودن...') : event ? 'ویرایش رویداد' : 'افزودن رویداد'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
