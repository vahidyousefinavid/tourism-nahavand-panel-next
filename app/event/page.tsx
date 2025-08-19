import MapComponentWrapper from '@/components/ui/mapPicker';
import { Toaster } from '@/components/ui/toaster';
import { EventDashboard } from '@/components/views/event/event-dashboard';

export default function Home() {
  return (
    <>
      <EventDashboard />
      <Toaster />
    </>
  );
}