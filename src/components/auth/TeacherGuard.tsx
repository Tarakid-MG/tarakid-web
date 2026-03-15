import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContextDefinition";

interface TeacherGuardProps {
  children: React.ReactNode;
}

const TeacherGuard: React.FC<TeacherGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If not logged in, redirect to teacher login
  if (!isAuthenticated) {
    return <Navigate to="/teacher/login" state={{ from: location }} replace />;
  }

  // Wait for user profile to load
  if (isAuthenticated && !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-navy)" }}
      >
        <div
          className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: "var(--color-blue)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  // Check for teacher role (or admin)
  const role = String(user?.role || "")
    .toLowerCase()
    .trim();
  if (role !== "teacher" && role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default TeacherGuard;
