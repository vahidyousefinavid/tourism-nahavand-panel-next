import { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/types';

// Use environment variable or fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL+'/api' || 'http://localhost:4000/api';

export class CustomerAPI {
  private static async fetchWithErrorHandling(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error cases from your NestJS API
        if (response.status === 409) {
          throw new Error(errorData.message || 'Conflict: Data already exists');
        }
        if (response.status === 404) {
          throw new Error(errorData.message || 'Customer not found');
        }
        if (response.status === 400) {
          throw new Error(errorData.message || 'Invalid data provided');
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the API is running.');
      }
      throw error;
    }
  }

  static async getAllCustomers(): Promise<Customer[]> {
    const response = await this.fetchWithErrorHandling(`${API_BASE_URL}/customer`);
    const customers = await response.json();
    
    // Ensure dates are properly parsed
    return customers.map((customer: any) => ({
      ...customer,
      dateOfBirth: new Date(customer.dateOfBirth)
    }));
  }

  static async getCustomerById(id: string): Promise<Customer> {
    const response = await this.fetchWithErrorHandling(`${API_BASE_URL}/customer/${id}`);
    const customer = await response.json();
    
    return {
      ...customer,
      dateOfBirth: new Date(customer.dateOfBirth)
    };
  }

  static async createCustomer(customerData: CreateCustomerDto): Promise<Customer> {
    // Format data to match your API expectations
    const formattedData = {
      ...customerData,
      dateOfBirth: customerData.dateOfBirth.toISOString().split('T')[0], // Send as YYYY-MM-DD
      phoneNumber: customerData.phoneNumber.toString() // Ensure it's a string
    };

    const response = await this.fetchWithErrorHandling(`${API_BASE_URL}/customer`, {
      method: 'POST',
      body: JSON.stringify(formattedData),
    });
    
    const customer = await response.json();
    return {
      ...customer,
      dateOfBirth: new Date(customer.dateOfBirth)
    };
  }

  static async updateCustomer(id: string, customerData: UpdateCustomerDto): Promise<Customer> {
    // Format data to match your API expectations
    const formattedData: any = { ...customerData };
    
    if (formattedData.dateOfBirth) {
      formattedData.dateOfBirth = formattedData.dateOfBirth.toISOString().split('T')[0];
    }
    
    if (formattedData.phoneNumber) {
      formattedData.phoneNumber = formattedData.phoneNumber.toString();
    }

    const response = await this.fetchWithErrorHandling(`${API_BASE_URL}/customer/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(formattedData),
    });
    
    const customer = await response.json();
    return {
      ...customer,
      dateOfBirth: new Date(customer.dateOfBirth)
    };
  }

  static async deleteCustomer(id: string): Promise<void> {
    await this.fetchWithErrorHandling(`${API_BASE_URL}/customer/${id}`, {
      method: 'DELETE',
    });
  }
}