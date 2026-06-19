import axios from 'axios';
import { CreativeCityParticipation, ParticipationStatus } from '@/types';

const BASE = '/api/creative-city-participations';

export class CreativeCityParticipationApi {
  static async getAll(page = 1, limit = 20, status?: string) {
    const res = await axios.get(BASE, { params: { page, limit, status } });
    return res.data as { data: CreativeCityParticipation[]; total: number; totalPages: number };
  }

  static async getOne(id: string) {
    const res = await axios.get(`${BASE}/${id}`);
    return res.data as CreativeCityParticipation;
  }

  static async updateStatus(id: string, status: ParticipationStatus, adminNotes?: string) {
    const res = await axios.patch(`${BASE}/${id}/status`, { status, adminNotes });
    return res.data as CreativeCityParticipation;
  }

  static async remove(id: string) {
    await axios.delete(`${BASE}/${id}`);
  }

  static async getStats() {
    const res = await axios.get(`${BASE}/stats`);
    return res.data as { status: string; count: string }[];
  }
}
