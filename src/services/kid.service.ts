import api from "../api/client";

export const kidService = {
  async getLevel(kidId: string): Promise<{ level: string }> {
    const response = await api.get<{ level: string }>(`/kids/${kidId}/level`);
    return response.data;
  },

  async addStar(kidId: string): Promise<{ stars: number }> {
    const response = await api.patch<{ stars: number }>(
      `/kids/${kidId}/add-star`,
    );
    return response.data;
  },
};
