import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';

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
  title: 'سیستم مدیریت مشتریان',
  description: 'یک سیستم مدرن مدیریت مشتری با Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={iranSans.className}>{children}</body>
    </html>
  );
}
