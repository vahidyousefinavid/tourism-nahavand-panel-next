'use client';

import { useState } from 'react';
import { Location } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Edit,
  Trash2,
  MapPin,
  Star,
  Calendar,
  Eye,
  List,
  Clock,
  DollarSign
} from 'lucide-react';

interface LocationTableProps {
  locations: Location[];
  loading: boolean;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
  onViewDetails: (location: Location) => void;
}

export function LocationTable({ locations, loading, onEdit, onDelete, onViewDetails }: LocationTableProps) {
  const [sortBy, setSortBy] = useState<keyof Location>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Location) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedLocations = [...locations].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'rating' || sortBy === 'reviews') {
      // numeric sorting
      const aNum = aValue as number;
      const bNum = bValue as number;
      if (aNum < bNum) return sortOrder === 'asc' ? -1 : 1;
      if (aNum > bNum) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No locations found</h3>
        <p className="text-gray-500">Add new locations to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {[
                  { label: 'Name', field: 'name' as keyof Location },
                  { label: 'Category', field: 'category' as keyof Location },
                  { label: 'Entry Fee', field: 'entryFee' as keyof Location },
                  { label: 'Opening Hours', field: 'openingHours' as keyof Location },
                  { label: 'Rating', field: 'rating' as keyof Location },
                  { label: 'Reviews', field: 'reviews' as keyof Location },
                ].map(({ label, field }) => (
                  <th key={field} className="py-3 px-4">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(field)}
                      className="h-auto p-0 font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      {label}
                      <Star className="h-4 w-4" />
                    </Button>
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedLocations.map(location => (
                <tr
                  key={location.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-gray-900">{location.name}</td>
                  <td className="py-4 px-4 capitalize text-gray-700">{location.category}</td>
                  <td className="py-4 px-4 text-gray-900">{location.entryFee}</td>
                  <td className="py-4 px-4 text-gray-700">{location.openingHours}</td>
                  <td className="py-4 px-4 flex items-center space-x-1 text-yellow-500 font-semibold">
                    <Star className="h-4 w-4" />
                    <span>{location.rating.toFixed(1)}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{location.reviews}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(location)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(location)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Edit Location"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(location)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Location"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {sortedLocations.map(location => (
          <Card key={location.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{location.category}</p>
                <p className="text-sm text-gray-700 mt-1">{location.description}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(location)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(location)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  title="Edit Location"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(location)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete Location"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Coordinates: [{location.coordinates[0].toFixed(3)}, {location.coordinates[1].toFixed(3)}]</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Opening Hours: {location.openingHours}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Entry Fee: {location.entryFee}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Rating: {location.rating.toFixed(1)} ({location.reviews} reviews)</span>
              </div>
              <div className="flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span>Facilities: {location.facilities.join(', ') || 'None'}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
