import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Lock, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useKidMode } from "../../hooks/useKidMode";
import lessonService, { type Unit, type Lesson } from "../../services/lesson.service";
import { getKidLessonPack, type KidActivityType } from "../../data/kidLessonActivities";
import { kidActivityConfig } from "./activityConfig";

interface KidActivityLessonChooserProps {
  activityType: KidActivityType;
}

export const KidActivityLessonChooser: React.FC<KidActivityLessonChooserProps> = ({
  activityType,
}) => {
  const navigate = useNavigate();
  const { selectedKid, isKidMode } = useKidMode();
  const [units, setUnits] = useState<Unit[]>([]);
  const [suggestedLessonId, setSuggestedLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const config = kidActivityConfig[activityType];

  useEffect(() => {
    if (!isKidMode || !selectedKid?.id || !selectedKid.level) return;

    let cancelled = false;
    setLoading(true);

    lessonService
      .getLessonsByKidAndLevel(selectedKid.id, selectedKid.level)
      .then((data) => {
        if (cancelled) return;
        setUnits(data.units);
        setSuggestedLessonId(data.suggestedLessonId);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load kid activity lessons", error);
        if (!cancelled) {
          setUnits([]);
          setSuggestedLessonId(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isKidMode, selectedKid?.id, selectedKid?.level]);

  const lessonCards = useMemo(
    () =>
      units.map((unit) => ({
        ...unit,
        lessons: unit.lessons.map((lesson) => ({
          lesson,
          available: !!getKidLessonPack({
            level: selectedKid?.level,
            unit: unit.order,
            lesson: lesson.order,
          }),
        })),
      })),
    [selectedKid?.level, units],
  );

  const handleSelectLesson = (lesson: Lesson, available: boolean) => {
    if (lesson.isLocked || !available) return;
    navigate(`${config.routeBase}/${lesson.id}`);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden p-4 md:p-8"
      style={{
        backgroundImage: "url('/images/kids-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-linear-to-b from-lightBlue/15 via-white/10 to-yellow/10" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,212,0,0.24),transparent_28%),radial-gradient(circle_at_top_right,rgba(76,201,240,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(247,127,0,0.16),transparent_28%)]" />

      <div className="relative max-w-6xl mx-auto">
        <header className="rounded-[2.7rem] border-4 border-white/80 bg-white/88 p-5 md:p-7 shadow-[0_18px_48px_rgba(32,42,68,0.14)] backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => navigate("/kid-dashboard")}
                className="h-14 w-14 rounded-[1.35rem] bg-white text-navy shadow-[0_8px_0_rgba(32,42,68,0.08)] flex items-center justify-center"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-navy/75 bg-navy/5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {config.badge}
                </div>
                <h1 className="mt-3 text-3xl md:text-5xl font-black text-navy leading-none">
                  {config.listTitle}
                </h1>
                <p className="mt-3 text-navy/60 font-bold text-base md:text-lg max-w-2xl">
                  {config.listSubtitle}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border-4 border-white bg-white/90 px-5 py-4 shadow-[0_12px_30px_rgba(32,42,68,0.08)]">
              <div className="flex items-center gap-4">
                <div
                  className="h-16 w-16 rounded-[1.5rem] border-4 border-white shadow-[0_10px_0_rgba(0,0,0,0.12)] flex items-center justify-center"
                  style={{ background: config.accent }}
                >
                  {config.icon}
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-navy/45">
                    {selectedKid?.name}
                  </div>
                  <div className="mt-1 text-xl font-black text-navy">
                    Niveau {selectedKid?.level || "L0"}
                  </div>
                  <div className="text-sm font-bold text-blue">
                    Clique sur une leçon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-6 space-y-6">
          {loading ? (
            <div className="kid-cloud-card rounded-[2.8rem] border-4 border-white/80 bg-white/90 p-8 shadow-[0_18px_48px_rgba(32,42,68,0.14)] text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue animate-pulse" />
              </div>
              <p className="mt-5 text-2xl font-black text-navy">Chargement des leçons...</p>
            </div>
          ) : (
            lessonCards.map((unit) => (
              <section
                key={unit.id}
                className="rounded-[2.8rem] border-4 border-white/80 bg-white/90 p-5 md:p-7 shadow-[0_18px_48px_rgba(32,42,68,0.14)]"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue">
                      Unit {unit.order}
                    </p>
                    <h2 className="mt-1 text-2xl md:text-3xl font-black text-navy">
                      {unit.title}
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-yellow/20 px-4 py-2 text-sm font-black text-orange">
                    <Star className="w-4 h-4 fill-current" />
                    Choisis ta leçon
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unit.lessons.map(({ lesson, available }) => {
                    const locked = lesson.isLocked || !available;
                    const isSuggested = lesson.id === suggestedLessonId;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleSelectLesson(lesson, available)}
                        disabled={locked}
                        className={[
                          "relative overflow-hidden rounded-[2.2rem] border-4 p-5 text-left transition-all",
                          locked
                            ? "border-slate-200 bg-slate-100/90 opacity-75 cursor-not-allowed"
                            : "border-white bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] hover:-translate-y-1.5 hover:shadow-[0_16px_24px_rgba(32,42,68,0.12)]",
                        ].join(" ")}
                      >
                        <div className="absolute inset-x-0 top-0 h-18 bg-linear-to-b from-white/80 to-transparent" />
                        <div className="relative flex items-start justify-between gap-4">
                          <div>
                            <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${config.chip}`}>
                              Leçon {lesson.order}
                            </div>
                            <h3 className="mt-3 text-2xl font-black text-navy">
                              {lesson.title}
                            </h3>
                            <p className="mt-2 text-sm font-bold text-navy/55">
                              {locked
                                ? available
                                  ? "Cette leçon est encore verrouillée."
                                  : "Cette activité sera bientôt prête."
                                : "Appuie pour commencer cette activité."}
                            </p>
                          </div>

                          <div
                            className="h-14 w-14 rounded-[1.2rem] border-4 border-white shadow-[0_8px_0_rgba(0,0,0,0.1)] flex items-center justify-center shrink-0"
                            style={{ background: config.accent }}
                          >
                            {locked ? (
                              <Lock className="w-5 h-5 text-white" />
                            ) : (
                              <ChevronRight className="w-6 h-6 text-white" />
                            )}
                          </div>
                        </div>

                        {isSuggested && !locked && (
                          <div className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-yellow px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-navy">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            Recommandée
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </main>
      </div>
    </div>
  );
};
