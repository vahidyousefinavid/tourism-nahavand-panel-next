'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  Clock,
  Edit,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { EventAPI } from '@/lib/EventApi';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export function EventDetailsModal({ isOpen, onClose, eventId, onEdit, onDelete }: EventDetailsModalProps) {
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && eventId) {
      loadEventDetails();
    } else {
      setEvent(null);
      setError(null);
    }
  }, [isOpen, eventId]);

  const loadEventDetails = async () => {
    if (!eventId) return;

    setLoading(true);
    setError(null);
    
    try {
      const eventData = await EventAPI.getEventById(eventId);
      setEvent(eventData);
    } catch (error: any) {
      console.error('Error loading event details:', error);
      setError(error.message || 'Failed to load event details');
      toast({
        title: "Error",
        description: error.message || "Failed to load event details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleEdit = () => {
    if (event) {
      onEdit(event);
      onClose();
    }
  };

  const handleDelete = () => {
    if (event) {
      onDelete(event);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600" />
            Event Details
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading event details...</p>
            </div>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Error Loading Details</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {event && !loading && (
          <div className="space-y-6">

            {/* Header Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{event?.title}</h2>
                    <p className="text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {/* {format(new Date(event.startDate), 'MMM dd, yyyy')} - {format(new Date(event.endDate), 'MMM dd, yyyy')} */}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    {/* <div className="font-medium text-gray-900">{event.contactEmail || '-'}</div> */}
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </div>
                    {/* <div className="font-medium text-gray-900">{formatPhoneNumber(event.contactPhone)}</div> */}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  Event Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Organizer</div>
                    <div className="font-medium text-gray-900">{event.organizer}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Capacity</div>
                    <div className="font-medium text-gray-900">{event.capacity || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="font-medium text-gray-900">{event.price ? `$${event.price}` : 'Free'}</div>
                  </div>
                </div>
                {event.description && (
                  <p className="text-gray-700 mt-2">{event.description}</p>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button
                onClick={handleEdit}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
