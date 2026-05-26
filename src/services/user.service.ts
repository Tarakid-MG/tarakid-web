import { type User } from '../types/auth';
import api from "../api/client";

export interface UpdateTeacherProfileDto {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    address?: string;
    about?: string;
    experienceYears?: number;
    languages?: { name: string; level: string }[];
    specialties?: string[];
    teachingStyle?: string;
    education?: string;
    certifications?: string[];
}

export const userService = {
    async updateProfile(data: UpdateTeacherProfileDto): Promise<User> {
        const response = await api.patch<User>("/users/profile", data);
        return response.data;
    },

    /**
     * Checks if a user has completed the kids' quiz.
     * Admins and Teachers bypass this check.
     */
    hasCompletedQuiz(user: User | null): boolean {
        if (!user) return false;

        const role = user.role?.toLowerCase();

        // Admins and Teachers bypass the quiz check
        if (role === 'admin' || role === 'teacher') {
            return true;
        }

        // Must have at least one kid with a name and hobbies to be considered "completed"
        return !!(user.kids && user.kids.length > 0 && user.kids.some(kid => kid.name && kid.hobbies && kid.hobbies.length > 0));
    }
};
