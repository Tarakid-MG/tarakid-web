import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale/fr";
import {
  X,
  BookOpen,
  User,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  Video,
} from "lucide-react";
import type { Session } from "../types";
import { isJoinable } from "../utils";
import { bookingService } from "../../../services/booking.service";
import { kidsService } from "../../../services/kids.service";
import { type KidLevel } from "../../../services/admin.service";
import { LevelChangeModal } from "../../common/LevelChangeModal";
import lessonService, { type Unit } from "../../../services/lesson.service";

interface SessionDetailModalProps {
  session: Session;
  onClose: () => void;
  onCancelSuccess: () => void;
  onUpdateSuccess?: () => void;
  onEnterClassroom: (session: Session) => void;
}

const ALL_LEVELS: KidLevel[] = ["L0", "L1", "L2", "L3", "L4", "L5"];

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  onClose,
  onCancelSuccess,
  onUpdateSuccess,
  onEnterClassroom,
}) => {
  const [isCanceling, setIsCanceling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdatingLevel, setIsUpdatingLevel] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<KidLevel | null>(null);

  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [isAssigningLesson, setIsAssigningLesson] = useState(false);

  React.useEffect(() => {
    const fetchLessons = async () => {
      if (!session.kid.level) return;
      setLoadingLessons(true);
      try {
        const data = await lessonService.getUnits(session.kid.level);
        setUnits(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLessons(false);
      }
    };
    fetchLessons();
  }, [session.kid.level]);

  const handleLessonAssign = async (lessonId: string) => {
    setIsAssigningLesson(true);
    try {
      await bookingService.assignLesson(session.id, lessonId);
      // Update local session object for immediate feedback
      const allLessons = units.flatMap((u) => u.lessons);
      const selected = allLessons.find((l) => l.id === lessonId);
      if (selected) {
        session.lesson = {
          id: selected.id,
          title: selected.title,
          order: selected.order,
        };
      }
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'assignation de la leçon");
    } finally {
      setIsAssigningLesson(false);
    }
  };

  const handleLevelChangeRequest = (newLevel: KidLevel) => {
    setPendingLevel(newLevel);
  };

  const confirmLevelChange = async (reason: string) => {
    if (!pendingLevel) return;
    setIsUpdatingLevel(true);
    try {
      await kidsService.updateKidLevel(
        String(session.kid.id),
        pendingLevel,
        reason,
      );
      session.kid.level = pendingLevel;
      if (onUpdateSuccess) onUpdateSuccess();
      setPendingLevel(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du niveau");
    } finally {
      setIsUpdatingLevel(false);
    }
  };

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      const result = await bookingService.cancelTeacherSession(session.id);
      if (result.penaltyApplied) {
        alert("Attention: Annulation tardive (-1 vie).");
      }
      onCancelSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'annulation.");
    } finally {
      setIsCanceling(false);
    }
  };

  const isLateCancellation = () => {
    const sessionDate = parseISO(session.sessionDate);
    const [hours, minutes] = session.startTime.split(":");
    sessionDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    const now = new Date();
    const diffHours = (sessionDate.getTime() - now.getTime()) / (3600 * 1000);
    return diffHours < 24;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(32,42,68,0.6)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        style={{ animation: "fadeUp 0.2s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-8 pt-8 pb-6 relative overflow-hidden"
          style={{ background: "var(--color-navy)" }}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background: "var(--color-blue)",
              opacity: 0.1,
              filter: "blur(40px)",
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl transition-colors"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4 relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(33,158,188,0.2)",
                border: "1px solid rgba(33,158,188,0.3)",
              }}
            >
              <BookOpen
                className="w-7 h-7"
                style={{ color: "var(--color-lightBlue)" }}
              />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                Détails du cours
              </h3>
              <p
                className="text-sm font-medium mt-0.5"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {session.type === "FREE_TRIAL"
                  ? "Essai Gratuit"
                  : "Cours d'Anglais Standard"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-4">
          {[
            {
              icon: (
                <User
                  className="w-5 h-5"
                  style={{ color: "var(--color-blue)" }}
                />
              ),
              label: "Élève",
              value: session.kid.name,
            },
            {
              icon: (
                <CalendarIcon
                  className="w-5 h-5"
                  style={{ color: "var(--color-blue)" }}
                />
              ),
              label: "Date",
              value: format(
                parseISO(session.sessionDate),
                "EEEE dd MMMM yyyy",
                {
                  locale: fr,
                },
              ),
            },
            {
              icon: (
                <Clock
                  className="w-5 h-5"
                  style={{ color: "var(--color-blue)" }}
                />
              ),
              label: "Horaire",
              value: `${session.startTime.substring(0, 5)} – ${session.endTime.substring(0, 5)}`,
            },
            {
              icon: (
                <User
                  className="w-5 h-5"
                  style={{ color: "var(--color-blue)" }}
                />
              ),
              label: "Âge",
              value: `${session.kid.age} ans`,
            },
            {
              icon: (
                <BookOpen
                  className="w-5 h-5"
                  style={{ color: "var(--color-blue)" }}
                />
              ),
              label: "Niveau",
              value: session.kid.level,
              isLevel: true,
            },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl border"
              style={{ background: "#f8fafc", borderColor: "#f1f5f9" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(33,158,188,0.1)" }}
              >
                {row.icon}
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                  {row.label}
                </p>
                {row.isLevel ? (
                  <div className="relative group/level flex items-center h-5">
                    {isUpdatingLevel ? (
                      <div className="w-4 h-4 border-2 border-blue/20 border-t-blue rounded-full animate-spin" />
                    ) : (
                      <>
                        <select
                          value={session.kid.level || "L0"}
                          onChange={(e) =>
                            handleLevelChangeRequest(e.target.value as KidLevel)
                          }
                          className="appearance-none bg-transparent font-black text-sm capitalize text-navy border-none p-0 focus:ring-0 cursor-pointer w-full"
                          style={{ color: "var(--color-navy)" }}
                        >
                          {ALL_LEVELS.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-300 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover/level:text-blue transition-colors" />
                      </>
                    )}
                  </div>
                ) : (
                  <p
                    className="font-bold text-sm capitalize"
                    style={{ color: "var(--color-navy)" }}
                  >
                    {row.value}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Lesson Selection */}
          <div
            className="flex flex-col gap-4 p-4 rounded-2xl border"
            style={{ background: "#f8fafc", borderColor: "#f1f5f9" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(33,158,188,0.1)" }}
              >
                <BookOpen
                  className="w-5 h-5"
                  style={{ color: "var(--color-blue)" }}
                />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                  Leçon prévue
                </p>
                <div className="relative group/lesson flex items-center h-5">
                  {loadingLessons || isAssigningLesson ? (
                    <div className="w-4 h-4 border-2 border-blue/20 border-t-blue rounded-full animate-spin" />
                  ) : (
                    <>
                      <select
                        value={
                          session.lesson?.id ||
                          session.suggestedLesson?.id ||
                          ""
                        }
                        onChange={(e) => handleLessonAssign(e.target.value)}
                        className={`appearance-none bg-transparent font-black text-sm text-navy border-none p-0 focus:ring-0 cursor-pointer w-full ${!session.lesson && session.suggestedLesson ? "opacity-60" : ""}`}
                        style={{ color: "var(--color-navy)" }}
                      >
                        <option value="">-- Choisir une leçon --</option>
                        {units.map((unit) => (
                          <optgroup key={unit.id} label={unit.title}>
                            {unit.lessons.map((lesson) => (
                              <option key={lesson.id} value={lesson.id}>
                                {lesson.order}. {lesson.title}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      {!session.lesson && session.suggestedLesson && (
                        <span className="shrink-0 text-[8px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500 font-bold ml-1 border border-blue-100">
                          Suggestion
                        </span>
                      )}
                      <ChevronDown className="w-3 h-3 text-slate-300 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover/lesson:text-blue transition-colors" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showConfirm ? (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div
                className="p-4 rounded-2xl border flex flex-col items-center text-center gap-2"
                style={{ background: "#fff5f5", borderColor: "#feb2b2" }}
              >
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <p className="text-sm font-bold text-red-700">
                  {isLateCancellation()
                    ? "Attention: Cette annulation est tardive. Vous perdrez 1 vie ❤️."
                    : "Êtes-vous sûr de vouloir annuler ce cours ?"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isCanceling}
                  className="flex-1 py-3 rounded-xl font-black text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                >
                  {isCanceling ? "En cours..." : "Confirmer"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-black text-white text-sm transition-all active:scale-95"
                style={{
                  background: "var(--color-blue)",
                  boxShadow: "0 6px 20px rgba(33,158,188,0.3)",
                }}
              >
                Fermer
              </button>

              {isJoinable(session) && (
                <button
                  onClick={() => onEnterClassroom(session)}
                  className="w-full py-5 rounded-2xl font-black text-white text-lg transition-all active:scale-95 flex items-center justify-center gap-3 animate-pulse"
                  style={{
                    background: "var(--color-teal)",
                    boxShadow: "0 8px 24px rgba(0,128,128,0.3)",
                  }}
                >
                  <Video className="w-6 h-6" />
                  ENTRER EN CLASSE
                </button>
              )}
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full py-3 rounded-2xl font-bold text-red-500 text-xs flex items-center justify-center gap-2 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
              >
                <RotateCcw className="w-3 h-3" />
                Annuler le cours
              </button>
            </div>
          )}
        </div>
      </div>

      {pendingLevel && (
        <LevelChangeModal
          kidName={session.kid.name}
          newLevel={pendingLevel}
          onCancel={() => setPendingLevel(null)}
          onConfirm={confirmLevelChange}
          isUpdating={isUpdatingLevel}
        />
      )}
    </div>
  );
};
