import api from "../api/client";

export type LessonType = "genially" | "pdf" | "video";

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content: string; // The Genially embed ID or PDF URL
  unitId: string;
  order: number;
  thumbnailUrl?: string;
  isLocked?: boolean;
}

export interface Unit {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface KidLessonsResponse {
  units: Unit[];
  suggestedLessonId: string | null;
}

export interface RevisionAsset {
  key: string;
  name: string;
  url: string;
}

class LessonService {
  async getUnits(level: string): Promise<Unit[]> {
    try {
      const response = await api.get(`/lessons/units/${level}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch units from API, using empty list", error);
      return [];
    }
  }

  async getLessonsByKidAndLevel(
    kidId: string,
    level: string,
  ): Promise<KidLessonsResponse> {
    try {
      const response = await api.get(`/lessons/kid/${kidId}/level/${level}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch units for kid", error);
      return { units: [], suggestedLessonId: null };
    }
  }

  async getLessonById(
    id: string,
  ): Promise<import("./lesson.service").Lesson | null> {
    try {
      const response = await api.get(`/lessons/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch lesson", error);
      return null;
    }
  }

  async getRevisionAssets(bucketName: string): Promise<RevisionAsset[]> {
    try {
      const response = await api.get(`/lessons/revision-assets/${bucketName}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch revision assets", error);
      return [];
    }
  }
}

export default new LessonService();
