import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Calendar,
  CheckCheck,
  Clock3,
  RefreshCcw,
} from "lucide-react";
import { TeacherLayout } from "../components/layout/TeacherLayout";
import {
  notificationService,
  type AppNotification,
} from "../services/notification.service";

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotificationAccent(type: AppNotification["type"]) {
  switch (type) {
    case "BOOKING_CANCELLED":
      return {
        badge: "Annulé",
        bg: "rgba(247,127,0,0.12)",
        border: "rgba(247,127,0,0.22)",
        text: "var(--color-orange)",
      };
    case "BOOKING_REPORTED":
      return {
        badge: "Reporté",
        bg: "rgba(33,158,188,0.12)",
        border: "rgba(33,158,188,0.22)",
        text: "var(--color-blue)",
      };
    default:
      return {
        badge: "Info",
        bg: "rgba(0,128,128,0.1)",
        border: "rgba(0,128,128,0.2)",
        text: "var(--color-teal)",
      };
  }
}

const TeacherNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const data = await notificationService.getMyNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to load teacher notifications", error);
      } finally {
        setLoading(false);
      }
    };

    void loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true })),
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="min-h-screen p-4 md:p-8 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-blue/5 pointer-events-none" />
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gold/10 pointer-events-none blur-2xl" />
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue/10 border border-blue/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue mb-4">
                  <Bell className="w-3.5 h-3.5" />
                  Notifications
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-navy">
                  Mes notifications
                </h1>
                <p className="text-slate-500 font-medium mt-2">
                  Retrouvez les annulations et reports de vos élèves au même endroit.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm min-w-[138px]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Non lues
                  </p>
                  <p className="text-2xl font-black text-navy mt-1">
                    {unreadCount}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll || unreadCount === 0}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue px-5 py-3 text-sm font-black text-white shadow-[0_8px_20px_rgba(33,158,188,0.24)] transition-all hover:bg-deepBlue disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <CheckCheck className="w-4 h-4" />
                  {markingAll ? "Patiente..." : "Tout marquer comme lu"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white p-4 md:p-5 shadow-sm">
            {loading ? (
              <div className="py-14 text-center">
                <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-blue/20 border-t-blue animate-spin" />
                <p className="text-sm font-bold text-slate-400">
                  Chargement des notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 border border-slate-100">
                  <Bell className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-base font-black text-navy">
                  Aucune notification pour le moment
                </p>
                <p className="text-sm font-medium text-slate-400 mt-2">
                  Les changements de cours de vos élèves apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const accent = getNotificationAccent(notification.type);

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                      className={`w-full text-left rounded-[1.6rem] border p-4 md:p-5 transition-all ${
                        notification.isRead
                          ? "border-slate-100 bg-slate-50/65"
                          : "border-blue/15 bg-white hover:border-blue/25 hover:bg-blue/5"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div
                            className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
                            style={{
                              background: accent.bg,
                              borderColor: accent.border,
                              color: accent.text,
                            }}
                          >
                            <Calendar className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span
                                className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                                style={{
                                  background: accent.bg,
                                  color: accent.text,
                                  border: `1px solid ${accent.border}`,
                                }}
                              >
                                {accent.badge}
                              </span>
                              {!notification.isRead && (
                                <span className="rounded-full bg-gold/15 border border-gold/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gold">
                                  Nouveau
                                </span>
                              )}
                            </div>

                            <h3 className="font-black text-navy">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">
                          <Clock3 className="w-3.5 h-3.5" />
                          {formatNotificationDate(notification.createdAt)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!loading && notifications.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-navy/65 transition-all hover:text-blue hover:border-blue/20 hover:bg-blue/5"
              >
                <RefreshCcw className="w-4 h-4" />
                Rafraîchir
              </button>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherNotifications;
