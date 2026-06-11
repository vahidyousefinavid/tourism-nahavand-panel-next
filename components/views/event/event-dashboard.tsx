'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/types';
import { EventTable } from '@/components/views/event/event-table';
import { EventFormModal } from '@/components/views/event/event-form-modal';
import { DeleteConfirmationModal } from '@/components/views/event/delete-confirmation-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EventAPI } from '@/lib/EventApi';
import { EventDetailsModal } from './event-details-modal';

export function EventDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event =>
      event.title?.fa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.fa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.fa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer?.fa?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      const data = await EventAPI.getAllEvents();
      setEvents(data?.data);
    } catch (error: any) {
      console.error('Error loading events:', error);
      setConnectionError(true);
      toast({
        title: 'خطا در اتصال',
        description:
          error.message ||
          'دریافت رویدادها با خطا مواجه شد. لطفاً از فعال بودن سرور API اطمینان حاصل کنید.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvent = async (eventData: FormData) => {
    try {
      if (selectedEvent) {
        await EventAPI.updateEvent(selectedEvent.id, eventData);
        toast({ title: 'موفق', description: 'رویداد با موفقیت ویرایش شد.' });
      } else {
        await EventAPI.createEvent(eventData);
        toast({ title: 'موفق', description: 'رویداد با موفقیت ثبت شد.' });
      }
      await loadEvents();
      setShowFormModal(false);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error('Error submitting event:', error);
      toast({
        title: 'خطا',
        description:
          error.message || 'ثبت اطلاعات رویداد با خطا مواجه شد. دوباره تلاش کنید.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      await EventAPI.deleteEvent(selectedEvent.id);
      await loadEvents();
      setShowDeleteModal(false);
      setSelectedEvent(null);
      toast({ title: 'موفق', description: 'رویداد با موفقیت حذف شد.' });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: 'خطا',
        description:
          error.message || 'حذف رویداد با خطا مواجه شد. دوباره تلاش کنید.',
        variant: 'destructive',
      });
    }
  };

  const openFormModalForAdd = () => {
    setSelectedEvent(null);
    setShowFormModal(true);
  };

  const openFormModalForEdit = (event: Event) => {
    setSelectedEvent(event);
    setShowFormModal(true);
  };

  const openDeleteModal = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleDetailsEdit = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsModal(false);
    setShowFormModal(true);
  };

  const handleDetailsDelete = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsModal(false);
    setShowDeleteModal(true);
  };

  const totalEvents = events.length;
  const upcomingEvents = events.filter(e =>
    e.timeRanges?.some(tr => tr.startDate && new Date(tr.startDate) > new Date())
  ).length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              مدیریت رویدادها
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              مدیریت حرفه‌ای و ساده رویدادها در یک داشبورد
            </p>
          </div>
          <Button
            onClick={loadEvents}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            بروزرسانی
          </Button>
        </div>

        {connectionError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">
                  خطا در اتصال به API
                </h3>
                <p className="text-red-700 text-sm">
                  اتصال به سرور برقرار نشد. لطفاً از اجرای API پروژه NestJS
                  اطمینان حاصل کنید.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                کل رویدادها
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {totalEvents}
              </div>
              <p className="text-xs text-gray-500">
                {totalEvents > 0 ? 'رویداد ثبت‌شده' : 'رویدادی ثبت نشده'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                رویدادهای پیش‌رو
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {upcomingEvents}
              </div>
              <p className="text-xs text-gray-500">
                {totalEvents > 0
                  ? `${Math.round(
                      (upcomingEvents / totalEvents) * 100
                    )}٪ آینده`
                  : 'نامشخص'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                نتایج جستجو
              </CardTitle>
              <Search className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {filteredEvents.length}
              </div>
              <p className="text-xs text-gray-500">
                {searchTerm ? 'نتایج فیلترشده' : 'همه رویدادها'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  لیست رویدادها
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800">
                  {filteredEvents.length} رویداد
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="جستجوی رویداد..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>

                <Button
                  onClick={openFormModalForAdd}
                  disabled={connectionError}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  افزودن رویداد
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <EventTable
              events={filteredEvents}
              loading={loading}
              onEdit={openFormModalForEdit}
              onDelete={openDeleteModal}
              onViewDetails={openDetailsModal}
            />
          </CardContent>
        </Card>

        <EventFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setSelectedEvent(null);
          }}
          onSubmit={handleSubmitEvent}
          event={selectedEvent}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteEvent}
          name={selectedEvent ? selectedEvent.title.fa : ''}
        />

        <EventDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          onEdit={handleDetailsEdit}
          onDelete={handleDetailsDelete}
        />
      </div>
    </div>
  );
}
