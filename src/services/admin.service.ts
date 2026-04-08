import api from "../api/client";
import type { User, Booking } from "../types/auth";
import type { TeacherAvailability } from "./booking.service";
export type { User, Booking, TeacherAvailability };

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "teacher" | "client" | "support";
export type BookingType = "regular" | "free_trial";
export type KidLevel = "L0" | "L1" | "L2" | "L3" | "L4" | "L5";

export type EnglishLevel = "NONE" | "WORDS" | "SENTENCES" | "FLUENT";

export type LessonType = "genially" | "pdf" | "video";

export interface LevelRule {
  id: string;
  minAge: number | null;
  maxAge: number | null;
  englishReadingLevels: EnglishLevel[];
  englishSpeakingLevels: EnglishLevel[];
  operator: "AND" | "OR";
  targetLevelCode: KidLevel;
  priority: number;
}

export interface Level {
  id: string;
  name: string;
  code: string;
  order: number;
}

export interface Unit {
  id: string;
  title: string;
  description?: string;
  level: KidLevel;
  order: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  contentUrl?: string; // We'll keep this for legacy or map it to content
  content: string;
  type: LessonType;
  level: KidLevel;
  order: number;
  unitId: string;
  thumbnailUrl?: string;
}

export interface BookedSlot {
  id: string | number;
  date: string;
  time: string;
  type: string;
  isActive?: boolean;
}

export interface AssignedBooking {
  id: string;
  kidId: string;
  userId: number;
  sessionDate?: string;
  date?: string;
  startTime: string;
  status: string;
  type?: string;
  teacher?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  kid?: { name: string; age: number };
}

export interface HistoryBooking extends AssignedBooking {
  endTime?: string;
}

export interface BookingDetails {
  id: string | number;
  type: string;
  status: string;
  date: string;
  time: string;
  kid?: {
    id: string;
    name: string;
    age: number;
    level: string;
    englishReadingLevel: string;
    englishSpeakingLevel: string;
  };
  parent?: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
}

export interface BookingAssignmentHistory {
  id: string;
  bookingId: string;
  bookingType: string;
  previousTeacherId: number | null;
  previousTeacherName: string | null;
  newTeacherId: number | null;
  newTeacherName: string | null;
  assignedById: number;
  assignedByRole: string;
  assignedByName: string;
  createdAt: string;
}

export interface CreateTeacherDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateLessonDto {
  title: string;
  description?: string;
  type?: LessonType;
  content: string;
  level: KidLevel;
  unitId: string;
  order: number;
  thumbnailUrl?: string;
}

export interface UpdateLessonDto {
  title?: string;
  description?: string;
  content?: string;
  type?: LessonType;
  order?: number;
  thumbnailUrl?: string;
}

export interface CreateUnitDto {
  title: string;
  description?: string;
  level: KidLevel;
  order?: number;
}

// ─── Auth Admin ───────────────────────────────────────────────────────────────

