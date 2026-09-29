import api from "../api/client";
import type { Kid } from "../types/auth";

export interface KidAvatarOption {
  key: string;
  url: string;
  cost: number;
  owned: boolean;
  selected: boolean;
  label: string;
}

export const kidService = {
  async getKid(kidId: string): Promise<Kid> {
    const response = await api.get<Kid>(`/kids/${kidId}`);
    return response.data;
  },

  async getLevel(kidId: string): Promise<{ level: string }> {
    const response = await api.get<{ level: string }>(`/kids/${kidId}/level`);
    return response.data;
  },

  async addStar(kidId: string): Promise<{ id: string; stars: number }> {
    const response = await api.patch<{ id: string; stars: number }>(
      `/kids/${kidId}/add-star`,
    );
    return response.data;
  },

  async getAvatarOptions(kidId: string): Promise<KidAvatarOption[]> {
    const response = await api.get<KidAvatarOption[]>(
      `/kids/${kidId}/avatar-options`,
    );
    return response.data;
  },

  async selectAvatar(kidId: string, avatarKey: string): Promise<Kid> {
    const response = await api.patch<Kid>(`/kids/${kidId}/select-avatar`, {
      avatarKey,
    });
    return response.data;
  },
};
