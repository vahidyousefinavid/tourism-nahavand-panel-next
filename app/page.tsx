'use client';

import { CustomerDashboard } from '@/components/views/customer/customer-dashboard';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <>
      <CustomerDashboard />
      <Toaster />
    </>
  );
}