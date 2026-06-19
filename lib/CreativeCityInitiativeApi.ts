import axios from 'axios';
import { CreativeCityInitiative } from '@/types';

const BASE = '/api/creative-city-initiatives';

function toFormData(data: Record<string, any>, imageFile?: File | null): FormData {
  const fd = new FormData();
  const dto = { ...data };
  delete dto.imageUrl;
  fd.append('dto', JSON.stringify(dto));
  if (imageFile) fd.append('image', imageFile);
  return fd;
}

export class CreativeCityInitiativeApi {
  static async getAll(page = 1, limit = 50, sector?: string, status?: string) {
    const res = await axios.get(BASE, { params: { page, limit, sector, status } });
    return res.data as { data: CreativeCityInitiative[]; total: number; totalPages: number };
  }

  static async getOne(id: string) {
    const res = await axios.get(`${BASE}/${id}`);
    return res.data as CreativeCityInitiative;
  }

  static async create(data: Record<string, any>, imageFile?: File | null) {
    const res = await axios.post(BASE, toFormData(data, imageFile), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as CreativeCityInitiative;
  }

  static async update(id: string, data: Record<string, any>, imageFile?: File | null) {
    const res = await axios.put(`${BASE}/${id}`, toFormData(data, imageFile), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as CreativeCityInitiative;
  }

  static async remove(id: string) {
    await axios.delete(`${BASE}/${id}`);
  }
}
