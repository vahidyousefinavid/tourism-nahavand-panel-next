'use client';

import { useState, useEffect } from 'react';
import { Location } from '@/types'; // تایپ Location رو داشته باش
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  DollarSign,
  Users,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { LocationAPI } from '@/lib/LocationApi';

interface LocationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string | null;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
}

export function LocationDetailsModal({ 
  isOpen, 
  onClose, 
  locationId, 
  onEdit, 
  onDelete 
}: LocationDetailsModalProps) {
  const [location, setLocation] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && locationId) {
      loadLocationDetails();
    } else {
      setLocation(null);
      setError(null);
    }
  }, [isOpen, locationId]);

  const loadLocationDetails = async () => {
    if (!locationId) return;

    setLoading(true);
    setError(null);
    
    try {
      const locationData = await LocationAPI.getLocationById(locationId);
      setLocation(locationData);
    } catch (error: any) {
      console.error('Error loading location details:', error);
      setError(error.message || 'Failed to load location details');
      toast({
        title: "Error",
        description: error.message || "Failed to load location details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (location) {
      onEdit(location);
      onClose();
    }
  };

  const handleDelete = () => {
    if (location) {
      onDelete(location);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Location Details
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading location details...</p>
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

        {location && !loading && (
          <div className="space-y-6">
            {/* Header Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{location.title}</h2>
                    <p className="text-gray-700">{location.description}</p>
                    <p className="text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(location.date), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Location Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Coordinates (LatLng)</div>
                    <div className="font-mono text-gray-900">{location.latlang}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Address / Location Code</div>
                    <div className="font-medium text-gray-900">{location.location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Capacity</div>
                    <div className="font-medium text-gray-900">{location.capacity}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Registered</div>
                    <div className="font-medium text-gray-900">{location.registered}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">{location.price}</div>
              </CardContent>
            </Card>

            {/* Organizer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Organizer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-900">{location.organizer}</div>
              </CardContent>
            </Card>

            <Separator />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={handleEdit}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Location
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
