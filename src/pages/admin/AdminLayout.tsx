import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  History,
  GraduationCap,
  BookOpen,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  Layers,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContextDefinition";

const navItems = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/bookings",
    label: "Réservations",
    icon: CalendarCheck,
  },
  {
    to: "/admin/booking-history",
    label: "Historique",
    icon: History,
  },
  {
    to: "/admin/teachers",
    label: "Professeurs",
    icon: GraduationCap,
  },
  {
    to: "/admin/lessons",
    label: "Leçons",
    icon: BookOpen,
  },
  {
    to: "/admin/clients",
    label: "Clients",
    icon: Users,
  },
  {
    to: "/admin/levels",
    label: "Niveaux",
    icon: Layers,
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div
        className={`flex items-center gap-3 px-4 py-6 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}
      >
        <div className="w-9 h-9 bg-blue rounded-xl flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-black text-sm leading-none">
              TaraKid
            </p>
            <p className="text-blue text-[10px] font-bold uppercase tracking-widest mt-0.5">
              Admin
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-blue text-white shadow-lg shadow-blue/30"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + logout */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {!collapsed && (
          <div className="px-2 py-1">
            <p className="text-white/80 font-bold text-xs truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-white/30 text-[10px] truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 font-semibold text-sm transition-all ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-navy transition-all duration-300 shrink-0 ${
          collapsed ? "w-[68px]" : "w-56"
        }`}
      >
        {sidebarContent}
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-24 left-0 w-5 h-10 bg-navy border border-white/10 rounded-r-xl flex items-center justify-center text-white/30 hover:text-white transition-colors"
          style={{
            marginLeft: collapsed ? "68px" : "224px",
            transition: "margin 0.3s",
          }}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-56 bg-navy z-50 lg:hidden transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-navy/50 hover:text-navy"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-sm font-semibold text-navy/40">
            <ShieldCheck className="w-4 h-4 text-blue" />
            <span>Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-navy/40 hidden sm:block">
              {user?.email}
            </span>
            <div className="w-8 h-8 bg-blue/10 rounded-xl flex items-center justify-center text-blue font-black text-sm">
              {user?.firstName?.[0] ?? "A"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
