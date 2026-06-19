import axios from 'axios';

export interface NaturePlaceItem {
  id: string;
  name: { fa: string; en?: string; ar?: string; zh?: string };
  category: string;
  lat: number;
  lng: number;
  bestSeason: string;
  distanceKm: number;
  elevationM: number;
  desc?: { fa: string; en?: string; ar?: string; zh?: string };
  difficulty: string;
  trailOrder: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const BASE = '/api/nature-places';

function toFormData(data: Record<string, any>, imageFile?: File | null): FormData {
  const fd = new FormData();
  const dto = { ...data };
  delete dto.imageUrl;
  fd.append('dto', JSON.stringify(dto));
  if (imageFile) fd.append('image', imageFile);
  return fd;
}

export class NaturePlaceApi {
  static async getAll(page = 1, limit = 100, category?: string, season?: string) {
    const res = await axios.get(BASE, { params: { page, limit, category, season } });
    return res.data as { data: NaturePlaceItem[]; total: number; totalPages: number };
  }

  static async getOne(id: string) {
    const res = await axios.get(`${BASE}/${id}`);
    return res.data as NaturePlaceItem;
  }

  static async create(data: Record<string, any>, imageFile?: File | null) {
    const res = await axios.post(BASE, toFormData(data, imageFile), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as NaturePlaceItem;
  }

  static async update(id: string, data: Record<string, any>, imageFile?: File | null) {
    const res = await axios.put(`${BASE}/${id}`, toFormData(data, imageFile), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as NaturePlaceItem;
  }

  static async remove(id: string) {
    await axios.delete(`${BASE}/${id}`);
  }

  static async seed() {
    const res = await axios.post(`${BASE}/seed`);
    return res.data;
  }
}
