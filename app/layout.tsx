import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Sidebar } from '@/components/layout/Sidebar';

const iranSans = localFont({
  src: [
    {
      path: './fonts/iransans/woff2/IRANSansWeb.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-iransans',
});

export const metadata: Metadata = {
  title: 'پنل مدیریت نهاوند',
  description: 'سیستم مدیریت گردشگری نهاوند',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="light" style={{ colorScheme: 'light' }}>
      <body className={iranSans.className}>
        <Sidebar />
        <main className="mr-64 min-h-screen bg-slate-50">
          {children}
        </main>
      </body>
    </html>
  );
}
