'use client';

import { useState } from 'react';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, Eye } from 'lucide-react';

interface EventTableProps {
  events: Event[];
  loading: boolean;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onViewDetails: (event: Event) => void;
}

export function EventTable({
  events,
  loading,
  onEdit,
  onDelete,
  onViewDetails,
}: EventTableProps) {
  const [sortBy, setSortBy] = useState<keyof Event>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Event) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    return 0;
  });

  if (loading) return <p>در حال بارگذاری رویدادها...</p>;
  if (events.length === 0) return <p>هیچ رویدادی یافت نشد.</p>;

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {[
                  { label: 'عنوان', field: 'title' as keyof Event },
                  { label: 'مکان', field: 'location' as keyof Event },
                  { label: 'قیمت', field: 'price' as keyof Event },
                  { label: 'ظرفیت', field: 'capacity' as keyof Event },
                  { label: 'برگزارکننده', field: 'organizer' as keyof Event },
                ].map(({ label, field }) => (
                  <th key={field} className="py-3 px-4">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(field)}
                      className="h-auto p-0 font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      {label}
                    </Button>
                  </th>
                ))}
                <th className="py-3 px-4 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map(event => (
                <tr
                  key={event.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    {/* تصویر کوچک */}
                    {event.image && (
                      <img
                        src={
                          event.image.startsWith('data:')
                            ? event.image
                            : `${process.env.NEXT_PUBLIC_API_URL}${event.image}`
                        }
                        alt={event.title['fa']}
                        className="inline-block w-10 h-10 object-cover rounded mr-2"
                      />
                    )}
                    {event.title['fa']}
                  </td>
                  <td className="py-4 px-4">{event.location['fa']}</td>
                  <td className="py-4 px-4">
                    {event.price ?? 'رایگان'}
                  </td>
                  <td className="py-4 px-4">{event.capacity}</td>
                  <td className="py-4 px-4">{event.organizer['fa']}</td>
                  <td className="py-4 px-4 text-right flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {sortedEvents.map(event => (
          <Card
            key={event.id}
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  {event.title['fa']}
                </div>
                <div className="text-sm text-gray-500">
                  {event.location['fa']}
                </div>
                <div className="text-sm text-gray-500">
                  {event.price ?? 'رایگان'} — ظرفیت: {event.capacity}
                </div>
              </div>
              <div className="flex space-x-2">
                {/* <Button variant="ghost" size="sm" onClick={() => onViewDetails(event)}>
                  <Eye className="h-4 w-4" />
                </Button> */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(event)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(event)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
