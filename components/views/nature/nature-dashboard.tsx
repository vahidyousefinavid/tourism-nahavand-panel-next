'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { NaturePlaceApi, NaturePlaceItem } from '@/lib/NaturePlaceApi';

const LocationPickerMap = dynamic(
  () => import('./LocationPickerMap').then(m => m.LocationPickerMap),
  { ssr: false, loading: () => <div className="h-[280px] rounded-xl bg-gray-100 animate-pulse" /> },
);
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Plus, Edit, Trash2, Search, Mountain, ImageIcon, X, Database } from 'lucide-react';

const LANGS = [
  { code: 'fa', label: 'فارسی', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'zh', label: '中文', dir: 'ltr' },
];

const CATEGORY_LABELS: Record<string, string> = {
  waterfall: 'آبشار', river: 'رودخانه', mountain: 'کوه', forest: 'جنگل',
  valley: 'دره', lake: 'دریاچه', plain: 'دشت', spring: 'چشمه',
};
const CATEGORY_EMOJI: Record<string, string> = {
  waterfall: '💧', river: '🌊', mountain: '⛰', forest: '🌲',
  valley: '🏔', lake: '🏞', plain: '🌾', spring: '💦',
};
const SEASON_LABELS: Record<string, string> = {
  all: 'همه فصل‌ها', spring: 'بهار', summer: 'تابستان', autumn: 'پاییز', winter: 'زمستان',
};
const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'آسان', medium: 'متوسط', hard: 'سخت',
};
const DIFFICULTY_CLS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
};

type MLField = { fa: string; en: string; ar: string; zh: string };
const emptyML = (): MLField => ({ fa: '', en: '', ar: '', zh: '' });

interface FormState {
  name: MLField; desc: MLField; category: string; lat: number | null; lng: number | null;
  bestSeason: string; distanceKm: string; elevationM: string;
  difficulty: string; trailOrder: string; isActive: boolean; imageUrl: string;
}

