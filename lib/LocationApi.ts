import { CreateLocationDto } from '@/types';
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class LocationAPI {
    private static axiosInstance: AxiosInstance = axios.create({
        baseURL: `${API_BASE_URL}/api/locations`,
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
                    throw new Error(message || 'Location not found');
                case 409:
                    throw new Error(message || 'Conflict: Data already exists');
                default:
                    throw new Error(message || 'An error occurred while communicating with the server');
            }
        } else {
            throw new Error('An unexpected error occurred');
        }
    }

    static async createLocation(dto: CreateLocationDto) {
        try {
            const response = await this.axiosInstance.post('', dto);
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    static async getAllLocations() {
        try {
            const response = await this.axiosInstance.get('');
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    static async getLocationById(id: string) {
        try {
            const response = await this.axiosInstance.get(`/${id}`);
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    static async updateLocation(id: string, dto: any) {
        try {
            const response = await this.axiosInstance.put(`/${id}`, dto);
            return response.data;
        } catch (error) {
            this.handleAxiosError(error);
        }
    }

    static async deleteLocation(id: string) {
        try {
            await this.axiosInstance.delete(`/${id}`);
        } catch (error) {
            this.handleAxiosError(error);
        }
    }
}
