import api from "../api/client";

export const kidService = {
  async getLevel(kidId: string): Promise<{ level: string }> {
    const response = await api.get<{ level: string }>(`/kids/${kidId}/level`);
    return response.data;
  },
};
