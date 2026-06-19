'use client';

import { useState, useEffect, useRef } from 'react';
import { CreativeCityInitiative, InitiativeStatus } from '@/types';
import { CreativeCityInitiativeApi } from '@/lib/CreativeCityInitiativeApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Plus, Edit, Trash2, Search, Zap, Users, ImageIcon, X } from 'lucide-react';

const LANGS = [
  { code: 'fa', label: 'فارسی', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'zh', label: '中文', dir: 'ltr' },
];

const STATUS_CONFIG: Record<InitiativeStatus, { label: string; color: string }> = {
  active:    { label: 'فعال',        color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ongoing:   { label: 'در حال اجرا', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  planned:   { label: 'برنامه‌ریزی', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: 'تکمیل‌شده',  color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const SECTOR_LABELS: Record<string, string> = {
  handicrafts: 'صنایع دستی', music: 'موسیقی', gastronomy: 'گاسترونومی',
  tech: 'فناوری', education: 'آموزش', literature: 'ادبیات',
  architecture: 'معماری', visualArts: 'هنرهای تجسمی',
};

type MLField = { fa: string; en: string; ar: string; zh: string };
const emptyML = (): MLField => ({ fa: '', en: '', ar: '', zh: '' });

interface FormState {
  title: MLField; description: MLField; sector: string;
  status: InitiativeStatus; activityLevel: number;
  participantsCount: number; startYear: string; imageUrl: string;
}

const EMPTY: FormState = {
  title: emptyML(), description: emptyML(), sector: '', status: 'active',
  activityLevel: 50, participantsCount: 0, startYear: '', imageUrl: '',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function CreativeCityInitiativeDashboard() {
  const { toast } = useToast();
  const [items, setItems] = useState<CreativeCityInitiative[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CreativeCityInitiative | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [activeLang, setActiveLang] = useState('fa');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await CreativeCityInitiativeApi.getAll(
        1, 100,
        sectorFilter === 'all' ? undefined : sectorFilter,
        statusFilter === 'all' ? undefined : statusFilter,
      );
      setItems(res.data);
      setTotal(res.total);
    } catch {
      toast({ title: 'خطا', description: 'بارگذاری طرح‌ها با خطا مواجه شد.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [sectorFilter, statusFilter]);

  const getTitle = (item: CreativeCityInitiative) => {
    const t = item.title as any;
    return typeof t === 'object' ? (t.fa || t.en || '') : (t ?? '');
  };

  const filtered = items.filter(i =>
    getTitle(i).toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null); setForm(EMPTY);
    setImageFile(null); setImagePreview(''); setActiveLang('fa'); setShowForm(true);
  };

  const openEdit = (item: CreativeCityInitiative) => {
    setEditing(item);
    const asML = (v: any): MLField =>
      typeof v === 'object' && v !== null ? { fa: v.fa ?? '', en: v.en ?? '', ar: v.ar ?? '', zh: v.zh ?? '' } : { fa: v ?? '', en: '', ar: '', zh: '' };
    setForm({
      title: asML(item.title), description: asML((item as any).description),
      sector: item.sector, status: item.status,
      activityLevel: item.activityLevel, participantsCount: item.participantsCount,
      startYear: item.startYear ?? '', imageUrl: item.imageUrl ?? '',
    });
    setImageFile(null);
    setImagePreview(item.imageUrl ? `${API_URL}${item.imageUrl}` : '');
    setActiveLang('fa'); setShowForm(true);
  };

  const setML = (field: 'title' | 'description', lang: string, val: string) =>
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
    if (!form.title.fa.trim() || !form.sector) {
      toast({ title: 'خطا', description: 'عنوان فارسی و حوزه الزامی است.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const data = { ...form };
      if (editing) {
        await CreativeCityInitiativeApi.update(editing.id, data, imageFile);
        toast({ title: 'موفق', description: 'طرح ویرایش شد.' });
      } else {
        await CreativeCityInitiativeApi.create(data, imageFile);
        toast({ title: 'موفق', description: 'طرح جدید ایجاد شد.' });
      }
      setShowForm(false); load();
    } catch {
      toast({ title: 'خطا', description: 'ذخیره با خطا مواجه شد.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این طرح مطمئنید؟')) return;
    try {
      await CreativeCityInitiativeApi.remove(id);
      toast({ title: 'موفق', description: 'طرح حذف شد.' }); load();
    } catch {
      toast({ title: 'خطا', description: 'حذف با خطا مواجه شد.', variant: 'destructive' });
    }
  };

  const counts: Record<string, number> = {};
  for (const s of Object.keys(STATUS_CONFIG)) counts[s] = items.filter(i => i.status === s).length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">طرح‌های فعال شهر خلاق</h1>
            <p className="text-gray-500 text-sm">مدیریت طرح‌ها و ابتکارات خلاقانه نهاوند</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={load} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} /> بروزرسانی
            </Button>
            <Button onClick={openCreate} size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 ml-2" /> طرح جدید
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {(Object.entries(STATUS_CONFIG) as [InitiativeStatus, { label: string; color: string }][]).map(([key, cfg]) => (
            <Card key={key} className="border-0 shadow-md cursor-pointer hover:shadow-lg" onClick={() => setStatusFilter(key)}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-xs text-gray-500 mb-1">{cfg.label}</p><p className="text-2xl font-bold">{counts[key] ?? 0}</p></div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cfg.color}`}><Zap className="w-5 h-5" /></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold">لیست طرح‌ها</CardTitle>
                <Badge className="bg-purple-100 text-purple-800">{filtered.length} طرح</Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10 w-44" />
                </div>
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="همه حوزه‌ها" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه حوزه‌ها</SelectItem>
                    {Object.entries(SECTOR_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="همه وضعیت‌ها" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="active">فعال</SelectItem>
                    <SelectItem value="ongoing">در حال اجرا</SelectItem>
                    <SelectItem value="planned">برنامه‌ریزی</SelectItem>
                    <SelectItem value="completed">تکمیل‌شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-purple-400" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16"><Zap className="w-14 h-14 text-gray-200 mx-auto mb-4" /><p className="text-gray-400">طرحی یافت نشد</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 w-16">تصویر</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">عنوان</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 hidden md:table-cell">حوزه</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 hidden md:table-cell">پیشرفت</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 hidden lg:table-cell">شرکت‌کننده</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">وضعیت</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => {
                      const cfg = STATUS_CONFIG[item.status];
                      const imgSrc = item.imageUrl ? `${API_URL}${item.imageUrl}` : null;
                      return (
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                          <td className="py-2 px-3">
                            {imgSrc ? <img src={imgSrc} alt="" className="w-12 h-10 rounded-lg object-cover" /> : (
                              <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-300" /></div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-gray-800 line-clamp-1 max-w-[180px]">{getTitle(item)}</div>
                            {item.startYear && <div className="text-xs text-gray-400 mt-0.5">{item.startYear}</div>}
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell">
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">{SECTOR_LABELS[item.sector] ?? item.sector}</span>
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell">
                            <div className="flex items-center gap-2 w-24">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${item.activityLevel}%` }} />
                              </div>
                              <span className="text-xs text-gray-500">{item.activityLevel}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 hidden lg:table-cell">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Users className="w-3 h-3" />{item.participantsCount.toLocaleString('fa-IR')}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
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
            <DialogTitle className="text-xl font-bold text-right">{editing ? 'ویرایش طرح' : 'طرح جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 text-right">

            {/* تصویر */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">تصویر طرح</label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden h-44 bg-gray-100 mb-2">
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  <button onClick={removeImage} className="absolute top-2 left-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-all">
                  <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                  <span className="text-sm text-gray-400">انتخاب تصویر</span>
                  <span className="text-xs text-gray-300 mt-1">JPG, PNG تا ۵ مگابایت</span>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* Language tabs */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex border-b border-gray-200 bg-gray-50">
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setActiveLang(l.code)}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${activeLang === l.code ? 'bg-white text-purple-700 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              {LANGS.map(l => activeLang === l.code && (
                <div key={l.code} className="p-4 space-y-3" dir={l.dir}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      عنوان طرح {l.code === 'fa' && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      value={form.title[l.code as keyof MLField]}
                      onChange={e => setML('title', l.code, e.target.value)}
                      placeholder={`عنوان (${l.label})`}
                      className={l.dir === 'ltr' ? 'text-left' : ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">توضیحات</label>
                    <Textarea
                      value={form.description[l.code as keyof MLField]}
                      onChange={e => setML('description', l.code, e.target.value)}
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">حوزه <span className="text-red-500">*</span></label>
                <Select value={form.sector} onValueChange={v => setForm(f => ({ ...f, sector: v }))}>
                  <SelectTrigger><SelectValue placeholder="انتخاب حوزه..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SECTOR_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">وضعیت</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as InitiativeStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">فعال</SelectItem>
                    <SelectItem value="ongoing">در حال اجرا</SelectItem>
                    <SelectItem value="planned">برنامه‌ریزی</SelectItem>
                    <SelectItem value="completed">تکمیل‌شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">درصد پیشرفت ({form.activityLevel}%)</label>
                <input type="range" min={0} max={100} value={form.activityLevel}
                  onChange={e => setForm(f => ({ ...f, activityLevel: +e.target.value }))}
                  className="w-full accent-purple-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">تعداد شرکت‌کنندگان</label>
                <Input type="number" min={0} value={form.participantsCount}
                  onChange={e => setForm(f => ({ ...f, participantsCount: +e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">سال شروع</label>
              <Input value={form.startYear} onChange={e => setForm(f => ({ ...f, startYear: e.target.value }))} placeholder="مثال: ۱۴۰۳" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-700">
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
