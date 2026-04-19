import api from "../api/client";
import { type KidLevel, type User } from "./admin.service";

export interface KidLevelHistory {
  id: string;
  kidId: string;
  performerId: number;
  performer: User;
  oldLevel: KidLevel;
  newLevel: KidLevel;
  reason: string;
  createdAt: string;
}

export const kidsService = {
  async updateKidLevel(
    kidId: string,
    level: KidLevel,
    reason?: string,
  ): Promise<void> {
    await api.patch(`/kids/${kidId}`, { level, reason });
  },

  async getLevelHistory(kidId: string): Promise<KidLevelHistory[]> {
    const res = await api.get<KidLevelHistory[]>(
      `/kids/${kidId}/level-history`,
    );
    return res.data;
  },
};
