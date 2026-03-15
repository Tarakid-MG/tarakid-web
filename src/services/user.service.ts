import { type User } from '../types/auth';

export const userService = {
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