const EMPTY: FormState = {
  name: emptyML(), desc: emptyML(), category: 'waterfall',
  lat: null, lng: null, bestSeason: 'all', distanceKm: '', elevationM: '',
  difficulty: 'easy', trailOrder: '', isActive: true, imageUrl: '',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function NatureDashboard() {
  const { toast } = useToast();
  const [items, setItems]     = useState<NaturePlaceItem[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<NaturePlaceItem | null>(null);
  const [form, setForm]         = useState<FormState>(EMPTY);
  const [activeLang, setActiveLang] = useState('fa');
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving]     = useState(false);
  const [seeding, setSeeding]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await NaturePlaceApi.getAll(1, 100, catFilter === 'all' ? undefined : catFilter);
      setItems(res.data);
      setTotal(res.total);
    } catch {
      toast({ title: 'خطا', description: 'بارگذاری مکان‌ها با خطا مواجه شد.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [catFilter]);

  const getName = (item: NaturePlaceItem) => {
    const n = item.name as any;
    return typeof n === 'object' ? (n.fa || n.en || '') : (n ?? '');
  };

  const filtered = items.filter(i => getName(i).toLowerCase().includes(search.toLowerCase()));

  const asML = (v: any): MLField =>
    typeof v === 'object' && v !== null ? { fa: v.fa ?? '', en: v.en ?? '', ar: v.ar ?? '', zh: v.zh ?? '' } : { fa: v ?? '', en: '', ar: '', zh: '' };

  const openCreate = () => {
    setEditing(null); setForm(EMPTY);
    setImageFile(null); setImagePreview(''); setActiveLang('fa'); setShowForm(true);
  };

  const openEdit = (item: NaturePlaceItem) => {
    setEditing(item);
    setForm({
      name: asML(item.name), desc: asML(item.desc),
      category: item.category, lat: item.lat, lng: item.lng,
      bestSeason: item.bestSeason, distanceKm: String(item.distanceKm),
      elevationM: String(item.elevationM), difficulty: item.difficulty,
      trailOrder: String(item.trailOrder), isActive: item.isActive,
      imageUrl: item.imageUrl ?? '',
    });
    setImageFile(null);
    setImagePreview(item.imageUrl ? `${API_URL}${item.imageUrl}` : '');
    setActiveLang('fa'); setShowForm(true);
  };

  const setML = (field: 'name' | 'desc', lang: string, val: string) =>
    setForm(f => ({ ...f, [field]: { ...f[field], [lang]: val } }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null); setImagePreview('');
    setForm(f => ({ ...f, imageUrl: '' }));
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.name.fa.trim() || form.lat === null || form.lng === null) {
      toast({ title: 'خطا', description: 'نام فارسی و موقعیت روی نقشه الزامی است.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        lat: form.lat, lng: form.lng,
        distanceKm: parseFloat(form.distanceKm) || 0,
        elevationM: parseInt(form.elevationM) || 0,
        trailOrder: parseInt(form.trailOrder) || 0,
      };
      if (editing) {
        await NaturePlaceApi.update(editing.id, data, imageFile);
        toast({ title: 'موفق', description: 'مکان ویرایش شد.' });
      } else {
        await NaturePlaceApi.create(data, imageFile);
        toast({ title: 'موفق', description: 'مکان جدید اضافه شد.' });
      }
      setShowForm(false); load();
    } catch {
      toast({ title: 'خطا', description: 'ذخیره با خطا مواجه شد.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این مکان مطمئنید؟')) return;
    try {
      await NaturePlaceApi.remove(id);
      toast({ title: 'موفق', description: 'مکان حذف شد.' }); load();
    } catch {
      toast({ title: 'خطا', description: 'حذف با خطا مواجه شد.', variant: 'destructive' });
    }
  };

  const handleSeed = async () => {
    if (!confirm('داده‌های اولیه (۱۲ مکان طبیعی) وارد شوند؟ اگر قبلاً وارد شده باشند تکرار نمی‌شود.')) return;
    setSeeding(true);
    try {
      const res = await NaturePlaceApi.seed();
      toast({ title: 'موفق', description: res.message });
      load();
    } catch {
      toast({ title: 'خطا', description: 'خطا در ایمپورت داده.', variant: 'destructive' });
    } finally { setSeeding(false); }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">مکان‌های طبیعی نهاوند</h1>
            <p className="text-gray-500 text-sm">مدیریت جاذبه‌های طبیعی و اکوتوریسم</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleSeed} variant="outline" size="sm" disabled={seeding} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              {seeding ? <RefreshCw className="h-4 w-4 ml-2 animate-spin" /> : <Database className="h-4 w-4 ml-2" />}
              ایمپورت داده‌های اولیه
            </Button>
            <Button onClick={load} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} /> بروزرسانی
            </Button>
            <Button onClick={openCreate} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 ml-2" /> مکان جدید
            </Button>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setCatFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${catFilter === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
            همه ({total})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <button key={k} onClick={() => setCatFilter(k)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${catFilter === k ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'}`}>
              <span>{CATEGORY_EMOJI[k]}</span> {v}
            </button>
          ))}
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold">لیست مکان‌ها</CardTitle>
                <Badge className="bg-emerald-100 text-emerald-800">{filtered.length} مکان</Badge>
              </div>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10 w-52" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-emerald-400" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Mountain className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400">مکانی یافت نشد</p>
                {items.length === 0 && (
                  <p className="text-gray-400 text-sm mt-2">برای وارد کردن ۱۲ مکان اولیه، دکمه «ایمپورت داده‌های اولیه» را بزنید.</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 w-16">تصویر</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">نام</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 hidden md:table-cell">دسته</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 hidden md:table-cell">فصل</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 hidden lg:table-cell">فاصله</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 hidden lg:table-cell">ارتفاع</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">سختی</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => {
                      const imgSrc = item.imageUrl ? `${API_URL}${item.imageUrl}` : null;
                      return (
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                          <td className="py-2 px-3">
                            {imgSrc ? <img src={imgSrc} alt="" className="w-12 h-10 rounded-lg object-cover" /> : (
                              <div className="w-12 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-lg">
                                {CATEGORY_EMOJI[item.category] ?? '🌿'}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-gray-800 line-clamp-1">{getName(item)}</div>
                            <div className="text-xs text-gray-400 mt-0.5">ترتیب مسیر: {item.trailOrder}</div>
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell">
                            <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg w-fit">
                              {CATEGORY_EMOJI[item.category]} {CATEGORY_LABELS[item.category] ?? item.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell text-xs text-gray-500">{SEASON_LABELS[item.bestSeason] ?? item.bestSeason}</td>
                          <td className="py-3 px-3 hidden lg:table-cell text-xs text-gray-500">{item.distanceKm} km</td>
                          <td className="py-3 px-3 hidden lg:table-cell text-xs text-gray-500">{item.elevationM.toLocaleString('fa-IR')} m</td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_CLS[item.difficulty] ?? DIFFICULTY_CLS.easy}`}>
                              {DIFFICULTY_LABELS[item.difficulty] ?? item.difficulty}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right">{editing ? 'ویرایش مکان طبیعی' : 'مکان جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 text-right">

            {/* تصویر */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">تصویر</label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden h-40 bg-gray-100 mb-2">
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  <button onClick={removeImage} className="absolute top-2 left-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                  <ImageIcon className="w-7 h-7 text-gray-300 mb-1" />
                  <span className="text-sm text-gray-400">انتخاب تصویر</span>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* Language tabs */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex border-b border-gray-200 bg-gray-50">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => setActiveLang(l.code)}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${activeLang === l.code ? 'bg-white text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
              {LANGS.map(l => activeLang === l.code && (
                <div key={l.code} className="p-4 space-y-3" dir={l.dir}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      نام {l.code === 'fa' && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      value={form.name[l.code as keyof MLField]}
                      onChange={e => setML('name', l.code, e.target.value)}
                      placeholder={`نام (${l.label})`}
                      className={l.dir === 'ltr' ? 'text-left' : ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">توضیحات</label>
                    <Textarea
                      value={form.desc[l.code as keyof MLField]}
                      onChange={e => setML('desc', l.code, e.target.value)}
                      placeholder={`توضیحات (${l.label})`}
                      rows={3}
                      className={l.dir === 'ltr' ? 'text-left' : ''}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* سایر فیلدها */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">دسته‌بندی <span className="text-red-500">*</span></label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{CATEGORY_EMOJI[k]} {v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">بهترین فصل</label>
                <Select value={form.bestSeason} onValueChange={v => setForm(f => ({ ...f, bestSeason: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEASON_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* انتخاب موقعیت روی نقشه */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                موقعیت مکانی <span className="text-red-500">*</span>
                <span className="font-normal text-gray-400 text-xs mr-1">(روی نقشه کلیک کنید)</span>
              </label>
              <LocationPickerMap
                lat={form.lat}
                lng={form.lng}
                onChange={(lat, lng) => setForm(f => ({ ...f, lat, lng }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">فاصله (km)</label>
                <Input type="number" step="any" min="0" value={form.distanceKm} onChange={e => setForm(f => ({ ...f, distanceKm: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ارتفاع (m)</label>
                <Input type="number" min="0" value={form.elevationM} onChange={e => setForm(f => ({ ...f, elevationM: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ترتیب مسیر</label>
                <Input type="number" min="0" value={form.trailOrder} onChange={e => setForm(f => ({ ...f, trailOrder: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">سختی مسیر</label>
                <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">آسان</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="hard">سخت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-emerald-600" />
                  <span className="text-sm font-semibold text-gray-700">نمایش در سایت</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                {saving && <RefreshCw className="w-4 h-4 animate-spin ml-2" />} ذخیره
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">انصراف</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
