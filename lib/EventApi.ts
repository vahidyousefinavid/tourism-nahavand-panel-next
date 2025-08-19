import axios, { AxiosInstance, AxiosError } from 'axios';
import { CreateEventDto, UpdateEventDto } from '@/types';  // فرض میکنم این‌ها تایپ‌های مربوطه هستن

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class EventAPI {
  private static axiosInstance: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api/events`,
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
          throw new Error(message || 'Event not found');
        case 409:
          throw new Error(message || 'Conflict: Data already exists');
        default:
          throw new Error(message || 'An error occurred while communicating with the server');
      }
    } else {
      throw new Error('An unexpected error occurred');
    }
  }

  static async createEvent(dto: CreateEventDto | FormData) {
    try {
      let response;

      if (dto instanceof FormData) {
        // اگر FormData است، هدر multipart/form-data می‌زنیم
        response = await this.axiosInstance.post('', dto, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // JSON معمولی
        response = await this.axiosInstance.post('', dto);
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }


  static async getAllEvents() {
    try {
      const response = await this.axiosInstance.get('');
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  static async getEventById(id: string) {
    try {
      const response = await this.axiosInstance.get(`/${id}`);
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  static async updateEvent(id: string, dto: UpdateEventDto | FormData) {
    try {
      let response;
      if (dto instanceof FormData) {
        // ارسال با FormData برای فایل
        response = await this.axiosInstance.put(`/${id}`, dto, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // ارسال JSON معمولی
        response = await this.axiosInstance.put(`/${id}`, dto);
      }
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }


  static async deleteEvent(id: string) {
    try {
      await this.axiosInstance.delete(`/${id}`);
    } catch (error) {
      this.handleAxiosError(error);
    }
  }
}
