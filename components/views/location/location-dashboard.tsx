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
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLocations();
  }, []);

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
        title: 'خطا در اتصال',
        description:
          error.message ||
          'دریافت اطلاعات مکان‌ها با خطا مواجه شد. لطفاً از فعال بودن سرور API اطمینان حاصل کنید.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLocation = async (locationData: any) => {
    try {
      if (selectedLocation) {
        await LocationAPI.updateLocation(selectedLocation.id!, locationData);
        toast({ title: 'موفق', description: 'مکان با موفقیت ویرایش شد.' });
      } else {
        await LocationAPI.createLocation(locationData);
        toast({ title: 'موفق', description: 'مکان با موفقیت ثبت شد.' });
      }
      await loadLocations();
      setShowFormModal(false);
      setSelectedLocation(null);
    } catch (error: any) {
      console.error('Error submitting location:', error);
      toast({
        title: 'خطا',
        description:
          error.message || 'ثبت اطلاعات مکان با خطا مواجه شد. دوباره تلاش کنید.',
        variant: 'destructive',
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
      toast({ title: 'موفق', description: 'مکان با موفقیت حذف شد.' });
    } catch (error: any) {
      console.error('Error deleting location:', error);
      toast({
        title: 'خطا',
        description:
          error.message || 'حذف مکان با خطا مواجه شد. دوباره تلاش کنید.',
        variant: 'destructive',
      });
    }
  };

  const openFormModalForAdd = () => {
    setSelectedLocation(null);
    setShowFormModal(true);
  };

  const openFormModalForEdit = (location: Location) => {
    setSelectedLocation(location);
    setShowFormModal(true);
  };

  const openDeleteModal = (location: Location) => {
    setSelectedLocation(location);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (location: Location) => {
    setSelectedLocation(location);
    setShowDetailsModal(true);
  };

  const handleDetailsEdit = (location: Location) => {
    setSelectedLocation(location);
    setShowDetailsModal(false);
    setShowFormModal(true);
  };

  const handleDetailsDelete = (location: Location) => {
    setSelectedLocation(location);
    setShowDetailsModal(false);
    setShowDeleteModal(true);
  };

  const totalLocations = locations.length;
  const topRatedLocations = locations.filter(l => l.rating >= 4).length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              مدیریت مکان‌ها
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              مدیریت و دسته‌بندی مکان‌ها به‌صورت حرفه‌ای
            </p>
          </div>
          <Button
            onClick={loadLocations}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                کل مکان‌ها
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {totalLocations}
              </div>
              <p className="text-xs text-gray-500">
                {totalLocations > 0 ? 'مکان ثبت‌شده' : 'مکانی ثبت نشده'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                امتیاز بالا
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {topRatedLocations}
              </div>
              <p className="text-xs text-gray-500">
                {totalLocations > 0
                  ? `${Math.round(
                      (topRatedLocations / totalLocations) * 100
                    )}٪ با امتیاز ۴+`
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
                {filteredLocations.length}
              </div>
              <p className="text-xs text-gray-500">
                {searchTerm ? 'نتایج فیلترشده' : 'همه مکان‌ها'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  لیست مکان‌ها
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800">
                  {filteredLocations.length} مکان
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="جستجوی مکان..."
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
                  افزودن مکان
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

        <LocationFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setSelectedLocation(null);
          }}
          onSubmit={handleSubmitLocation}
          location={selectedLocation}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteLocation}
          name={selectedLocation ? selectedLocation.name.fa : ''}
        />

        <LocationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedLocation(null);
          }}
          location={selectedLocation}
          onEdit={handleDetailsEdit}
          onDelete={handleDetailsDelete}
        />
      </div>
    </div>
  );
}
