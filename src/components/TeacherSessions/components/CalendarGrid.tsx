import React from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { CheckSquare, Square, Lock, Check, Video } from "lucide-react";
import type { Session, SlotKey } from "../types";
import { HOURS, MINUTES, isBlackout, toSlotKey, isJoinable } from "../utils";
import type { TeacherAvailability } from "../../../services/booking.service";

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
                  style={isToday ? { background: "rgba(33,158,188,0.03)" } : {}}
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
                      className="text-xl font-black leading-none"
                      style={{
                        color: isToday
                          ? "var(--color-blue)"
                          : "var(--color-navy)",
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
                      className="w-4 h-0.5 rounded-full mx-auto mt-1"
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
                        ? "rgba(33,158,188,0.015)"
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

                        const getStatusColors = (s: Session) => {
                          const status = s.status;
                          const isTrial = s.type === "FREE_TRIAL";

                          // Check if missed: past date/time AND not attended
                          const sessionStart = new Date(
                            `${s.sessionDate}T${s.startTime}`,
                          );
                          const isPast = sessionStart < new Date();
                          const isMissed =
                            isPast &&
                            !s.isTeacherInClass &&
                            status !== "COMPLETED" &&
                            status !== "CANCELLED";

                          if (isMissed || status === "MISSED") {
                            return {
                              bg: "rgba(239,68,68,0.08)",
                              border: "rgba(239,68,68,0.3)",
                              borderLeft: "#ef4444",
                              text: "#991b1b",
                            };
                          }

                          switch (status) {
                            case "COMPLETED":
                            case "DONE_BUT_MISSING":
                              return {
                                bg: "rgba(16, 185, 129, 0.12)",
                                border: "rgba(16, 185, 129, 0.4)",
                                borderLeft: "#10b981",
                                text: "#064e3b",
                              };
                            case "CANCELLED":
                              return {
                                bg: "rgba(100,116,139,0.1)",
                                border: "rgba(100,116,139,0.3)",
                                borderLeft: "#64748b",
                                text: "#334155",
                              };
                            case "ABSENT":
                              return {
                                bg: "rgba(148,163,184,0.12)",
                                border: "rgba(148,163,184,0.4)",
                                borderLeft: "#94a3b8",
                                text: "#1e293b",
                              };
                            default: // SCHEDULED, CONFIRMED
                              return {
                                bg: isTrial
                                  ? "rgba(255,183,3,0.12)"
                                  : "rgba(33,158,188,0.12)",
                                border: isTrial
                                  ? "1.5px solid rgba(255,183,3,0.4)"
                                  : "1.5px solid rgba(33,158,188,0.4)",
                                borderLeft: isTrial ? "#FB8500" : "#219EBC",
                                text: isTrial ? "#995C00" : "#023047",
                              };
                          }
                        };

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
