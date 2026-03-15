import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
  Edit3,
  Save,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { TeacherLayout } from "../components/layout/TeacherLayout";
import {
  bookingService,
  type TeacherAvailability,
} from "../services/booking.service";
import { useAuth } from "../context/AuthContextDefinition";

// ── Refactored Imports ──────────────────────────────────────────────────────
import type { Session, SlotKey, Scope } from "../components/TeacherSessions/types";
import { toSlotKey, isBlackout } from "../components/TeacherSessions/utils";
import { ScopeModal } from "../components/TeacherSessions/components/ScopeModal";
import { SessionDetailModal } from "../components/TeacherSessions/components/SessionDetailModal";
import { StatPills } from "../components/TeacherSessions/components/StatPills";
import { CalendarLegend } from "../components/TeacherSessions/components/CalendarLegend";
import { EditModeBanner } from "../components/TeacherSessions/components/EditModeBanner";
import { CalendarGrid } from "../components/TeacherSessions/components/CalendarGrid";
import { SuccessToast } from "../components/TeacherSessions/components/SuccessToast";

// ── Component ────────────────────────────────────────────────────────────────
export const TeacherSessions: React.FC = () => {
  const { user } = useAuth();

  // ── Data state ──────────────────────────────────────────────────────────
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const [availabilities, setAvailabilities] = useState<TeacherAvailability[]>(
    [],
  );
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // ── Edit mode state ──────────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false);
  const [pendingSlots, setPendingSlots] = useState<Set<SlotKey>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedScope, setSavedScope] = useState<Scope | null>(null);

  // ── Scope modal state ────────────────────────────────────────────────────
  const [showScopeModal, setShowScopeModal] = useState(false);

  // Drag-to-select
  const isDragging = useRef(false);
  const dragAction = useRef<"add" | "remove">("add");

  // ── Computed ──────────────────────────────────────────────────────────────
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart],
  );

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [sessionsData, availabilityData] = await Promise.all([
        bookingService.getTeacherUpcoming(),
        bookingService.getTeacherAvailability(),
      ]);
      setSessions(sessionsData as Session[]);
      setAvailabilities(availabilityData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData, currentWeekStart]);

  // ── Enter edit mode → init pending from current availabilities ────────
  const enterEditMode = () => {
    const initial = new Set<SlotKey>(
      availabilities.flatMap((a) => {
        // Map recurring availability to the current visible week
        return weekDays
          .filter((day) => day.getDay() === a.dayOfWeek)
          .map((day) => {
            const hr = parseInt(a.startTime.substring(0, 2));
            const mn = a.startTime.substring(3, 5);
            return toSlotKey(day, hr, mn);
          });
      }),
    );
    setPendingSlots(initial);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setPendingSlots(new Set());
  };

  // ── Slot toggle helpers ────────────────────────────────────────────────
  const isSlotBooked = (day: Date, hour: number, minute: string): boolean =>
    sessions.some(
      (s) =>
        isSameDay(parseISO(s.sessionDate), day) &&
        s.startTime.startsWith(`${hour.toString().padStart(2, "0")}:${minute}`),
    );

  const applySlot = (
    day: Date,
    hour: number,
    minute: string,
    action: "add" | "remove",
  ) => {
    if (isBlackout(day, hour) || isSlotBooked(day, hour, minute)) return;
    const key = toSlotKey(day, hour, minute);
    setPendingSlots((prev) => {
      const next = new Set(prev);
      if (action === "add") next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const handleSlotMouseDown = (day: Date, hour: number, minute: string) => {
    if (!editMode) return;
    const key = toSlotKey(day, hour, minute);
    const action = pendingSlots.has(key) ? "remove" : "add";
    dragAction.current = action;
    isDragging.current = true;
    applySlot(day, hour, minute, action);
  };

  const handleSlotMouseEnter = (day: Date, hour: number, minute: string) => {
    if (!editMode || !isDragging.current) return;
    applySlot(day, hour, minute, dragAction.current);
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  // ── Day-level helpers ──────────────────────────────────────────────────
  const getDaySlotKeys = (day: Date): SlotKey[] => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = ["00", "30"];
    return hours.flatMap((h) =>
      minutes
        .filter((m) => !isBlackout(day, h) && !isSlotBooked(day, h, m))
        .map((m) => toSlotKey(day, h, m)),
    );
  };

  const isDayFullySelected = (day: Date): boolean => {
    const keys = getDaySlotKeys(day);
    return keys.length > 0 && keys.every((k) => pendingSlots.has(k));
  };

  const toggleDay = (day: Date) => {
    const keys = getDaySlotKeys(day);
    const allSelected = isDayFullySelected(day);
    setPendingSlots((prev) => {
      const next = new Set(prev);
      if (allSelected) keys.forEach((k) => next.delete(k));
      else keys.forEach((k) => next.add(k));
      return next;
    });
  };

  const clearAllPending = () => setPendingSlots(new Set());

  const selectAllVisible = () => {
    const keys = weekDays.flatMap((d) => getDaySlotKeys(d));
    setPendingSlots((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => next.add(k));
      return next;
    });
  };

  // ── Open scope modal instead of saving directly ───────────────────────
  const requestSave = () => {
    setShowScopeModal(true);
  };

  // ── Save with scope ───────────────────────────────────────────────────
  const saveAvailabilities = async (scope: Scope) => {
    setIsSaving(true);
    try {
      // Group by distinct dayOfWeek + time (recurring slots)
      const distinctSlots = new Map<
        string,
        { dayOfWeek: number; startTime: string; endTime: string }
      >();

      Array.from(pendingSlots).forEach((key) => {
        const [dateStr, timePart] = key.split("|");
        const date = parseISO(dateStr);
        const dayOfWeek = date.getDay();
        const [hr, mn] = timePart.split(":");
        const slotKey = `${dayOfWeek}|${hr}:${mn}`;

        if (!distinctSlots.has(slotKey)) {
          distinctSlots.set(slotKey, {
            dayOfWeek,
            startTime: `${hr}:${mn}:00`,
            endTime: mn === "00" ? `${hr}:25:00` : `${hr}:55:00`,
          });
        }
      });

      const payload = Array.from(distinctSlots.values());
      const updated = await bookingService.setTeacherAvailability(payload);
      setAvailabilities(updated);
      setEditMode(false);
      setShowScopeModal(false);
      setSavedScope(scope);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Single-slot view-mode toggle ──────────────────────────────────────
  const toggleSingleAvailability = async (
    day: Date,
    hour: number,
    minute: string,
  ) => {
    if (isBlackout(day, hour)) return;
    const dayOfWeek = day.getDay();
    const startTime = `${hour.toString().padStart(2, "0")}:${minute}:00`;
    const endTime =
      minute === "00"
        ? `${hour.toString().padStart(2, "0")}:25:00`
        : `${hour.toString().padStart(2, "0")}:55:00`;

    const existing = availabilities.find(
      (a) => a.dayOfWeek === dayOfWeek && a.startTime === startTime,
    );
    const newAvails = existing
      ? availabilities
          .filter((a) => a.id !== existing.id)
          .map((a) => ({
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
          }))
      : [
          ...availabilities.map((a) => ({
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
          })),
          { dayOfWeek, startTime, endTime },
        ];
    try {
      const updated = await bookingService.setTeacherAvailability(newAvails);
      setAvailabilities(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const pendingCount = pendingSlots.size;
  const savedCount = availabilities.length;
  const sessionCount = sessions.length;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <TeacherLayout>
      <div
        className="p-8 space-y-6"
        style={{ userSelect: "none" }}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-black"
              style={{ color: "var(--color-navy)" }}
            >
              Mon{" "}
              <span className="italic" style={{ color: "var(--color-blue)" }}>
                Planning
              </span>
            </h1>
            <p className="text-slate-500 font-medium mt-1 text-sm flex items-center gap-2 flex-wrap">
              Gérez vos disponibilités et visualisez vos cours.
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-400">
                2 créneaux / heure
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!editMode ? (
              <button
                onClick={enterEditMode}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-white transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: "var(--color-navy)",
                  boxShadow: "0 4px 16px rgba(32,42,68,0.18)",
                }}
              >
                <Edit3 className="w-4 h-4" />
                Modifier mes disponibilités
              </button>
            ) : (
              <>
                <button
                  onClick={clearAllPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all hover:bg-red-50 hover:border-red-200"
                  style={{
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                    background: "white",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#64748b";
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Tout effacer
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all hover:bg-slate-50"
                  style={{
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                    background: "white",
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  onClick={requestSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--color-teal)",
                    boxShadow: "0 4px 16px rgba(0,128,128,0.25)",
                  }}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </>
            )}

            {/* Week navigation */}
            <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100">
              <button
                onClick={() =>
                  setCurrentWeekStart(subWeeks(currentWeekStart, 1))
                }
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <div className="flex items-center gap-2 px-3 border-x border-slate-100">
                <CalendarIcon
                  className="w-4 h-4"
                  style={{ color: "var(--color-blue)" }}
                />
                <span
                  className="font-bold text-sm"
                  style={{ color: "var(--color-navy)" }}
                >
                  {format(weekDays[0], "dd MMM", { locale: fr })} –{" "}
                  {format(weekDays[6], "dd MMM yyyy", { locale: fr })}
                </span>
              </div>
              <button
                onClick={() =>
                  setCurrentWeekStart(addWeeks(currentWeekStart, 1))
                }
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        <StatPills
          editMode={editMode}
          savedCount={savedCount}
          sessionCount={sessionCount}
        />

        <EditModeBanner
          editMode={editMode}
          selectAllVisible={selectAllVisible}
          pendingCount={pendingCount}
        />

        <SuccessToast saveSuccess={saveSuccess} savedScope={savedScope} />

        <CalendarLegend editMode={editMode} />

        <CalendarGrid
          weekDays={weekDays}
          editMode={editMode}
          sessions={sessions}
          availabilities={availabilities}
          pendingSlots={pendingSlots}
          isDayFullySelected={isDayFullySelected}
          toggleDay={toggleDay}
          handleSlotMouseDown={handleSlotMouseDown}
          handleSlotMouseEnter={handleSlotMouseEnter}
          toggleSingleAvailability={toggleSingleAvailability}
          setSelectedSession={setSelectedSession}
        />
      </div>

      {showScopeModal && (
        <ScopeModal
          onConfirm={saveAvailabilities}
          onCancel={() => setShowScopeModal(false)}
          isSaving={isSaving}
        />
      )}

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </TeacherLayout>
  );
};
