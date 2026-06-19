'use client';

import { useState, useEffect } from 'react';
import { InvestmentSuggestion, SuggestionStatus } from '@/types';
import { SuggestionAPI } from '@/lib/SuggestionApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, Eye, Trash2, RefreshCw, Search, Lightbulb, User, Phone, Mail, FileText, DollarSign, MapPin, AlertCircle } from 'lucide-react';

const STATUS_CONFIG: Record<SuggestionStatus, { label: string; color: string; icon: any }> = {
  pending:  { label: 'در انتظار', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  reviewed: { label: 'بررسی شده', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Eye },
  approved: { label: 'تأیید شده', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
  rejected: { label: 'رد شده', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

const CATEGORY_LABELS: Record<string, string> = {
  'real-estate': 'املاک', agriculture: 'کشاورزی', tourism: 'گردشگری',
  handicrafts: 'صنایع دستی', industry: 'صنعت', technology: 'فناوری',
};

export function SuggestionDashboard() {
  const { toast } = useToast();
  const [items, setItems] = useState<InvestmentSuggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<InvestmentSuggestion | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [newStatus, setNewStatus] = useState<SuggestionStatus>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await SuggestionAPI.getAll(1, 100, statusFilter === 'all' ? undefined : statusFilter);
      setItems(res.data);
      setTotal(res.total);
    } catch {
      toast({ title: 'خطا', description: 'بارگذاری پیشنهادات با خطا مواجه شد.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.fullName.toLowerCase().includes(search.toLowerCase()) ||
    i.phone.includes(search)
  );

  const openDetail = (item: InvestmentSuggestion) => {
    setSelected(item);
    setNewStatus(item.status);
    setAdminNotes(item.adminNotes || '');
    setShowDetail(true);
  };

  const handleUpdateStatus = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      await SuggestionAPI.updateStatus(selected.id, newStatus, adminNotes);
      toast({ title: 'موفق', description: 'وضعیت پیشنهاد به‌روزرسانی شد.' });
      setShowDetail(false);
      load();
    } catch {
      toast({ title: 'خطا', description: 'به‌روزرسانی با خطا مواجه شد.', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این پیشنهاد مطمئنید؟')) return;
    try {
      await SuggestionAPI.remove(id);
      toast({ title: 'موفق', description: 'پیشنهاد حذف شد.' });
      setShowDetail(false);
      load();
    } catch {
      toast({ title: 'خطا', description: 'حذف با خطا مواجه شد.', variant: 'destructive' });
    }
  };

  const counts = {
    pending: items.filter(i => i.status === 'pending').length,
    reviewed: items.filter(i => i.status === 'reviewed').length,
    approved: items.filter(i => i.status === 'approved').length,
    rejected: items.filter(i => i.status === 'rejected').length,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">پیشنهادات سرمایه‌گذاری شهروندی</h1>
            <p className="text-gray-500 text-sm">بررسی و پیگیری ایده‌های سرمایه‌گذاری ارسال‌شده توسط شهروندان</p>
          </div>
          <Button onClick={load} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            بروزرسانی
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {(Object.entries(STATUS_CONFIG) as [SuggestionStatus, typeof STATUS_CONFIG[SuggestionStatus]][]).map(([key, cfg]) => (
            <Card key={key} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter(key)}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{cfg.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{counts[key]}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
                    <cfg.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-xl mb-0">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold">لیست پیشنهادات</CardTitle>
                <Badge className="bg-purple-100 text-purple-800">{filtered.length} پیشنهاد</Badge>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10 w-52" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="همه وضعیت‌ها" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                    <SelectItem value="pending">در انتظار</SelectItem>
                    <SelectItem value="reviewed">بررسی شده</SelectItem>
                    <SelectItem value="approved">تأیید شده</SelectItem>
                    <SelectItem value="rejected">رد شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Lightbulb className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400">پیشنهادی یافت نشد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">نام</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">عنوان پیشنهاد</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 hidden md:table-cell">حوزه</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 hidden lg:table-cell">تاریخ</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">وضعیت</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => {
                      const cfg = STATUS_CONFIG[item.status];
                      return (
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-gray-800">{item.fullName}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{item.phone}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-gray-700 line-clamp-1 max-w-[220px]">{item.title}</div>
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell">
                            {item.category ? (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                                {CATEGORY_LABELS[item.category] ?? item.category}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="py-3 px-3 text-xs text-gray-400 hidden lg:table-cell">
                            {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
                              <cfg.icon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openDetail(item)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right">جزئیات پیشنهاد</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5 text-right">
              {/* اطلاعات فردی */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm"><User className="w-4 h-4 text-purple-500" />اطلاعات پیشنهاددهنده</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400 text-xs">نام:</span><p className="font-semibold text-gray-800">{selected.fullName}</p></div>
                  <div><span className="text-gray-400 text-xs">شماره:</span><p className="font-semibold text-gray-800 dir-ltr">{selected.phone}</p></div>
                  {selected.email && <div><span className="text-gray-400 text-xs">ایمیل:</span><p className="font-semibold text-gray-800">{selected.email}</p></div>}
                  {selected.nationalCode && <div><span className="text-gray-400 text-xs">کد ملی:</span><p className="font-semibold text-gray-800">{selected.nationalCode}</p></div>}
                </div>
              </div>

              {/* جزئیات پیشنهاد */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-purple-500" />جزئیات پیشنهاد</h3>
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                  <p className="font-bold text-gray-900 text-base mb-2">{selected.title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{selected.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selected.category && <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-400 text-xs block mb-1">حوزه</span><span className="font-semibold">{CATEGORY_LABELS[selected.category] ?? selected.category}</span></div>}
                  {selected.investmentArea && <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-400 text-xs block mb-1">منطقه</span><span className="font-semibold">{selected.investmentArea}</span></div>}
                  {selected.estimatedAmount && <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-400 text-xs block mb-1">تخمین سرمایه</span><span className="font-semibold">{selected.estimatedAmount.amount.toLocaleString('fa-IR')} {selected.estimatedAmount.currency}</span></div>}
                  {selected.expectedReturn && <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-400 text-xs block mb-1">بازده انتظاری</span><span className="font-semibold">{selected.expectedReturn}</span></div>}
                  {selected.timeframe && <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-400 text-xs block mb-1">بازه زمانی</span><span className="font-semibold">{selected.timeframe}</span></div>}
                </div>
                {selected.additionalNotes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                    <p className="font-semibold mb-1">توضیحات تکمیلی:</p>
                    <p className="leading-relaxed">{selected.additionalNotes}</p>
                  </div>
                )}
              </div>

              {/* تغییر وضعیت */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h3 className="font-bold text-gray-700 text-sm">تغییر وضعیت</h3>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as SuggestionStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">در انتظار</SelectItem>
                    <SelectItem value="reviewed">بررسی شده</SelectItem>
                    <SelectItem value="approved">تأیید شده</SelectItem>
                    <SelectItem value="rejected">رد شده</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="یادداشت ادمین (اختیاری)..."
                  rows={3}
                />
                <div className="flex gap-3">
                  <Button onClick={handleUpdateStatus} disabled={updating} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    {updating ? <RefreshCw className="w-4 h-4 animate-spin ml-2" /> : null}
                    ذخیره وضعیت
                  </Button>
                  <Button variant="outline" onClick={() => handleDelete(selected.id)} className="text-red-500 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
