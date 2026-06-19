import axios from 'axios';
import { CreativeCityNews } from '@/types';

const BASE = '/api/creative-city-news';

function toFormData(data: Record<string, any>, imageFile?: File | null): FormData {
  const fd = new FormData();
  const dto = { ...data };
  delete dto.imageUrl; // imageUrl از فایل ست می‌شه نه از dto
  fd.append('dto', JSON.stringify(dto));
  if (imageFile) fd.append('image', imageFile);
  return fd;
}

export class CreativeCityNewsApi {
  static async getAll(page = 1, limit = 20, status?: string) {
    const res = await axios.get(BASE, { params: { page, limit, status } });
    return res.data as { data: CreativeCityNews[]; total: number; totalPages: number };
  }

  static async getOne(id: string) {
    const res = await axios.get(`${BASE}/${id}`);
    return res.data as CreativeCityNews;
  }

  static async create(data: Record<string, any>, imageFile?: File | null) {
    const res = await axios.post(BASE, toFormData(data, imageFile), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as CreativeCityNews;
  }

  static async update(id: string, data: Record<string, any>, imageFile?: File | null) {
    const res = await axios.put(`${BASE}/${id}`, toFormData(data, imageFile), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as CreativeCityNews;
  }

  static async publish(id: string) {
    const res = await axios.patch(`${BASE}/${id}/publish`);
    return res.data as CreativeCityNews;
  }

  static async remove(id: string) {
    await axios.delete(`${BASE}/${id}`);
  }
}
