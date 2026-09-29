import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContextDefinition";

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue" />
      </div>
    );
  }

  if (user) {
    console.log("DEBUG: AdminGuard - User role:", user.role);
  }

  if (!user || user.role?.toString().toLowerCase() !== "admin") {
    console.warn(
      "DEBUG: AdminGuard - Redirecting to login. Role is not admin.",
    );
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
