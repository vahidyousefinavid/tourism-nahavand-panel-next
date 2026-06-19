import axios from 'axios';
import { InvestmentSuggestion, SuggestionStatus } from '@/types';

const BASE = '/api/investment-suggestions';

export class SuggestionAPI {
  static async getAll(page = 1, limit = 20, status?: string) {
    const res = await axios.get(BASE, { params: { page, limit, status } });
    return res.data as { data: InvestmentSuggestion[]; total: number; totalPages: number };
  }

  static async getOne(id: string) {
    const res = await axios.get(`${BASE}/${id}`);
    return res.data as InvestmentSuggestion;
  }

  static async updateStatus(id: string, status: SuggestionStatus, adminNotes?: string) {
    const res = await axios.patch(`${BASE}/${id}/status`, { status, adminNotes });
    return res.data as InvestmentSuggestion;
  }

  static async remove(id: string) {
    await axios.delete(`${BASE}/${id}`);
  }

  static async getStats() {
    const res = await axios.get(`${BASE}/stats`);
    return res.data as { status: string; count: string }[];
  }
}
