'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, TrendingUp, RefreshCw, ArrowLeft, Activity } from 'lucide-react';
import { EventAPI } from '@/lib/EventApi';
import { LocationAPI } from '@/lib/LocationApi';
import { InvestmentAPI } from '@/lib/InvestmentApi';
import { Toaster } from '@/components/ui/toaster';

const CARDS = [
  {
    key: 'locations',
    title: 'مکان‌های دیدنی',
    icon: MapPin,
    href: '/location',
    addLabel: 'افزودن مکان',
    gradient: 'from-emerald-500 to-teal-500',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    glow: 'shadow-emerald-100',
  },
  {
    key: 'events',
    title: 'رویدادها',
    icon: Calendar,
    href: '/event',
    addLabel: 'افزودن رویداد',
    gradient: 'from-blue-500 to-indigo-500',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
    glow: 'shadow-blue-100',
  },
  {
    key: 'investments',
    title: 'سرمایه‌گذاری',
    icon: TrendingUp,
    href: '/investment',
    addLabel: 'افزودن فرصت',
    gradient: 'from-amber-500 to-orange-400',
    light: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
    glow: 'shadow-amber-100',
  },
];

export default function Dashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({ locations: 0, events: 0, investments: 0 });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [ev, loc, inv] = await Promise.allSettled([
        EventAPI.getAllEvents(),
        LocationAPI.getAllLocations(),
        InvestmentAPI.getAllInvestments(),
      ]);
      setCounts({
        events:      ev.status  === 'fulfilled' ? (ev.value?.data?.length  ?? 0) : 0,
        locations:   loc.status === 'fulfilled' ? (loc.value?.data?.length ?? 0) : 0,
        investments: inv.status === 'fulfilled' ? ((inv.value?.data ?? inv.value)?.length ?? 0) : 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">خوش آمدید</h1>
          <p className="text-gray-400 text-sm">آمار و اطلاعات کلی سیستم مدیریت گردشگری نهاوند</p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          بروزرسانی
        </button>
      </div>

      {/* Summary banner */}
      <div className="bg-gradient-to-l from-slate-800 to-slate-900 rounded-2xl p-5 mb-8 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/50 text-xs mb-0.5">مجموع ورودی‌ها</p>
            <p className="text-white font-black text-2xl">{loading ? '—' : total}</p>
          </div>
        </div>
        <p className="text-white/25 text-xs hidden sm:block">سیستم مدیریت گردشگری نهاوند</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {CARDS.map(({ key, title, icon: Icon, href, gradient, light, text, border, glow }) => (
          <div
            key={key}
            className={`bg-white rounded-2xl border ${border} shadow-sm hover:shadow-md hover:shadow-${glow} transition-all duration-200 p-6`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className={`${light} ${text} text-xs font-bold px-2.5 py-1 rounded-full`}>
                فعال
              </span>
            </div>
            <p className="text-gray-400 text-xs mb-1">{title}</p>
            <p className="text-4xl font-black text-gray-900 mb-5">
              {loading ? <span className="text-gray-200 animate-pulse">—</span> : counts[key]}
            </p>
            <Link
              href={href}
              className={`flex items-center gap-1.5 ${text} text-sm font-semibold hover:underline`}
            >
              مشاهده همه
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4">دسترسی سریع</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CARDS.map(({ href, addLabel, gradient }) => (
            <Link
              key={href}
              href={href}
              className={`bg-gradient-to-l ${gradient} text-white px-5 py-3 rounded-xl font-semibold text-sm text-center hover:opacity-90 transition-opacity shadow-sm`}
            >
              {addLabel}
            </Link>
          ))}
        </div>
      </div>

      <Toaster />
    </div>
  );
}
