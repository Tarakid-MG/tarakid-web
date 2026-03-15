import React from "react";
import { TeacherSidebar } from "./TeacherSidebar";

export const TeacherLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen" style={{ background: "#F0F4F8" }}>
      <TeacherSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};