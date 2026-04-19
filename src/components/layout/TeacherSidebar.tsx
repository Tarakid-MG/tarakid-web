import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  BookOpen,
  HelpCircle,
  Calendar,
  LogOut,
  ChevronRight,
  Sparkles,
  Heart,
} from "lucide-react";
import { useAuth } from "../../context/AuthContextDefinition";
import { Logo } from "../ui/Logo";

const menuItems = [
  {
    id: "dashboard",
    label: "Tableau de Bord",
    icon: LayoutDashboard,
    path: "/teacher/dashboard",
  },
  {
    id: "schedule",
    label: "Mes Sessions",
    icon: Calendar,
    path: "/teacher/sessions",
  },
  { id: "blog", label: "Blog", icon: BookOpen, path: "/blog" },
  { id: "faq", label: "FAQ", icon: HelpCircle, path: "/faq" },
  { id: "profile", label: "Mon Profil", icon: User, path: "/profile" },
];

export const TeacherSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside
      className="w-72 h-screen sticky top-0 flex flex-col shrink-0 overflow-hidden"
      style={{ background: "var(--color-navy)" }}
    >
      {/* Top glow orb */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
        style={{ background: "var(--color-blue)", filter: "blur(60px)" }}
      />
      <div
        className="absolute bottom-40 left-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
        style={{ background: "var(--color-teal)", filter: "blur(50px)" }}
      />

      {/* Logo */}
      <div className="px-8 pt-8 pb-6 relative z-10">
        <Logo className="h-10" />
        <div
          className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: "rgba(33,158,188,0.12)",
            border: "1px solid rgba(33,158,188,0.2)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--color-teal)" }}
          />
          <span
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: "var(--color-lightBlue)" }}
          >
            Espace Enseignant
          </span>
        </div>

        {/* Hearts display */}
        <div
          className="mt-3 flex items-center justify-between px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            <span className="text-xs font-bold text-white/70">Mes Vies</span>
          </div>
          <span className="text-sm font-black text-white">
            {user?.hearts ?? 5}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1 relative z-10 overflow-y-auto">
        <div
          className="text-[9px] font-black uppercase tracking-[0.25em] mb-3 ml-3"
          style={{ color: "rgba(76,201,240,0.4)" }}
        >
          Navigation
        </div>

        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className="group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200"
              style={
                isActive
                  ? {
                      background: "var(--color-blue)",
                      boxShadow: "0 4px 20px rgba(33,158,188,0.35)",
                    }
                  : {
                      color: "rgba(255,255,255,0.45)",
                    }
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={
                    isActive
                      ? {
                          background: "rgba(255,255,255,0.15)",
                        }
                      : {
                          background: "rgba(255,255,255,0.05)",
                        }
                  }
                >
                  <item.icon
                    className="w-4 h-4"
                    style={{
                      color: isActive ? "#fff" : "rgba(76,201,240,0.6)",
                    }}
                  />
                </div>
                <span
                  className="font-bold text-sm"
                  style={{
                    color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {item.label}
                </span>
              </div>
              {isActive && (
                <ChevronRight
                  className="w-4 h-4"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 pt-2 relative z-10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(247,127,0,0.12)";
            (e.currentTarget as HTMLElement).style.color =
              "var(--color-orange)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color =
              "rgba(255,255,255,0.35)";
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(247,127,0,0.1)" }}
          >
            <LogOut className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm">Déconnexion</span>
        </button>
      </div>

      {/* Support card */}
      <div className="p-4 pb-8 relative z-10">
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(33,158,188,0.15), rgba(0,128,128,0.1))",
            border: "1px solid rgba(33,158,188,0.2)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-20"
            style={{ background: "var(--color-gold)", filter: "blur(20px)" }}
          />
          <div className="flex items-center gap-2 mb-2">
            <Sparkles
              className="w-3.5 h-3.5"
              style={{ color: "var(--color-gold)" }}
            />
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "var(--color-gold)" }}
            >
              Support
            </span>
          </div>
          <p
            className="text-xs leading-relaxed font-medium"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Besoin d'aide ? Notre équipe est disponible 24/7.
          </p>
          <div
            className="mt-3 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
            style={{ color: "var(--color-lightBlue)" }}
          >
            Contacter →
          </div>
        </div>
      </div>
    </aside>
  );
};
