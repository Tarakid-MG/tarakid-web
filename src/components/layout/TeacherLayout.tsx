import React, { useState } from "react";
import { Menu } from "lucide-react";
import { TeacherSidebar } from "./TeacherSidebar";
import { Logo } from "../ui/Logo";

export const TeacherLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "#F0F4F8" }}>
      {/* Desktop sidebar */}
      <div className="hidden shrink-0 lg:sticky lg:top-0 lg:block lg:h-screen">
        <TeacherSidebar />
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <TeacherSidebar onNavigate={() => setMobileOpen(false)} />
      </div>

      <main className="min-w-0 flex-1 overflow-auto">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="text-navy/60 hover:text-navy"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Logo className="h-7" />
        </div>
        {children}
      </main>
    </div>
  );
};
