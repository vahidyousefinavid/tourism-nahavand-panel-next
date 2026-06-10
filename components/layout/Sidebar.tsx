'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Calendar, MapPin, TrendingUp, LogOut } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { href: '/',           icon: LayoutDashboard, label: 'داشبورد',       activeClass: 'bg-indigo-50 text-indigo-700',  iconActive: 'bg-indigo-100 text-indigo-600',  dot: 'bg-indigo-500' },
  { href: '/location',   icon: MapPin,           label: 'مکان‌ها',       activeClass: 'bg-emerald-50 text-emerald-700', iconActive: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500' },
  { href: '/event',      icon: Calendar,         label: 'رویدادها',      activeClass: 'bg-blue-50 text-blue-700',      iconActive: 'bg-blue-100 text-blue-600',      dot: 'bg-blue-500' },
  { href: '/investment', icon: TrendingUp,       label: 'سرمایه‌گذاری', activeClass: 'bg-amber-50 text-amber-700',    iconActive: 'bg-amber-100 text-amber-600',    dot: 'bg-amber-500' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="fixed top-0 right-0 w-64 h-screen bg-white border-l border-gray-100 flex flex-col z-20 shadow-sm">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white font-black text-base leading-none">ن</span>
          </div>
          <div>
            <p className="text-gray-800 text-sm font-bold leading-tight">پنل مدیریت</p>
            <p className="text-gray-400 text-xs mt-0.5">نهاوند گردشگری</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">منو</p>
        {NAV.map(({ href, icon: Icon, label, activeClass, iconActive, dot }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? activeClass
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                isActive
                  ? iconActive
                  : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'
              }`}>
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-sm font-medium flex-1">{label}</span>
              {isActive && <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-2">
        {/* User info */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-700 text-xs font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">مدیر سیستم</p>
            <p className="text-[10px] text-gray-400 truncate">admin</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 disabled:opacity-50 group"
        >
          <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-all">
            <LogOut className="w-4 h-4" />
          </span>
          <span className="text-sm font-medium">
            {loggingOut ? 'در حال خروج...' : 'خروج از حساب'}
          </span>
        </button>

        <div className="flex items-center justify-between px-3">
          <p className="text-gray-300 text-xs">نسخه ۱.۰.۰</p>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
        </div>
      </div>
    </aside>
  );
}
