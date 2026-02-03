import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextDefinition';
import { userService } from '../../services/user.service';

interface QuizGuardProps {
    children: React.ReactNode;
}

const QuizGuard: React.FC<QuizGuardProps> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    // If not logged in, let the normal auth guard (if any) handle it or go to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Wait for user to be loaded
    if (isAuthenticated && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-lightBlue/10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
            </div>
        );
    }

    // Use userService to check for quiz completion
    if (!userService.hasCompletedQuiz(user)) {
        return <Navigate to="/quiz" replace />;
    }

    return <>{children}</>;
};

export default QuizGuard;
