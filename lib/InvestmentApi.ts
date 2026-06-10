import axios, { AxiosInstance } from 'axios';
import { CreateInvestmentDto, UpdateInvestmentDto } from '@/types';

export class InvestmentAPI {
  private static axiosInstance: AxiosInstance = axios.create({
    baseURL: `/api/investments`,
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

  private static buildFormData(dto: CreateInvestmentDto | UpdateInvestmentDto, files: File[]): FormData {
    const form = new FormData();
    const dtoWithoutImages = { ...dto } as any;
    delete dtoWithoutImages.images;
    form.append('dto', JSON.stringify(dtoWithoutImages));
    files.forEach((file) => form.append('images', file));
    return form;
  }

  static async createInvestment(dto: CreateInvestmentDto, files: File[] = []) {
    try {
      const form = this.buildFormData(dto, files);
      const response = await this.axiosInstance.post('', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  static async getAllInvestments(page: number = 1, limit: number = 100) {
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
      const response = await this.axiosInstance.get(`/category/${category}`);
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  static async getInvestmentsByStatus(status: string) {
    try {
      const response = await this.axiosInstance.get(`/status/${status}`);
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  static async getTopInvestmentsByViews(limit: number = 7) {
    try {
      const response = await this.axiosInstance.get('/top/views', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  static async updateInvestment(id: string, dto: UpdateInvestmentDto, files: File[] = []) {
    try {
      const form = this.buildFormData(dto, files);
      const response = await this.axiosInstance.put(`/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
