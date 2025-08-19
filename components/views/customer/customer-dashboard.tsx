'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { CustomerAPI } from '@/lib/api';
import { CustomerTable } from '@/components/views/customer/customer-table';
import { AddCustomerModal } from '@/components/views/customer/add-customer-modal';
import { EditCustomerModal } from '@/components/views/customer/edit-customer-modal';
import { DeleteConfirmationModal } from '@/components/views/customer/delete-confirmation-modal';
import { CustomerDetailsModal } from '@/components/views/customer/customer-details-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, UserCheck, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CustomerDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      const data = await CustomerAPI.getAllCustomers();
      setCustomers(data);
    } catch (error: any) {
      console.error('Error loading customers:', error);
      setConnectionError(true);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to load customers. Please check if the API server is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (customerData: any) => {
    try {
      await CustomerAPI.createCustomer(customerData);
      await loadCustomers();
      setShowAddModal(false);
      toast({
        title: "Success",
        description: "Customer added successfully!",
      });
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add customer. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleEditCustomer = async (customerData: any) => {
    if (!selectedCustomer) return;
    
    try {
      await CustomerAPI.updateCustomer(selectedCustomer.id, customerData);
      await loadCustomers();
      setShowEditModal(false);
      setSelectedCustomer(null);
      toast({
        title: "Success",
        description: "Customer updated successfully!",
      });
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update customer. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    
    try {
      await CustomerAPI.deleteCustomer(selectedCustomer.id);
      await loadCustomers();
      setShowDeleteModal(false);
      setSelectedCustomer(null);
      toast({
        title: "Success",
        description: "Customer deleted successfully!",
      });
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const openDeleteModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setShowDetailsModal(true);
  };

  const handleDetailsEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const handleDetailsDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(false);
    setShowDeleteModal(true);
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.email).length;
  const recentCustomers = customers.filter(c => {
    const customerDate = new Date(c.dateOfBirth);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return customerDate > oneMonthAgo;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Customer Management
              </h1>
              <p className="text-gray-600">
                Manage your customers efficiently with our comprehensive dashboard
              </p>
            </div>
            <Button
              onClick={loadCustomers}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Connection Error Alert */}
        {connectionError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">API Connection Error</h3>
                  <p className="text-red-700 text-sm">
                    Unable to connect to the API server. Please ensure your NestJS API is running on the correct port.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
              <p className="text-xs text-gray-500">
                {totalCustomers > 0 ? 'Active database' : 'No customers yet'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Valid Emails
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{activeCustomers}</div>
              <p className="text-xs text-gray-500">
                {totalCustomers > 0 ? `${Math.round((activeCustomers / totalCustomers) * 100)}% of total` : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Search Results
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{filteredCustomers.length}</div>
              <p className="text-xs text-gray-500">
                {searchTerm ? 'Filtered results' : 'All customers'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Customer Directory
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {filteredCustomers.length} customers
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Button
                  onClick={() => setShowAddModal(true)}
                  disabled={connectionError}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CustomerTable
              customers={filteredCustomers}
              loading={loading}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onViewDetails={openDetailsModal}
            />
          </CardContent>
        </Card>

        {/* Modals */}
        <AddCustomerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCustomer}
        />

        <EditCustomerModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditCustomer}
          customer={selectedCustomer}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteCustomer}
          customerName={selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : ''}
        />

        <CustomerDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          customerId={selectedCustomerId}
          onEdit={handleDetailsEdit}
          onDelete={handleDetailsDelete}
        />
      </div>
    </div>
  );
}