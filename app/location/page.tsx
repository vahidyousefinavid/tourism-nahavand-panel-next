import { Toaster } from '@/components/ui/toaster';
import { LocationDashboard } from '@/components/views/location/location-dashboard';

export default function Location() {
  return (
    <>
      <LocationDashboard />
      <Toaster />
    </>
  );
}