import { InvestmentDashboard } from '@/components/views/investment/investment-dashboard';
import { Toaster } from '@/components/ui/toaster';

export default function InvestmentPage() {
  return (
    <>
      <InvestmentDashboard />
      <Toaster />
    </>
  );
}