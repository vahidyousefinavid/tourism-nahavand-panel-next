'use client';

import { useState, useEffect, useRef } from 'react';
import { CreativeCityNews, NewsStatus } from '@/types';
import { CreativeCityNewsApi } from '@/lib/CreativeCityNewsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Newspaper, RefreshCw, Plus, Edit, Trash2, Search,
  CheckCircle, FileText, Rocket, ImageIcon, X,
} from 'lucide-react';

const LANGS = [
  { code: 'fa', label: 'فارسی', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'zh', label: '中文', dir: 'ltr' },
];

const STATUS_CONFIG: Record<NewsStatus, { label: string; color: string }> = {
  draft:     { label: 'پیش‌نویس',  color: 'bg-gray-100 text-gray-700 border-gray-200' },
  published: { label: 'منتشرشده', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const CATEGORY_LABELS: Record<string, string> = {
  event: 'رویداد', announcement: 'اطلاعیه', program: 'برنامه', achievement: 'دستاورد',
};

type MLField = { fa: string; en: string; ar: string; zh: string };
const emptyML = (): MLField => ({ fa: '', en: '', ar: '', zh: '' });

interface FormState {
  title: MLField; summary: MLField; content: MLField;
  imageUrl: string; category: string; status: NewsStatus;
}

const EMPTY: FormState = {
  title: emptyML(), summary: emptyML(), content: emptyML(),
  imageUrl: '', category: '', status: 'draft',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function CreativeCityNewsDashboard() {
  const { toast } = useToast();
  const [items, setItems] = useState<CreativeCityNews[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CreativeCityNews | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [activeLang, setActiveLang] = useState('fa');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await CreativeCityNewsApi.getAll(1, 100, statusFilter === 'all' ? undefined : statusFilter);
      setItems(res.data);
      setTotal(res.total);
    } catch {
      toast({ title: 'خطا', description: 'بارگذاری اخبار با خطا مواجه شد.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const getTitle = (item: CreativeCityNews) => {
    const t = item.title as any;
    return typeof t === 'object' ? (t.fa || t.en || '') : (t ?? '');
  };

  const getSummary = (item: CreativeCityNews) => {
    const s = item.summary as any;
    return typeof s === 'object' ? (s.fa || s.en || '') : (s ?? '');
  };

  const filtered = items.filter(i =>
    getTitle(i).toLowerCase().includes(search.toLowerCase()) ||
    getSummary(i).toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null); setForm(EMPTY);
    setImageFile(null); setImagePreview(''); setActiveLang('fa'); setShowForm(true);
  };

  const openEdit = (item: CreativeCityNews) => {
    setEditing(item);
    const asML = (v: any): MLField =>
      typeof v === 'object' && v !== null ? { fa: v.fa ?? '', en: v.en ?? '', ar: v.ar ?? '', zh: v.zh ?? '' } : { fa: v ?? '', en: '', ar: '', zh: '' };
    setForm({
      title: asML(item.title), summary: asML(item.summary),
      content: asML((item as any).content), imageUrl: item.imageUrl ?? '',
      category: item.category ?? '', status: item.status,
    });
    setImageFile(null);
    setImagePreview(item.imageUrl ? `${API_URL}${item.imageUrl}` : '');
    setActiveLang('fa'); setShowForm(true);
  };

  const setML = (field: 'title' | 'summary' | 'content', lang: string, val: string) =>
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
    if (!form.title.fa.trim() || !form.summary.fa.trim()) {
      toast({ title: 'خطا', description: 'عنوان و خلاصه فارسی الزامی است.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const data = { ...form };
      if (editing) {
        await CreativeCityNewsApi.update(editing.id, data, imageFile);
        toast({ title: 'موفق', description: 'خبر ویرایش شد.' });
      } else {
        await CreativeCityNewsApi.create(data, imageFile);
        toast({ title: 'موفق', description: 'خبر جدید ایجاد شد.' });
      }
      setShowForm(false); load();
    } catch {
      toast({ title: 'خطا', description: 'ذخیره با خطا مواجه شد.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handlePublish = async (item: CreativeCityNews) => {
    try {
      await CreativeCityNewsApi.publish(item.id);
      toast({ title: 'موفق', description: 'خبر منتشر شد.' }); load();
    } catch {
      toast({ title: 'خطا', description: 'انتشار با خطا مواجه شد.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این خبر مطمئنید؟')) return;
    try {
      await CreativeCityNewsApi.remove(id);
      toast({ title: 'موفق', description: 'خبر حذف شد.' }); load();
    } catch {
      toast({ title: 'خطا', description: 'حذف با خطا مواجه شد.', variant: 'destructive' });
    }
  };

  const counts = {
    draft: items.filter(i => i.status === 'draft').length,
    published: items.filter(i => i.status === 'published').length,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">اخبار شهر خلاق</h1>
            <p className="text-gray-500 text-sm">مدیریت اخبار و رویدادهای شهر خلاق نهاوند</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={load} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} /> بروزرسانی
            </Button>
            <Button onClick={openCreate} size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 ml-2" /> خبر جدید
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-md col-span-1">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500 mb-1">کل اخبار</p><p className="text-2xl font-bold">{total}</p></div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center"><Newspaper className="w-5 h-5" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md cursor-pointer hover:shadow-lg" onClick={() => setStatusFilter('published')}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500 mb-1">منتشرشده</p><p className="text-2xl font-bold">{counts.published}</p></div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><CheckCircle className="w-5 h-5" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md cursor-pointer hover:shadow-lg" onClick={() => setStatusFilter('draft')}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500 mb-1">پیش‌نویس</p><p className="text-2xl font-bold">{counts.draft}</p></div>
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md cursor-pointer hover:shadow-lg" onClick={() => setStatusFilter('all')}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500 mb-1">نمایش همه</p><p className="text-2xl font-bold">↺</p></div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><RefreshCw className="w-5 h-5" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold">لیست اخبار</CardTitle>
                <Badge className="bg-purple-100 text-purple-800">{filtered.length} خبر</Badge>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10 w-52" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="همه" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="published">منتشرشده</SelectItem>
                    <SelectItem value="draft">پیش‌نویس</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-purple-400" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16"><Newspaper className="w-14 h-14 text-gray-200 mx-auto mb-4" /><p className="text-gray-400">خبری یافت نشد</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 w-16">تصویر</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">عنوان</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 hidden md:table-cell">دسته</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">وضعیت</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 hidden lg:table-cell">تاریخ</th>
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
                            <div className="font-semibold text-gray-800 line-clamp-1 max-w-[260px]">{getTitle(item)}</div>
                            <div className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[260px]">{getSummary(item)}</div>
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell">
                            {item.category ? <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">{CATEGORY_LABELS[item.category] ?? item.category}</span> : '—'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                          </td>
                          <td className="py-3 px-3 text-xs text-gray-400 hidden lg:table-cell">
                            {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              {item.status === 'draft' && (
                                <Button variant="ghost" size="sm" onClick={() => handlePublish(item)} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" title="انتشار">
                                  <Rocket className="h-4 w-4" />
                                </Button>
                              )}
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
            <DialogTitle className="text-xl font-bold text-right">{editing ? 'ویرایش خبر' : 'خبر جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 text-right">

            {/* تصویر */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">تصویر خبر</label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden h-44 bg-gray-100 mb-2">
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  <button onClick={removeImage} className="absolute top-2 left-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors">
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
              {/* Tab bar */}
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

              {/* Fields per language */}
              {LANGS.map(l => activeLang === l.code && (
                <div key={l.code} className="p-4 space-y-3" dir={l.dir}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      عنوان {l.code === 'fa' && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      value={form.title[l.code as keyof MLField]}
                      onChange={e => setML('title', l.code, e.target.value)}
                      placeholder={`عنوان (${l.label})`}
                      className={l.dir === 'ltr' ? 'text-left' : ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      خلاصه {l.code === 'fa' && <span className="text-red-500">*</span>}
                    </label>
                    <Textarea
                      value={form.summary[l.code as keyof MLField]}
                      onChange={e => setML('summary', l.code, e.target.value)}
                      placeholder={`خلاصه (${l.label})`}
                      rows={2}
                      className={l.dir === 'ltr' ? 'text-left' : ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">متن کامل</label>
                    <Textarea
                      value={form.content[l.code as keyof MLField]}
                      onChange={e => setML('content', l.code, e.target.value)}
                      placeholder={`متن کامل (${l.label})`}
                      rows={4}
                      className={l.dir === 'ltr' ? 'text-left' : ''}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Category + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">دسته‌بندی</label>
                <Select value={form.category ?? ''} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="انتخاب دسته..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">رویداد</SelectItem>
                    <SelectItem value="announcement">اطلاعیه</SelectItem>
                    <SelectItem value="program">برنامه</SelectItem>
                    <SelectItem value="achievement">دستاورد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">وضعیت</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as NewsStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">پیش‌نویس</SelectItem>
                    <SelectItem value="published">منتشر شود</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
