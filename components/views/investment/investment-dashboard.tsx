'use client';

import { useState, useEffect } from 'react';
import { Investment, CreateInvestmentDto } from '@/types';
import { InvestmentTable } from '@/components/views/investment/investment-table';
import { InvestmentFormModal } from '@/components/views/investment/investment-form-modal';
import { DeleteConfirmationModal } from '@/components/views/investment/delete-confirmation-modal';
import { InvestmentDetailsModal } from '@/components/views/investment/investment-details-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, RefreshCw, AlertCircle, TrendingUp, DollarSign, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InvestmentAPI } from '@/lib/InvestmentApi';

export function InvestmentDashboard() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInvestments();
  }, []);

  useEffect(() => {
    const filtered = investments.filter(inv =>
      inv.title?.fa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.shortDescription?.fa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.fullDescription?.fa?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvestments(filtered);
  }, [investments, searchTerm]);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      const data = await InvestmentAPI.getAllInvestments();
      setInvestments(data.data || data || []);
    } catch (error: any) {
      console.error('Error loading investments:', error);
      setConnectionError(true);
      toast({
        title: 'خطا در اتصال',
        description: error.message || 'دریافت فرصت‌های سرمایه‌گذاری با خطا مواجه شد. لطفاً از فعال بودن سرور API اطمینان حاصل کنید.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitInvestment = async (investmentData: CreateInvestmentDto, files: File[] = []) => {
    try {
      if (selectedInvestment) {
        await InvestmentAPI.updateInvestment(selectedInvestment.id, investmentData, files);
        toast({ title: 'موفق', description: 'فرصت سرمایه‌گذاری با موفقیت ویرایش شد.' });
      } else {
        await InvestmentAPI.createInvestment(investmentData, files);
        toast({ title: 'موفق', description: 'فرصت سرمایه‌گذاری با موفقیت ثبت شد.' });
      }
      await loadInvestments();
      setShowFormModal(false);
      setSelectedInvestment(null);
    } catch (error: any) {
      console.error('Error submitting investment:', error);
      toast({
        title: 'خطا',
        description: error.message || 'ثبت اطلاعات فرصت سرمایه‌گذاری با خطا مواجه شد. دوباره تلاش کنید.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteInvestment = async () => {
    if (!selectedInvestment) return;
    try {
      await InvestmentAPI.deleteInvestment(selectedInvestment.id);
      await loadInvestments();
      setShowDeleteModal(false);
      setSelectedInvestment(null);
      toast({ title: 'موفق', description: 'فرصت سرمایه‌گذاری با موفقیت حذف شد.' });
    } catch (error: any) {
      console.error('Error deleting investment:', error);
      toast({
        title: 'خطا',
        description: error.message || 'حذف فرصت سرمایه‌گذاری با خطا مواجه شد. دوباره تلاش کنید.',
        variant: 'destructive',
      });
    }
  };

  const openFormModalForAdd = () => {
    setSelectedInvestment(null);
    setShowFormModal(true);
  };

  const openFormModalForEdit = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowFormModal(true);
  };

  const openDeleteModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowDetailsModal(true);
  };

  const handleDetailsEdit = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowDetailsModal(false);
    setShowFormModal(true);
  };

  const handleDetailsDelete = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowDetailsModal(false);
    setShowDeleteModal(true);
  };

  const totalInvestments = investments.length;
  const activeInvestments = investments.filter(i => i.status === 'active').length;
  const totalViews = investments.reduce((sum, i) => sum + (i.views || 0), 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              مدیریت فرصت‌های سرمایه‌گذاری
            </h1>
            <p className="text-gray-600">
              مدیریت حرفه‌ای و ساده فرصت‌های سرمایه‌گذاری در یک داشبورد
            </p>
          </div>
          <Button
            onClick={loadInvestments}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
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
                کل فرصت‌ها
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {totalInvestments}
              </div>
              <p className="text-xs text-gray-500">
                {totalInvestments > 0 ? 'فرصت ثبت‌شده' : 'فرصتی ثبت نشده'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                فرصت‌های فعال
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {activeInvestments}
              </div>
              <p className="text-xs text-gray-500">
                {totalInvestments > 0
                  ? `${Math.round((activeInvestments / totalInvestments) * 100)}٪ فعال`
                  : 'نامشخص'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                کل بازدیدها
              </CardTitle>
              <Eye className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {totalViews}
              </div>
              <p className="text-xs text-gray-500">
                بازدید از فرصت‌ها
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
                  لیست فرصت‌های سرمایه‌گذاری
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800">
                  {filteredInvestments.length} فرصت
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="جستجوی فرصت..."
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
                  افزودن فرصت
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <InvestmentTable
              investments={filteredInvestments}
              loading={loading}
              onEdit={openFormModalForEdit}
              onDelete={openDeleteModal}
              onViewDetails={openDetailsModal}
            />
          </CardContent>
        </Card>

        <InvestmentFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setSelectedInvestment(null);
          }}
          onSubmit={handleSubmitInvestment}
          investment={selectedInvestment}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteInvestment}
          name={selectedInvestment ? selectedInvestment.title.fa : ''}
        />

        <InvestmentDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          investment={selectedInvestment}
          onEdit={handleDetailsEdit}
          onDelete={handleDetailsDelete}
        />
      </div>
    </div>
  );
}