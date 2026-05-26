import api from "../api/client";

export type FeedbackRating = "LIKE" | "DISLIKE";

export interface CreateFeedbackRequest {
  bookingId: string;
  rating: FeedbackRating;
  comment?: string;
}

export interface LessonFeedback {
  id: string;
  bookingId: string;
  rating: FeedbackRating;
  comment: string | null;
  isRead: boolean;
  createdAt: string;
  booking?: {
    sessionDate?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
    lessonTitle?: string | null;
  } | null;
  kid?: {
    id: string;
    name: string;
    level?: string;
  } | null;
  parent?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  teacher?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
}

export const feedbackService = {
  async create(data: CreateFeedbackRequest): Promise<LessonFeedback> {
    const response = await api.post<LessonFeedback>("/feedback", data);
    return response.data;
  },

  async getAll(): Promise<LessonFeedback[]> {
    const response = await api.get<LessonFeedback[]>("/feedback");
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>("/feedback/unread-count");
    return response.data.count;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/feedback/read-all");
  },
};
