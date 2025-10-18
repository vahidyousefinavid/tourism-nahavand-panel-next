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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false); // برای Add و Edit مشترک
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
        title: "Connection Error",
        description: error.message || "Failed to load events. Please check if the API server is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvent = async (eventData: FormData) => {
    try {
      if (selectedEvent) {
        // ویرایش
        await EventAPI.updateEvent(selectedEvent.id, eventData);
        toast({ title: "Success", description: "Event updated successfully!" });
      } else {
        // افزودن
        await EventAPI.createEvent(eventData);
        toast({ title: "Success", description: "Event added successfully!" });
      }
      await loadEvents();
      setShowFormModal(false);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error('Error submitting event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit event. Please try again.",
        variant: "destructive",
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
      toast({ title: "Success", description: "Event deleted successfully!" });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event. Please try again.",
        variant: "destructive",
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
    setSelectedEventId(event.id);
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
  const upcomingEvents = events.filter(e => e.timeRanges?.some(tr => tr.startDate && new Date(tr.startDate) > new Date())).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Event Management</h1>
            <p className="text-gray-600">Manage your events efficiently with this dashboard</p>
          </div>
          <Button onClick={loadEvents} variant="outline" size="sm" disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {connectionError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">API Connection Error</h3>
                <p className="text-red-700 text-sm">Unable to connect to the API server. Please ensure your NestJS API is running.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalEvents}</div>
              <p className="text-xs text-gray-500">{totalEvents > 0 ? 'Events in database' : 'No events yet'}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{upcomingEvents}</div>
              <p className="text-xs text-gray-500">{totalEvents > 0 ? `${Math.round((upcomingEvents / totalEvents) * 100)}% upcoming` : 'N/A'}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Search Results</CardTitle>
              <Search className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{filteredEvents.length}</div>
              <p className="text-xs text-gray-500">{searchTerm ? 'Filtered results' : 'All events'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-semibold text-gray-900">Event Directory</CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">{filteredEvents.length} events</Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Button
                  onClick={openFormModalForAdd}
                  disabled={connectionError}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
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

        {/* Form Modal (Add/Edit) */}
        <EventFormModal
          isOpen={showFormModal}
          onClose={() => { setShowFormModal(false); setSelectedEvent(null); }}
          onSubmit={handleSubmitEvent}
          event={selectedEvent} // اگر null باشد => Add، در غیر اینصورت Edit
        />

        {/* Delete Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteEvent}
          name={selectedEvent ? selectedEvent.title['fa'] : ''}
        />

        {/* Details Modal */}
        <EventDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          eventId={selectedEventId}
          onEdit={handleDetailsEdit}
          onDelete={handleDetailsDelete}
        />
      </div>
    </div>
  );
}
