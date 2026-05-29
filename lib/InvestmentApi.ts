import axios, { AxiosInstance, AxiosError } from 'axios';
import { CreateInvestmentDto, UpdateInvestmentDto } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class InvestmentAPI {
  private static axiosInstance: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api/investments`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private static handleAxiosError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      switch (status) {
        case 400:
          throw new Error(message || 'Invalid data provided');
        case 404:
          throw new Error(message || 'Investment opportunity not found');
        case 409:
          throw new Error(message || 'Conflict: Data already exists');
        default:
          throw new Error(message || 'An error occurred while communicating with the server');
      }
    } else {
      throw new Error('An unexpected error occurred');
    }
  }

  static async createInvestment(dto: CreateInvestmentDto) {
    try {
      const response = await this.axiosInstance.post('', dto);
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  static async getAllInvestments(page: number = 1, limit: number = 10) {
    try {
      const response = await this.axiosInstance.get('', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  static async getInvestmentById(id: string) {
    try {
      const response = await this.axiosInstance.get(`/${id}`);
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  static async getInvestmentsByCategory(category: string) {
    try {
      const response = await this.axiosInstance.get(`category/${category}`);
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  static async getInvestmentsByStatus(status: string) {
    try {
      const response = await this.axiosInstance.get(`status/${status}`);
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  static async getTopInvestmentsByViews(limit: number = 7) {
    try {
      const response = await this.axiosInstance.get('top/views', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  static async updateInvestment(id: string, dto: UpdateInvestmentDto) {
    try {
      const response = await this.axiosInstance.put(`/${id}`, dto);
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  static async deleteInvestment(id: string) {
    try {
      await this.axiosInstance.delete(`/${id}`);
    } catch (error) {
      this.handleAxiosError(error);
    }
  }
}