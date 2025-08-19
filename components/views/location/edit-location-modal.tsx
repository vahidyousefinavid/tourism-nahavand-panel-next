'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Location {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  location: string; // bigint as string
  latlang: string;
  price: string;
  capacity: string;
  registered: string;
  organizer: string;
}

interface UpdateLocationDto {
  title: string;
  description: string;
  date: string;
  location: string;
  latlang: string;
  price: string;
  capacity: string;
  registered: string;
  organizer: string;
}

interface EditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (location: UpdateLocationDto) => void;
  locationData: Location | null;
}

export function EditLocationModal({ isOpen, onClose, onSubmit, locationData }: EditLocationModalProps) {
  const [formData, setFormData] = useState<UpdateLocationDto>({
    title: '',
    description: '',
    date: '',
    location: '',
    latlang: '',
    price: '',
    capacity: '',
    registered: '',
    organizer: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (locationData && isOpen) {
      setFormData({
        title: locationData.title || '',
        description: locationData.description || '',
        date: locationData.date || '',
        location: locationData.location || '',
        latlang: locationData.latlang || '',
        price: locationData.price || '',
        capacity: locationData.capacity || '',
        registered: locationData.registered || '',
        organizer: locationData.organizer || '',
      });
      setErrors({});
    }
  }, [locationData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'عنوان الزامی است';
    if (!formData.description.trim()) newErrors.description = 'توضیحات الزامی است';
    if (!formData.date.trim()) newErrors.date = 'تاریخ الزامی است';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) newErrors.date = 'تاریخ باید به فرمت YYYY-MM-DD باشد';

    if (!formData.location.trim()) newErrors.location = 'مکان (bigint) الزامی است';
    else if (!/^\d+$/.test(formData.location)) newErrors.location = 'مکان باید عدد صحیح باشد';

    if (!formData.latlang.trim()) newErrors.latlang = 'مختصات الزامی است';

    if (!formData.price.trim()) newErrors.price = 'قیمت الزامی است';

    if (!formData.capacity.trim()) newErrors.capacity = 'ظرفیت الزامی است';
    else if (!/^\d+$/.test(formData.capacity)) newErrors.capacity = 'ظرفیت باید عدد صحیح باشد';

    if (!formData.registered.trim()) newErrors.registered = 'تعداد ثبت‌نام شده الزامی است';
    else if (!/^\d+$/.test(formData.registered)) newErrors.registered = 'تعداد ثبت‌نام شده باید عدد صحیح باشد';

    if (!formData.organizer.trim()) newErrors.organizer = 'برگزارکننده الزامی است';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof UpdateLocationDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">ویرایش مکان</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
              placeholder="عنوان مکان"
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="description">توضیحات *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={errors.description ? 'border-red-500' : ''}
              placeholder="توضیحات مکان"
              rows={4}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label htmlFor="date">تاریخ *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
          </div>

          <div>
            <Label htmlFor="location">مکان (bigint) *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className={errors.location ? 'border-red-500' : ''}
              placeholder="مثلا 123456789012345"
            />
            {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
          </div>

          <div>
            <Label htmlFor="latlang">مختصات (latlang) *</Label>
            <Input
              id="latlang"
              value={formData.latlang}
              onChange={(e) => handleChange('latlang', e.target.value)}
              className={errors.latlang ? 'border-red-500' : ''}
              placeholder="مثلا 35.6892,51.3890"
            />
            {errors.latlang && <p className="text-sm text-red-500 mt-1">{errors.latlang}</p>}
          </div>

          <div>
            <Label htmlFor="price">قیمت *</Label>
            <Input
              id="price"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className={errors.price ? 'border-red-500' : ''}
              placeholder="قیمت به تومان"
            />
            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
          </div>

          <div>
            <Label htmlFor="capacity">ظرفیت *</Label>
            <Input
              id="capacity"
              value={formData.capacity}
              onChange={(e) => handleChange('capacity', e.target.value)}
              className={errors.capacity ? 'border-red-500' : ''}
              placeholder="مثلا 100"
            />
            {errors.capacity && <p className="text-sm text-red-500 mt-1">{errors.capacity}</p>}
          </div>

          <div>
            <Label htmlFor="registered">تعداد ثبت‌نام شده *</Label>
            <Input
              id="registered"
              value={formData.registered}
              onChange={(e) => handleChange('registered', e.target.value)}
              className={errors.registered ? 'border-red-500' : ''}
              placeholder="مثلا 20"
            />
            {errors.registered && <p className="text-sm text-red-500 mt-1">{errors.registered}</p>}
          </div>

          <div>
            <Label htmlFor="organizer">برگزارکننده *</Label>
            <Input
              id="organizer"
              value={formData.organizer}
              onChange={(e) => handleChange('organizer', e.target.value)}
              className={errors.organizer ? 'border-red-500' : ''}
              placeholder="نام برگزارکننده"
            />
            {errors.organizer && <p className="text-sm text-red-500 mt-1">{errors.organizer}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isSubmitting ? 'در حال بروزرسانی...' : 'بروزرسانی مکان'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