export const adminService = {
  async assignRole(userId: number, role: UserRole): Promise<void> {
    await api.post("/auth/admin/assign-role", { userId, role });
  },

  // ─── Bookings Admin ──────────────────────────────────────────────────────────

  async getBookedSlots(): Promise<BookedSlot[]> {
    const res = await api.get<BookedSlot[]>("/bookings/admin/booked-slots");
    return res.data;
  },

  async getAssignedBookings(): Promise<AssignedBooking[]> {
    const res = await api.get<AssignedBooking[]>("/bookings/admin/assigned");
    return res.data;
  },

  async getBookingHistory(): Promise<HistoryBooking[]> {
    const res = await api.get<HistoryBooking[]>("/bookings/admin/history");
    return res.data;
  },

  async getBookingDetails(id: string): Promise<BookingDetails> {
    const res = await api.get<BookingDetails>(`/bookings/admin/${id}/details`);
    return res.data;
  },

  async getAvailableTeachersForSlot(
    date: string,
    time: string,
  ): Promise<User[]> {
    const res = await api.get<User[]>("/bookings/admin/available-teachers", {
      params: { date, time },
    });
    return res.data;
  },

  async findAvailableTeacher(
    date: string,
    time: string,
  ): Promise<number | null> {
    const res = await api.get<number | null>("/bookings/admin/find-teacher", {
      params: { date, time },
    });
    return res.data;
  },

  async assignTeacher(
    id: string,
    type: string,
    teacherId: number,
  ): Promise<void> {
    await api.patch(`/bookings/admin/${id}/assign`, { type, teacherId });
  },

  async unassignTeacher(id: string, type: string): Promise<void> {
    await api.patch(`/bookings/admin/${id}/unassign`, { type });
  },

  async getAssignmentsTrace(): Promise<BookingAssignmentHistory[]> {
    const res = await api.get<BookingAssignmentHistory[]>(
      "/bookings/admin/assignment-history",
    );
    return res.data;
  },

  async reassignKidBookings(
    kidId: string,
    teacherId: number,
    includeHistory = false,
  ): Promise<void> {
    await api.patch(`/bookings/admin/kid/${kidId}/assign-all`, {
      teacherId,
      includeHistory,
    });
  },

  async batchAssign(
    bookingIds: string[],
    type: string,
    teacherId: number,
  ): Promise<void> {
    await api.patch("/bookings/admin/batch-assign", {
      bookingIds,
      type,
      teacherId,
    });
  },

  // ─── Lessons Admin ───────────────────────────────────────────────────────────

  async createLesson(dto: CreateLessonDto): Promise<unknown> {
    const res = await api.post("/lessons/admin", dto);
    return res.data;
  },

  async createLessonsBulk(lessons: CreateLessonDto[]): Promise<unknown> {
    const res = await api.post("/lessons/admin/bulk", { lessons });
    return res.data;
  },

  async createUnit(dto: CreateUnitDto): Promise<Unit> {
    const res = await api.post<Unit>("/lessons/admin/units", dto);
    return res.data;
  },

  async getUnitsByLevel(level: KidLevel): Promise<Unit[]> {
    const res = await api.get<Unit[]>(`/lessons/admin/units/${level}`);
    return res.data;
  },

  async updateUnit(id: string, dto: Partial<CreateUnitDto>): Promise<Unit> {
    const res = await api.patch<Unit>(`/lessons/admin/units/${id}`, dto);
    return res.data;
  },

  async deleteUnit(id: string): Promise<void> {
    await api.post(`/lessons/admin/units/delete/${id}`);
  },

  async seedLevel(level: KidLevel): Promise<unknown> {
    const res = await api.post(`/lessons/admin/seed/${level}`);
    return res.data;
  },

  async updateLesson(id: string, dto: UpdateLessonDto): Promise<unknown> {
    const res = await api.patch(`/lessons/admin/${id}`, dto);
    return res.data;
  },

  async deleteLesson(id: string): Promise<void> {
    await api.post(`/lessons/admin/delete/${id}`);
  },

  async uploadLessonThumbnail(
    id: string,
    file: File,
  ): Promise<{ thumbnailUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<{ thumbnailUrl: string }>(
      `/lessons/admin/${id}/thumbnail`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  // ─── Users Admin ─────────────────────────────────────────────────────────────

  async createTeacher(dto: CreateTeacherDto): Promise<void> {
    await api.post("/users/admin/create-teacher", dto);
  },

  async getTeachers(): Promise<User[]> {
    const res = await api.get<User[]>("/users/admin/teachers");
    return res.data;
  },

  async updateTeacher(id: number, dto: Partial<User>): Promise<User> {
    const res = await api.patch<User>(`/users/admin/teachers/${id}`, dto);
    return res.data;
  },

  async deactivateTeacher(id: number): Promise<User> {
    const res = await api.patch<User>(`/users/admin/teachers/${id}/deactivate`);
    return res.data;
  },

  async reactivateTeacher(id: number): Promise<User> {
    const res = await api.patch<User>(`/users/admin/teachers/${id}/reactivate`);
    return res.data;
  },

  async getTeacherUpcomingAdmin(id: number): Promise<Booking[]> {
    const res = await api.get<Booking[]>(
      `/bookings/admin/teacher/${id}/upcoming`,
    );
    return res.data;
  },

  async getTeacherAvailabilityAdmin(
    id: number,
  ): Promise<TeacherAvailability[]> {
    const res = await api.get<TeacherAvailability[]>(
      `/bookings/admin/teacher/${id}/availability`,
    );
    return res.data;
  },

  // ─── Clients Admin ───────────────────────────────────────────────────────────

  async getClients(): Promise<User[]> {
    const res = await api.get<User[]>("/users/admin/clients");
    return res.data;
  },

  async deactivateClient(id: number): Promise<User> {
    const res = await api.patch<User>(`/users/admin/clients/${id}/deactivate`);
    return res.data;
  },

  async reactivateClient(id: number): Promise<User> {
    const res = await api.patch<User>(`/users/admin/clients/${id}/reactivate`);
    return res.data;
  },

  // ─── Levels Admin ────────────────────────────────────────────────────────────

  async getLevels(): Promise<Level[]> {
    const res = await api.get<Level[]>("/lessons/admin/levels");
    return res.data;
  },

  async createLevel(dto: Omit<Level, "id">): Promise<Level> {
    const res = await api.post<Level>("/lessons/admin/levels", dto);
    return res.data;
  },

  async updateLevel(id: string, dto: Partial<Level>): Promise<Level> {
    const res = await api.patch<Level>(`/lessons/admin/levels/${id}`, dto);
    return res.data;
  },

  async deleteLevel(id: string): Promise<void> {
    await api.post(`/lessons/admin/levels/delete/${id}`);
  },

  // ─── Level Rules Admin ───────────────────────────────────────────────────────

  async getLevelRules(): Promise<LevelRule[]> {
    const res = await api.get<LevelRule[]>("/lessons/admin/level-rules");
    return res.data;
  },

  async createLevelRule(dto: Partial<LevelRule>): Promise<LevelRule> {
    const res = await api.post<LevelRule>("/lessons/admin/level-rules", dto);
    return res.data;
  },

  async updateLevelRule(
    id: string,
    dto: Partial<LevelRule>,
  ): Promise<LevelRule> {
    const res = await api.patch<LevelRule>(
      `/lessons/admin/level-rules/${id}`,
      dto,
    );
    return res.data;
  },

  async deleteLevelRule(id: string): Promise<void> {
    await api.post(`/lessons/admin/level-rules/delete/${id}`);
  },
};
