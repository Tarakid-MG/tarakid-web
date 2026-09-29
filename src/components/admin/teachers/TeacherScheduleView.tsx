import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale/fr";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  Clock,
  User as UserIcon,
} from "lucide-react";
import {
  adminService,
  type TeacherAvailability,
  type Booking,
} from "../../../services/admin.service";

interface TeacherScheduleViewProps {
  teacher: { id: number; firstName: string; lastName: string };
  onClose: () => void;
}

export const TeacherScheduleView: React.FC<TeacherScheduleViewProps> = ({
  teacher,
  onClose,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [sessions, setSessions] = useState<Booking[]>([]);
  const [availabilities, setAvailabilities] = useState<TeacherAvailability[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionsData, availabilityData] = await Promise.all([
        adminService.getTeacherUpcomingAdmin(teacher.id),
        adminService.getTeacherAvailabilityAdmin(teacher.id),
      ]);
      setSessions(sessionsData);
      setAvailabilities(availabilityData);
    } catch (err) {
      console.error("Failed to fetch teacher schedule:", err);
    } finally {
      setLoading(false);
    }
  }, [teacher.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData, currentWeekStart]);

  const getSlotContent = (day: Date, hour: number, minute: string) => {
    const timeStr = `${hour.toString().padStart(2, "0")}:${minute}:00`;
    const session = sessions.find(
      (s) =>
        isSameDay(parseISO(s.sessionDate), day) &&
        s.startTime.startsWith(timeStr.substring(0, 5)),
    );
    if (session) return { type: "session" as const, data: session };

    const availability = availabilities.find(
      (a) => a.dayOfWeek === day.getDay() && a.startTime === timeStr,
    );
    if (availability) return { type: "available" as const, data: availability };

    return null;
  };

  const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7h to 21h
  const MINUTES = ["00", "30"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-4xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue/10 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue" />
            </div>
            <div>
              <h2 className="text-xl font-black text-navy leading-tight">
                Planning de {teacher.firstName} {teacher.lastName}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Vue administrateur • {availabilities.length} créneaux ouverts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Week Navigation */}
            <div className="flex items-center gap-1 bg-slate-50 rounded-2xl p-1 border border-slate-100">
              <button
                onClick={() =>
                  setCurrentWeekStart(subWeeks(currentWeekStart, 1))
                }
                className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-navy"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 px-3">
                <CalendarIcon className="w-3.5 h-3.5 text-blue" />
                <span className="font-bold text-xs text-navy whitespace-nowrap">
                  {format(weekDays[0], "dd MMM", { locale: fr })} –{" "}
                  {format(weekDays[6], "dd MMM yyyy", { locale: fr })}
                </span>
              </div>
              <button
                onClick={() =>
                  setCurrentWeekStart(addWeeks(currentWeekStart, 1))
                }
                className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-navy"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400 hover:text-navy"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="px-8 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue" />
              <span className="text-[10px] font-black uppercase tracking-wider text-navy/60">
                Prévu
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "#22c55e" }}
              />
              <span className="text-[10px] font-black uppercase tracking-wider text-navy/60">
                Terminé
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "#ef4444" }}
              />
              <span className="text-[10px] font-black uppercase tracking-wider text-navy/60">
                Annulé
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "#94a3b8" }}
              />
              <span className="text-[10px] font-black uppercase tracking-wider text-navy/60">
                Absence
              </span>
            </div>
          </div>
          <div className="text-[10px] font-black text-blue bg-blue/10 px-3 py-1 rounded-full uppercase tracking-wider">
            {sessions.length} Cours à venir
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 bg-slate-50/30">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-blue/20 border-t-blue rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Chargement du planning...
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-w-[800px]">
              {/* Grid Header */}
              <div className="grid grid-cols-8 bg-slate-50/50 border-b border-slate-100">
                <div className="p-4 border-r border-slate-100" />
                {weekDays.map((day, i) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div
                      key={i}
                      className="p-3 text-center border-r border-slate-100 last:border-r-0"
                    >
                      <p
                        className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isToday ? "text-blue" : "text-slate-400"}`}
                      >
                        {format(day, "eee", { locale: fr })}
                      </p>
                      <p
                        className={`text-lg font-black ${isToday ? "text-blue" : "text-navy"}`}
                      >
                        {format(day, "dd")}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Grid Body */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid grid-cols-8 border-b border-slate-50 last:border-b-0"
                >
                  <div className="p-3 text-right border-r border-slate-100 bg-slate-50/20">
                    <span className="text-[11px] font-black text-slate-300">
                      {hour}h
                    </span>
                  </div>
                  {weekDays.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-1.5 border-r border-slate-50 last:border-r-0 flex flex-col gap-1.5 min-h-[80px]"
                    >
                      {MINUTES.map((min) => {
                        const content = getSlotContent(day, hour, min);
                        if (content?.type === "session") {
                          const s = content.data as Booking;

                          const getStatusColors = (status: string) => {
                            switch (status) {
                              case "COMPLETED":
                                return {
                                  bg: "rgba(34,197,94,0.1)",
                                  border: "rgba(34,197,94,0.2)",
                                  borderLeft: "#22c55e",
                                  text: "#14532d",
                                };
                              case "CANCELLED":
                                return {
                                  bg: "rgba(239,68,68,0.1)",
                                  border: "rgba(239,68,68,0.2)",
                                  borderLeft: "#ef4444",
                                  text: "#7f1d1d",
                                };
                              case "MISSED":
                              case "ABSENT":
                                return {
                                  bg: "rgba(148,163,184,0.1)",
                                  border: "rgba(148,163,184,0.2)",
                                  borderLeft: "#94a3b8",
                                  text: "#1e293b",
                                };
                              default:
                                return {
                                  bg: "rgba(33,158,188,0.1)",
                                  border: "rgba(33,158,188,0.2)",
                                  borderLeft: "#219EBC",
                                  text: "#023047",
                                };
                            }
                          };

                          const colors = getStatusColors(s.status);

                          return (
                            <div
                              key={min}
                              className="flex-1 p-2 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-1 duration-300"
                              style={{
                                background: colors.bg,
                                border: `1px solid ${colors.border}`,
                                borderLeft: `4px solid ${colors.borderLeft}`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className="text-[10px] font-black uppercase truncate"
                                  style={{ color: colors.borderLeft }}
                                >
                                  {s.kid?.name || "Élève"}
                                </span>
                                <span
                                  className="text-[8px] font-bold"
                                  style={{
                                    color: colors.borderLeft,
                                    opacity: 0.6,
                                  }}
                                >
                                  {min}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 opacity-60">
                                <Clock
                                  className="w-2 h-2"
                                  style={{ color: colors.borderLeft }}
                                />
                                <span
                                  className="text-[9px] font-bold"
                                  style={{ color: colors.text }}
                                >
                                  {s.startTime.substring(0, 5)}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        if (content?.type === "available") {
                          return (
                            <div
                              key={min}
                              className="flex-1 rounded-xl bg-teal/5 border border-dashed border-teal/30 flex items-center justify-center"
                              title="Disponible"
                            >
                              <div className="w-1 h-1 rounded-full bg-teal/40" />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={min}
                            className="flex-1 rounded-xl bg-slate-50/50 border border-dotted border-slate-200"
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
