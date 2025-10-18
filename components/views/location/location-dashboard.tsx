'use client';

import { useState, useEffect } from 'react';
import { Location } from '@/types';
import { LocationTable } from './location-table';
import { LocationFormModal } from '@/components/views/location/location-form-modal';
import { DeleteConfirmationModal } from '@/components/views/location/delete-confirmation-modal';
import { LocationDetailsModal } from './location-details-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, Star, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LocationAPI } from '@/lib/LocationApi';

export function LocationDashboard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false); // Add/Edit مشترک
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadLocations(); }, []);

  useEffect(() => {
    const filtered = locations.filter(loc =>
      loc.name.fa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.description.fa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [locations, searchTerm]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      const data = await LocationAPI.getAllLocations();
      setLocations(data?.data);
    } catch (error: any) {
      console.error('Error loading locations:', error);
      setConnectionError(true);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to load locations. Please check if the API server is running.",
        variant: "destructive",
      });
    } finally { setLoading(false); }
  };

  const handleSubmitLocation = async (locationData: any) => {
    try {
      if (selectedLocation) {
        await LocationAPI.updateLocation(selectedLocation.id!, locationData);
        toast({ title: "Success", description: "Location updated successfully!" });
      } else {
        await LocationAPI.createLocation(locationData);
        toast({ title: "Success", description: "Location added successfully!" });
      }
      await loadLocations();
      setShowFormModal(false);
      setSelectedLocation(null);
    } catch (error: any) {
      console.error('Error submitting location:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit location. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;
    try {
      await LocationAPI.deleteLocation(selectedLocation.id!);
      await loadLocations();
      setShowDeleteModal(false);
      setSelectedLocation(null);
      toast({ title: "Success", description: "Location deleted successfully!" });
    } catch (error: any) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete location. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openFormModalForAdd = () => { setSelectedLocation(null); setShowFormModal(true); };
  const openFormModalForEdit = (location: Location) => { setSelectedLocation(location); setShowFormModal(true); };
  const openDeleteModal = (location: Location) => { setSelectedLocation(location); setShowDeleteModal(true); };
  const openDetailsModal = (location: Location) => { setSelectedLocationId(location.id!); setShowDetailsModal(true); };
  const handleDetailsEdit = (location: Location) => { setSelectedLocation(location); setShowDetailsModal(false); setShowFormModal(true); };
  const handleDetailsDelete = (location: Location) => { setSelectedLocation(location); setShowDetailsModal(false); setShowDeleteModal(true); };

  const totalLocations = locations.length;
  const topRatedLocations = locations.filter(l => l.rating >= 4).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Location Management</h1>
            <p className="text-gray-600">Manage your locations efficiently with this dashboard</p>
          </div>
          <Button onClick={loadLocations} variant="outline" size="sm" disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Locations</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalLocations}</div>
              <p className="text-xs text-gray-500">{totalLocations > 0 ? 'Locations in database' : 'No locations yet'}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Top Rated</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{topRatedLocations}</div>
              <p className="text-xs text-gray-500">{totalLocations > 0 ? `${Math.round((topRatedLocations / totalLocations) * 100)}% rated 4+` : 'N/A'}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Search Results</CardTitle>
              <Search className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{filteredLocations.length}</div>
              <p className="text-xs text-gray-500">{searchTerm ? 'Filtered results' : 'All locations'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-semibold text-gray-900">Location Directory</CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">{filteredLocations.length} locations</Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search locations..."
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
                  <Plus className="h-4 w-4 mr-2" /> Add Location
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <LocationTable
              locations={filteredLocations}
              loading={loading}
              onEdit={openFormModalForEdit}
              onDelete={openDeleteModal}
              onViewDetails={openDetailsModal}
            />
          </CardContent>
        </Card>

        {/* Form Modal (Add/Edit) */}
        <LocationFormModal
          isOpen={showFormModal}
          onClose={() => { setShowFormModal(false); setSelectedLocation(null); }}
          onSubmit={handleSubmitLocation}
          location={selectedLocation} // اگر null باشد => Add، در غیر اینصورت Edit
        />

        {/* Delete Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteLocation}
          name={selectedLocation ? selectedLocation.name.fa : ''}
        />

        {/* Details Modal */}
        <LocationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          locationId={selectedLocationId}
          onEdit={handleDetailsEdit}
          onDelete={handleDetailsDelete}
        />
      </div>
    </div>
  );
}
