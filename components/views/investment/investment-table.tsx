'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Investment } from '@/types';
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface InvestmentTableProps {
  investments: Investment[];
  loading: boolean;
  onEdit: (investment: Investment) => void;
  onDelete: (investment: Investment) => void;
  onViewDetails: (investment: Investment) => void;
}

const categoryLabels: Record<string, string> = {
  'real-estate': 'املاک',
  'agriculture': 'کشاورزی',
  'tourism': 'گردشگری',
  'handicrafts': 'صنایع دستی',
  'industry': 'صنعت',
  'technology': 'فناوری',
};

const riskLabels: Record<string, string> = {
  'low': 'کم',
  'medium': 'متوسط',
  'high': 'زیاد',
};

const statusColors: Record<string, string> = {
  'active': 'bg-green-100 text-green-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-blue-100 text-blue-800',
};

export function InvestmentTable({ investments, loading, onEdit, onDelete, onViewDetails }: InvestmentTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">در حال بارگذاری...</div>
      </div>
    );
  }

  if (investments.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">هیچ فرصت سرمایه‌گذاری یافت نشد.</div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>عنوان</TableHead>
          <TableHead>دسته‌بندی</TableHead>
          <TableHead>حداقل سرمایه</TableHead>
          <TableHead>بازدهی</TableHead>
          <TableHead>ریسک</TableHead>
          <TableHead>وضعیت</TableHead>
          <TableHead>بازدید</TableHead>
          <TableHead>عملیات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {investments.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.title?.fa || '-'}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {categoryLabels[item.category] || item.category}
              </Badge>
            </TableCell>
            <TableCell>{item.minInvestment || '-'}</TableCell>
            <TableCell>{item.expectedReturn || '-'}</TableCell>
            <TableCell>
              <Badge variant="secondary">
                {riskLabels[item.riskLevel || 'medium'] || item.riskLevel}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={statusColors[item.status] || ''}>
                {item.status === 'active' ? 'فعال' : item.status === 'pending' ? 'در انتظار' : 'تکمیل شده'}
              </Badge>
            </TableCell>
            <TableCell>{item.views || 0}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(item)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}