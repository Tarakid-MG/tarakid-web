import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useKidMode } from "../hooks/useKidMode";
import {
  Gamepad2,
  School,
  PlayCircle,
  Shapes,
  PenTool,
  BookOpen,
  Video,
  Sparkles,
  Star,
  ArrowRight,
} from "lucide-react";
import { KidProfileSelector } from "../components/kid-mode/KidProfileSelector";
import { KidHeader } from "../components/kid-mode/KidHeader";
import { useAuth } from "../context/AuthContextDefinition";
import { freeTrialService } from "../services/free-trial.service";
import { bookingService } from "../services/booking.service";
import type { FreeTrialBooking, Booking } from "../types/auth";
import { useNavigate } from "react-router-dom";

type UnifiedBooking = (FreeTrialBooking | Booking) & {
  date: string;
  startTime: string;
  type: "FREE_TRIAL" | "REGULAR";
  isKidWaiting?: boolean;
  isKidAccepted?: boolean;
  isTeacherInClass?: boolean;
};

function formatNextClassFR(date?: string, start?: string) {
  if (!date || !start) return "Aucun cours prévu";
  const d = parseSafeDateTime(date, start);
  if (isNaN(d.getTime())) return "Format date invalide";
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseSafeDateTime(date: string, time: string) {
  const dPart = date.includes("T") ? date.split("T")[0] : date;
  const tPart = time.substring(0, 5);
  return new Date(`${dPart}T${tPart}:00`);
}

const KidDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    selectedKid,
    isKidMode,
    setShowExitModal,
    exitKidMode,
    updateSelectedKid,
  } = useKidMode();
  const navigate = useNavigate();

  // Redirect to dashboard when exiting kid mode
  const prevIsKidMode = useRef(isKidMode);
  useEffect(() => {
    if (prevIsKidMode.current && !isKidMode) {
      navigate("/dashboard");
    }
    prevIsKidMode.current = isKidMode;
  }, [isKidMode, navigate]);

  const [nextClass, setNextClass] = useState<UnifiedBooking | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync selectedKid with user.kids to avoid stale data
  useEffect(() => {
    if (user?.kids && selectedKid) {
      const latestKid = user.kids.find((k) => k.id === selectedKid.id);
      if (latestKid) {
        if (JSON.stringify(latestKid) !== JSON.stringify(selectedKid)) {
          updateSelectedKid(latestKid);
        }
      } else {
        // stale kid not found in user's kids, clear it
        exitKidMode();
      }
    }
  }, [user?.kids, selectedKid, updateSelectedKid, exitKidMode]);

  useEffect(() => {
    const fetchNextClass = async () => {
      if (!selectedKid || !user?.id) return;

      try {
        const [freeTrialBookings, regularBookings] = await Promise.all([
          freeTrialService.getUserBookings(user.id),
          bookingService.getKidBookings(selectedKid.id.toString()),
        ]);

        const kidFreeTrials = freeTrialBookings
          .filter(
            (b) =>
              String(b.kidId) === String(selectedKid.id) &&
              !["CANCELLED", "REPORTED", "COMPLETED"].includes(b.status),
          )
          .map((b) => ({
            ...b,
            id: `trial_${b.id}`,
            date: b.session?.date,
            startTime: b.session?.startTime,
            type: "FREE_TRIAL" as const,
          }));

        const kidRegulars = regularBookings
          .filter(
            (b) => !["CANCELLED", "REPORTED", "COMPLETED"].includes(b.status),
          )
          .map((b) => ({
            ...b,
            date: b.sessionDate,
            startTime: b.startTime,
            type: "REGULAR" as const,
          }));

        const allAvailable = (
          [...kidFreeTrials, ...kidRegulars] as UnifiedBooking[]
        )
          .filter((b) => b.date && b.startTime)
          .sort((a, b) => {
            const A = parseSafeDateTime(a.date, a.startTime).getTime();
            const B = parseSafeDateTime(b.date, b.startTime).getTime();
            return A - B;
          });

        const now = Date.now();
        // Priority 1: Current session (started within last 30 mins)
        const current = allAvailable.find((b) => {
          const startMs = parseSafeDateTime(b.date, b.startTime).getTime();
          return startMs <= now && startMs > now - 30 * 60 * 1000;
        });

        // Priority 2: Next upcoming session
        const next = allAvailable.find((b) => {
          const startMs = parseSafeDateTime(b.date, b.startTime).getTime();
          return startMs > now;
        });

        setNextClass(current || next || null);
      } catch (error) {
        console.error("Failed to fetch next class for kid dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedKid) {
      fetchNextClass();
      const interval = setInterval(fetchNextClass, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [selectedKid, user]);

  const [isWaiting, setIsWaiting] = useState(false);

  // Sync waiting state with nextClass data
  useEffect(() => {
    if (nextClass && nextClass.isKidWaiting && !nextClass.isKidAccepted) {
      setIsWaiting(true);
    } else {
      setIsWaiting(false);
    }
  }, [nextClass]);

  // Polling for acceptance
  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    if (isWaiting && nextClass) {
      pollInterval = setInterval(async () => {
        try {
          const status =
            nextClass.type === "REGULAR"
              ? await bookingService.getClassroomStatus(nextClass.id.toString())
              : await freeTrialService.getClassroomStatus(
                  nextClass.id.toString(),
                );

          if (status.isKidAccepted) {
            clearInterval(pollInterval!);
            navigate(`/classroom/${nextClass.id}`);
          }
        } catch (error) {
          console.error("Polling acceptance failed", error);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isWaiting, nextClass, navigate]);

  const handleEnterClassroom = async () => {
    if (!nextClass) return;

    try {
      if (nextClass.type === "REGULAR") {
        await bookingService.updateWaitingStatus(nextClass.id.toString(), true);
      } else {
        await freeTrialService.updateWaitingStatus(
          nextClass.id.toString(),
          true,
        );
      }
      setIsWaiting(true);
    } catch (error) {
      console.error("Failed to signal waiting status", error);
      alert("Erreur lors de l'entrée en classe. Veuillez réessayer.");
    }
  };

  const handleCancelWaiting = async () => {
    if (!nextClass) return;
    try {
      if (nextClass.type === "REGULAR") {
        await bookingService.updateWaitingStatus(
          nextClass.id.toString(),
          false,
        );
      } else {
        await freeTrialService.updateWaitingStatus(
          nextClass.id.toString(),
          false,
        );
      }
      setIsWaiting(false);
    } catch (error) {
      console.error("Failed to cancel waiting", error);
    }
  };

  const nextClassDate = useMemo(() => {
    return nextClass
      ? formatNextClassFR(nextClass.date, nextClass.startTime)
      : "Aucun cours prévu";
  }, [nextClass]);

  // ── Live entry-gate & countdown ──────────────────────────────────────
  const ENTRY_WINDOW_MS = 5 * 60 * 1000;

  const computeGate = useCallback(() => {
    if (!nextClass?.date || !nextClass?.startTime) {
      return { canEnter: false, countdown: null };
    }
    const startMs = parseSafeDateTime(
      nextClass.date,
      nextClass.startTime,
    ).getTime();
    const windowOpens = startMs - ENTRY_WINDOW_MS;
    const now = Date.now();
    const diffToWindow = windowOpens - now;

    if (diffToWindow <= 0) {
      return { canEnter: true, countdown: null };
    }

    const totalSec = Math.ceil(diffToWindow / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    const countdown =
      h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;

    return { canEnter: false, countdown };
  }, [nextClass, ENTRY_WINDOW_MS]);

  const [gate, setGate] = useState(() => computeGate());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setGate(computeGate());
    intervalRef.current = setInterval(() => {
      setGate(computeGate());
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [computeGate]);

  const { canEnter, countdown } = gate;

  if (!isKidMode || !selectedKid) {
    return <KidProfileSelector kids={user?.kids || []} />;
  }

  return (
    <div
      className="min-h-screen font-sans relative overflow-hidden select-none"
      style={{
        backgroundImage: "url('/images/kids-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative min-h-screen p-4 md:p-8 flex flex-col">
        <KidHeader
          selectedKid={selectedKid}
          loading={loading}
          nextClassDate={nextClassDate}
          onExit={() => setShowExitModal(true)}
        />

        {/* TOP: Big “Play” hero + small cards */}
        <main className="max-w-7xl mx-auto w-full mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 pb-32">
          {/* HERO PLAY */}
          <div className="lg:col-span-7">
            <KidHeroPlayCard
              kidName={selectedKid.name}
              onClick={() => navigate("/lessons")}
            />
          </div>

          {/* RIGHT stack */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
            <KidActionCard
              title="EXERCICES"
              subtitle="Jeux & défis"
              emoji="✏️"
              tone="yellow"
              icon={<PenTool className="w-7 h-7 text-navy" />}
              onClick={() => alert("Bientôt disponible 🙂")}
            />

            <KidActionCard
              title="VOCAB"
              subtitle="Mots magiques"
              emoji="📚"
              tone="turquoise"
              icon={<Shapes className="w-7 h-7 text-white" />}
              onClick={() => alert("Bientôt disponible 🙂")}
            />

            <KidActionCard
              title="VIDÉOS"
              subtitle="Regarde & répète"
              emoji="🎬"
              tone="blue"
              icon={<Video className="w-7 h-7 text-white" />}
              onClick={() => alert("Bientôt disponible 🙂")}
            />

            <KidActionCard
              title="JEUX"
              subtitle="Mini-games"
              emoji="🎮"
              tone="orange"
              icon={<Gamepad2 className="w-7 h-7 text-navy" />}
              onClick={() => alert("Bientôt disponible 🙂")}
            />
          </div>
        </main>

        {/* Bottom “Enter class” bar (game button) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-40">
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[2.25rem] p-4 md:p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.10)]">
              <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-gold/20 blur-xl" />
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-blue/10 blur-xl" />

              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue border-4 border-white shadow-[0_6px_0_#1D6FA3] flex items-center justify-center">
                    <School className="w-7 h-7 text-white" />
                  </div>

                  <div>
                    <div className="text-xs font-black text-navy/50 uppercase tracking-widest">
                      Prochain cours
                    </div>
                    <div className="text-lg md:text-2xl font-black text-navy">
                      {nextClassDate}
                      {nextClass?.lesson && (
                        <span className="block text-sm md:text-base text-blue/70">
                          Leçon: {nextClass.lesson.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleEnterClassroom}
                  disabled={!canEnter}
                  className={[
                    "w-full md:w-auto",
                    "rounded-[1.75rem] px-6 md:px-10 py-4 md:py-5",
                    "text-xl md:text-2xl font-black",
                    "flex items-center justify-center gap-3",
                    "transition active:translate-y-1",
                    canEnter
                      ? "bg-teal text-white shadow-[0_8px_0_#006666] hover:brightness-[1.02] animate-pulse"
                      : "bg-slate-200 text-navy/40 cursor-not-allowed shadow-[0_8px_0_rgba(0,0,0,0.08)]",
                  ].join(" ")}
                >
                  <PlayCircle className="w-7 h-7 fill-current" />
                  {canEnter ? (
                    <>
                      ENTRER EN CLASSE
                      <ArrowRight className="w-6 h-6" />
                    </>
                  ) : countdown ? (
                    <span className="tabular-nums">dans {countdown}</span>
                  ) : (
                    "Aucun cours prévu"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Exit Modal - Moved to App.tsx root */}
      </div>

      {/* Waiting Room Overlay */}
      {isWaiting && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue/40 backdrop-blur-md animate-in fade-in duration-500" />
          <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-300 border-8 border-white">
            <div className="w-24 h-24 bg-yellow rounded-full flex items-center justify-center mb-8 shadow-xl animate-bounce">
              <Video className="w-12 h-12 text-navy" />
            </div>
            <h2 className="text-4xl font-black text-navy mb-4 uppercase tracking-tighter">
              SALLE D'ATTENTE
            </h2>
            <p className="text-navy/60 text-xl font-medium max-w-md mb-10 leading-relaxed">
              Le professeur prépare la classe... <br />
              <span className="text-blue font-black tracking-widest uppercase text-sm">
                Tu seras admis automatiquement
              </span>
            </p>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center justify-center gap-2 text-blue font-black animate-pulse">
                <Sparkles className="w-5 h-5" />
                PATIENCE, ÇA VA COMMENCER !
              </div>
              <button
                onClick={handleCancelWaiting}
                className="mt-6 text-navy/40 font-black uppercase text-sm hover:text-red-500 transition-colors"
              >
                Annuler et revenir au tableau de bord
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------------------- Components ---------------------------- */

function KidHeroPlayCard({
  kidName,
  onClick,
}: {
  kidName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left",
        "rounded-[2.75rem] md:rounded-[3.25rem]",
        "bg-blue border-4 border-white",
        "shadow-[0_14px_0_#1D6FA3]",
        "p-5 md:p-8",
        "relative overflow-hidden",
        "hover:-translate-y-1 transition",
        "focus:outline-none focus:ring-4 focus:ring-blue/25",
        "min-h-[360px] md:min-h-[460px]",
      ].join(" ")}
    >
      {/* decorative shapes */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/15" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-52 w-52 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute top-10 right-8 opacity-25">
        <Sparkles className="w-10 h-10 text-white" />
      </div>

      {/* ribbon */}
      <div className="absolute top-6 right-6">
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-gold text-navy font-black text-sm shadow-[0_6px_0_rgba(0,0,0,0.10)]">
          <Star className="w-4 h-4 text-navy fill-navy" />
          NOUVEAU
        </span>
      </div>

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-white/15 border-2 border-white/20 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="text-white">
            <div className="text-xs font-black uppercase tracking-widest opacity-90">
              Leçon du jour
            </div>
            <div className="text-2xl md:text-3xl font-black leading-tight">
              {kidName}, prêt(e) pour jouer ?
            </div>
          </div>
        </div>

        {/* big title */}
        <div className="mt-10 md:mt-14 text-center">
          <div className="text-6xl md:text-7xl font-black text-white drop-shadow-[0_6px_0_rgba(0,0,0,0.18)]">
            MAGIC
          </div>
          <div className="inline-flex items-center gap-3 mt-3 px-5 py-3 rounded-2xl bg-white text-navy font-black text-2xl md:text-3xl shadow-[0_10px_0_rgba(0,0,0,0.12)]">
            ACADEMY
          </div>

          <div className="mt-8 flex items-center justify-center">
            <span className="inline-flex items-center gap-3 px-7 py-4 rounded-4xl bg-teal text-white font-black text-xl md:text-2xl shadow-[0_10px_0_#006666]">
              <PlayCircle className="w-7 h-7 fill-current" />
              JOUER LA LEÇON
              <ArrowRight className="w-6 h-6" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function KidActionCard({
  title,
  subtitle,
  emoji,
  tone,
  icon,
  onClick,
}: {
  title: string;
  subtitle: string;
  emoji: string;
  tone: "yellow" | "turquoise" | "blue" | "orange";
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const toneStyles: Record<
    typeof tone,
    { bg: string; shadow: string; pill: string; iconWrap: string }
  > = {
    yellow: {
      bg: "bg-yellow",
      shadow: "shadow-[0_10px_0_rgba(0,0,0,0.18)]",
      pill: "bg-white text-navy",
      iconWrap: "bg-navy/10 border-navy/20",
    },
    turquoise: {
      bg: "bg-turquoise",
      shadow: "shadow-[0_10px_0_rgba(0,0,0,0.18)]",
      pill: "bg-white text-navy",
      iconWrap: "bg-white/15 border-white/25",
    },
    blue: {
      bg: "bg-deepBlue",
      shadow: "shadow-[0_10px_0_rgba(0,0,0,0.20)]",
      pill: "bg-white text-navy",
      iconWrap: "bg-white/15 border-white/25",
    },
    orange: {
      bg: "bg-orange",
      shadow: "shadow-[0_10px_0_rgba(0,0,0,0.18)]",
      pill: "bg-white text-navy",
      iconWrap: "bg-navy/10 border-navy/20",
    },
  };

  const s = toneStyles[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left rounded-[2.25rem] p-5 md:p-6",
        s.bg,
        "border-4 border-white",
        s.shadow,
        "relative overflow-hidden",
        "hover:-translate-y-1 transition",
        "focus:outline-none focus:ring-4 focus:ring-blue/20",
      ].join(" ")}
    >
      {/* pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-size-[18px_18px]" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-white/90">
            {subtitle}
          </div>
          <div className="mt-1 flex items-center gap-3">
            <div className="text-3xl md:text-4xl">{emoji}</div>
            <div className="text-2xl md:text-3xl font-black text-white leading-none">
              {title}
            </div>
          </div>
        </div>

        <div
          className={[
            "h-12 w-12 rounded-2xl border-2 flex items-center justify-center",
            s.iconWrap,
          ].join(" ")}
        >
          {icon}
        </div>
      </div>

      <div className="relative mt-5 flex items-center justify-between">
        <span
          className={["px-4 py-2 rounded-2xl font-black text-sm", s.pill].join(
            " ",
          )}
        >
          OUVRIR
        </span>

        <span className="inline-flex items-center gap-2 text-white/95 font-black">
          GO <ArrowRight className="w-5 h-5" />
        </span>
      </div>
    </button>
  );
}

export default KidDashboard;
