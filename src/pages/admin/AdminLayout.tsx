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
  Bell,
  MessageSquareText,
} from "lucide-react";
import { useAuth } from "../../context/AuthContextDefinition";
import {
  notificationService,
  type AppNotification,
} from "../../services/notification.service";
import { useEffect } from "react";
import { feedbackService } from "../../services/feedback.service";

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
  {
    to: "/admin/feedback",
    label: "Feedback",
    icon: MessageSquareText,
    badge: "feedback",
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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [feedbackUnreadCount, setFeedbackUnreadCount] = useState(0);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const loadFeedbackCount = () => {
      feedbackService
        .getUnreadCount()
        .then(setFeedbackUnreadCount)
        .catch(console.error);
    };

    notificationService
      .getMyNotifications()
      .then(setNotifications)
      .catch(console.error);
    loadFeedbackCount();

    const interval = setInterval(() => {
      notificationService
        .getMyNotifications()
        .then(setNotifications)
        .catch(console.error);
      loadFeedbackCount();
    }, 30000);

    window.addEventListener("feedback-read", loadFeedbackCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener("feedback-read", loadFeedbackCount);
    };
  }, []);

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

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
        {navItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
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
            {badge === "feedback" && feedbackUnreadCount > 0 && (
              <span
                className={`bg-red-500 text-white text-[10px] font-black rounded-lg min-w-5 h-5 px-1.5 flex items-center justify-center ${
                  collapsed ? "absolute right-1 top-1" : "ml-auto"
                }`}
              >
                {feedbackUnreadCount}
              </span>
            )}
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
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-navy/40 hover:text-blue hover:border-blue/30 transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-lg flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-black text-navy text-sm">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          await notificationService.markAllAsRead();
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, isRead: true })),
                          );
                        }}
                        className="text-[10px] font-bold text-blue hover:underline"
                      >
                        Tout lire
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-navy/30">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-bold">Aucune notification</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${!n.isRead ? "bg-blue/5" : ""}`}
                        >
                          <p className="text-xs font-semibold text-navy leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-navy/30 mt-1 font-bold">
                            {new Date(n.createdAt).toLocaleString("fr-FR")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
