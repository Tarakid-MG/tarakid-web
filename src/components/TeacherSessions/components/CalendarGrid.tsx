import React from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { CheckSquare, Square, Lock, Check, Video } from "lucide-react";
import type { Session, SlotKey } from "../types";
import { HOURS, MINUTES, isBlackout, toSlotKey, isJoinable } from "../utils";
import type { TeacherAvailability } from "../../../services/booking.service";
import { deriveBookingStatus } from "../../../utils/bookingStatus";

interface CalendarGridProps {
  weekDays: Date[];
  editMode: boolean;
  sessions: Session[];
  availabilities: TeacherAvailability[];
  pendingSlots: Set<SlotKey>;
  isDayFullySelected: (day: Date) => boolean;
  toggleDay: (day: Date) => void;
  handleSlotMouseDown: (day: Date, hour: number, minute: string) => void;
  handleSlotMouseEnter: (day: Date, hour: number, minute: string) => void;
  toggleSingleAvailability: (day: Date, hour: number, minute: string) => void;
  setSelectedSession: (session: Session) => void;
  onEnterClassroom: (session: Session) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  weekDays,
  editMode,
  sessions,
  availabilities,
  pendingSlots,
  isDayFullySelected,
  toggleDay,
  handleSlotMouseDown,
  handleSlotMouseEnter,
  toggleSingleAvailability,
  setSelectedSession,
  onEnterClassroom,
}) => {
  const getSessionMoment = (session: Session) => {
    const start = new Date(`${session.sessionDate}T${session.startTime}`);
    const end = new Date(`${session.sessionDate}T${session.endTime}`);
    const now = new Date();
    return {
      isPast: end < now,
      isCurrent: start <= now && end >= now,
    };
  };

  const getStatusColors = (session: Session) => {
    const { isPast, isCurrent } = getSessionMoment(session);
    const isTrial = session.type === "FREE_TRIAL";
    const derivedStatus = deriveBookingStatus({
      status: session.status,
      date: session.sessionDate,
      start: session.startTime,
      end: session.endTime,
      interactionData: session.interactionData,
      isKidWaiting: session.isKidWaiting,
      isTeacherInClass: session.isTeacherInClass,
    });

    if (isPast) {
      switch (derivedStatus) {
        case "COMPLETED":
        case "LATE":
          return {
            bg: "rgba(16,185,129,0.12)",
            border: "2px solid #10b981",
            borderLeft: "#10b981",
            text: "#065f46",
            badge: derivedStatus === "LATE" ? "Terminé" : "Terminé",
          };
        case "MISSING":
        case "TEACHER_ABSENT":
          return {
            bg: "rgba(239,68,68,0.08)",
            border: "2px solid #ef4444",
            borderLeft: "#ef4444",
            text: "#991b1b",
            badge:
              derivedStatus === "TEACHER_ABSENT" ? "Prof absent" : "Manqué",
          };
        case "REPORTED":
        case "CANCELLED":
          return {
            bg: "rgba(100,116,139,0.1)",
            border: "2px solid #64748b",
            borderLeft: "#64748b",
            text: "#334155",
            badge: derivedStatus === "REPORTED" ? "Reporté" : "Annulé",
          };
        default:
          return {
            bg: "rgba(100,116,139,0.1)",
            border: "2px solid #64748b",
            borderLeft: "#64748b",
            text: "#334155",
            badge: "Passé",
          };
      }
    }

    if (isCurrent) {
      return {
        bg: isTrial ? "rgba(255,183,3,0.12)" : "rgba(33,158,188,0.12)",
        border: isTrial
          ? "2px solid #FB8500"
          : "2px solid #219EBC",
        borderLeft: isTrial ? "#FB8500" : "#219EBC",
        text: isTrial ? "#995C00" : "#023047",
        badge: "En cours",
      };
    }

    return {
      bg: isTrial ? "rgba(255,183,3,0.12)" : "rgba(33,158,188,0.12)",
      border: isTrial
        ? "2px solid #FB8500"
        : "2px solid #219EBC",
      borderLeft: isTrial ? "#FB8500" : "#219EBC",
      text: isTrial ? "#995C00" : "#023047",
      badge: isTrial ? "Essai" : "À venir",
    };
  };

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

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Day headers */}
          <div
            className="grid grid-cols-8"
            style={{
              background: "#f8fafc",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div className="p-4 border-r border-slate-100" />
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, new Date());
              const fullySelected = editMode && isDayFullySelected(day);
              const daySessions = sessions.filter((s) =>
                isSameDay(parseISO(s.sessionDate), day),
              ).length;
              const dayAvails = availabilities.filter(
                (a) => a.dayOfWeek === day.getDay(),
              ).length;

              return (
                <div
                  key={i}
                  className={`p-3 text-center border-r border-slate-100 last:border-r-0 transition-colors ${
                    editMode ? "cursor-pointer hover:bg-amber-50/40" : ""
                  }`}
                  style={
                    isToday
                      ? {
                          background:
                            "linear-gradient(180deg, rgba(33,158,188,0.16) 0%, rgba(33,158,188,0.08) 100%)",
                          boxShadow: "inset 0 0 0 2px rgba(33,158,188,0.24)",
                        }
                      : {}
                  }
                  onClick={() => editMode && toggleDay(day)}
                  title={
                    editMode
                      ? "Cliquer pour tout sélectionner / désélectionner"
                      : ""
                  }
                >
                  <p
                    className="text-[9px] font-black uppercase tracking-[0.15em] mb-1.5"
                    style={{
                      color: isToday ? "var(--color-blue)" : "#94a3b8",
                    }}
                  >
                    {format(day, "eee", { locale: fr })}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <p
                      className="text-xl font-black leading-none min-w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        color: isToday ? "white" : "var(--color-navy)",
                        background: isToday
                          ? "var(--color-blue)"
                          : "transparent",
                        boxShadow: isToday
                          ? "0 8px 18px rgba(33,158,188,0.22)"
                          : "none",
                      }}
                    >
                      {format(day, "dd")}
                    </p>
                    {editMode &&
                      (fullySelected ? (
                        <CheckSquare
                          className="w-4 h-4"
                          style={{ color: "var(--color-gold)" }}
                        />
                      ) : (
                        <Square
                          className="w-3.5 h-3.5"
                          style={{ color: "#cbd5e1" }}
                        />
                      ))}
                  </div>
                  {!editMode && (
                    <div className="flex items-center justify-center gap-1 h-3">
                      {daySessions > 0 && (
                        <div className="flex gap-0.5">
                          {Array.from({
                            length: Math.min(daySessions, 3),
                          }).map((_, j) => (
                            <div
                              key={j}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: "var(--color-blue)" }}
                            />
                          ))}
                        </div>
                      )}
                      {dayAvails > 0 && (
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--color-teal)" }}
                        />
                      )}
                    </div>
                  )}
                  {isToday && (
                    <div
                      className="w-10 h-1 rounded-full mx-auto mt-1"
                      style={{ background: "var(--color-blue)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Time rows */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8"
              style={{ borderBottom: "1px solid #f8fafc" }}
            >
              <div
                className="py-2 px-3 text-right border-r border-slate-100 flex flex-col justify-start pt-2.5"
                style={{ background: "#fafbfc", minHeight: "76px" }}
              >
                <span className="text-[11px] font-black text-slate-300">
                  {hour.toString().padStart(2, "0")}h
                </span>
              </div>

              {weekDays.map((day, dayIdx) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={dayIdx}
                    className="border-r border-slate-50 last:border-r-0 p-1 flex flex-col gap-1"
                    style={{
                      minHeight: "76px",
                      background: isToday
                        ? "rgba(33,158,188,0.05)"
                        : undefined,
                    }}
                  >
                    {MINUTES.map((min) => {
                      const blocked = isBlackout(day, hour);
                      const content = getSlotContent(day, hour, min);
                      const isBooked = content?.type === "session";
                      const isAvailable =
                        !editMode && content?.type === "available";
                      const isPending =
                        editMode && pendingSlots.has(toSlotKey(day, hour, min));

                      if (blocked) {
                        return (
                          <div
                            key={min}
                            className="flex-1 rounded-xl flex items-center justify-center gap-1"
                            style={{
                              minHeight: "34px",
                              background:
                                "repeating-linear-gradient(135deg, #fff5f5 0px, #fff5f5 4px, #ffe0e0 4px, #ffe0e0 8px)",
                              border: "1.5px solid #fca5a5",
                            }}
                          >
                            <Lock
                              className="w-2.5 h-2.5"
                              style={{ color: "#f87171" }}
                            />
                          </div>
                        );
                      }

                      if (isBooked) {
                        const session = content!.data as Session;
                        const colors = getStatusColors(session);

                        return (
                          <button
                            key={min}
                            onClick={() => {
                              if (!editMode) {
                                if (isJoinable(session)) {
                                  onEnterClassroom(session);
                                } else {
                                  setSelectedSession(session);
                                }
                              }
                            }}
                            className="flex-1 p-2 rounded-xl text-left transition-all hover:brightness-[0.98] active:scale-[0.98] group relative overflow-hidden"
                            style={{
                              minHeight: "44px",
                              background: colors.bg,
                              border: colors.border,
                              borderLeftWidth: "4px",
                              borderLeftColor: colors.borderLeft,
                              cursor: editMode ? "not-allowed" : "pointer",
                              opacity: editMode ? 0.7 : 1,
                            }}
                          >
                            <div className="flex flex-col gap-1 relative z-10">
                              <div className="flex items-center justify-between gap-1">
                                <p
                                  className="text-[12px] font-black truncate leading-tight uppercase tracking-tight"
                                  style={{
                                    color: colors.text,
                                  }}
                                >
                                  {session.kid.name}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  {isJoinable(session) && (
                                    <Video
                                      className="w-3 h-3 text-white animate-pulse"
                                      style={{ color: colors.borderLeft }}
                                    />
                                  )}
                                  <span
                                    className="text-[9px] font-black opacity-60 shrink-0"
                                    style={{
                                      color: colors.text,
                                    }}
                                  >
                                    {min}:00
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase"
                                  style={{
                                    background: colors.bg,
                                    color: colors.borderLeft,
                                  }}
                                >
                                  {session.kid.level}
                                </span>
                                <span
                                  className="text-[10px] font-bold italic opacity-70"
                                  style={{
                                    color: colors.text,
                                  }}
                                >
                                  {session.kid.age} ans
                                </span>
                                <span
                                  className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                                  style={{
                                    background: "rgba(255,255,255,0.65)",
                                    color: colors.borderLeft,
                                  }}
                                >
                                  {colors.badge}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      }

                      if (editMode) {
                        return (
                          <div
                            key={min}
                            className="flex-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer select-none"
                            style={{
                              minHeight: "34px",
                              background: isPending
                                ? "linear-gradient(135deg, rgba(255,190,11,0.2) 0%, rgba(255,150,0,0.12) 100%)"
                                : "repeating-linear-gradient(135deg, #fff8f8 0px, #fff8f8 4px, #fdeaea 4px, #fdeaea 8px)",
                              border: isPending
                                ? "2px solid rgba(255,190,11,0.7)"
                                : "1.5px solid #fecaca",
                              boxShadow: isPending
                                ? "0 2px 8px rgba(255,190,11,0.2)"
                                : "none",
                              transform: isPending ? "scale(1.02)" : "scale(1)",
                            }}
                            onMouseDown={() =>
                              handleSlotMouseDown(day, hour, min)
                            }
                            onMouseEnter={() =>
                              handleSlotMouseEnter(day, hour, min)
                            }
                          >
                            {isPending ? (
                              <Check
                                className="w-3 h-3"
                                style={{ color: "#d97706" }}
                              />
                            ) : null}
                          </div>
                        );
                      }

                      if (isAvailable) {
                        return (
                          <button
                            key={min}
                            onClick={() =>
                              toggleSingleAvailability(day, hour, min)
                            }
                            title="Disponible — cliquer pour fermer ce créneau"
                            className="flex-1 rounded-xl flex flex-col items-center justify-center transition-all hover:brightness-95"
                            style={{
                              minHeight: "34px",
                              background: "rgba(0,128,128,0.08)",
                              border: "1.5px solid rgba(0,128,128,0.3)",
                            }}
                          ></button>
                        );
                      }

                      return (
                        <button
                          key={min}
                          onClick={() =>
                            toggleSingleAvailability(day, hour, min)
                          }
                          title="Non disponible — cliquer pour ouvrir ce créneau"
                          className="flex-1 rounded-xl flex flex-col items-center justify-center transition-all group"
                          style={{
                            minHeight: "34px",
                            background:
                              "repeating-linear-gradient(135deg, #fff5f5 0px, #fff5f5 5px, #fde8e8 5px, #fde8e8 10px)",
                            border: "1.5px solid #fca5a5",
                          }}
                        >
                          {/* No time text */}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
