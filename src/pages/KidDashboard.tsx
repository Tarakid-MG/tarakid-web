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
};

function formatNextClassFR(date?: string, start?: string) {
  if (!date || !start) return "Aucun cours prévu";
  const d = new Date(`${date}T${start}`);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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

        const kidFreeTrials = freeTrialBookings.filter(
          (b) =>
            String(b.kidId) === String(selectedKid.id) &&
            b.status === "CONFIRMED",
        );
        const kidRegulars = regularBookings.filter(
          (b) => b.status === "SCHEDULED",
        );

        const allUpcoming = (
          [
            ...kidFreeTrials.map((b) => ({
              ...b,
              date: b.session?.date,
              startTime: b.session?.startTime,
              type: "FREE_TRIAL" as const,
            })),
            ...kidRegulars.map((b) => ({
              ...b,
              date: b.sessionDate,
              startTime: b.startTime,
              type: "REGULAR" as const,
            })),
          ] as UnifiedBooking[]
        )
          .filter((b) => b.date && b.startTime)
          .sort((a, b) => {
            const A = new Date(`${a.date}T${a.startTime}`).getTime();
            const B = new Date(`${b.date}T${b.startTime}`).getTime();
            return A - B;
          })
          .filter((b) => new Date(`${b.date}T${b.startTime}`) > new Date());

        setNextClass(allUpcoming[0] || null);
      } catch (error) {
        console.error("Failed to fetch next class for kid dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedKid) fetchNextClass();
  }, [selectedKid, user]);

  const nextClassDate = useMemo(() => {
    return nextClass
      ? formatNextClassFR(nextClass.date, nextClass.startTime)
      : "Aucun cours prévu";
  }, [nextClass]);

  // ── Live entry-gate & countdown ──────────────────────────────────────
  // canEnter  = class exists AND we are within 5 min before (or after) start
  // countdown = human-readable time remaining until the 5-min window opens
  const ENTRY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  const computeGate = useCallback(() => {
    if (!nextClass?.date || !nextClass?.startTime) {
      return { canEnter: false, countdown: null };
    }
    const startMs = new Date(
      `${nextClass.date}T${nextClass.startTime}`,
    ).getTime();
    const windowOpens = startMs - ENTRY_WINDOW_MS;
    const now = Date.now();
    const diffToWindow = windowOpens - now;

    if (diffToWindow <= 0) {
      // Window is open — class has started or is within 5 min
      return { canEnter: true, countdown: null };
    }

    // Format remaining time as HH:MM:SS
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
    // Recompute immediately when nextClass changes
    setGate(computeGate());

    // Then tick every second
    intervalRef.current = setInterval(() => {
      setGate(computeGate());
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [computeGate]);

  const { canEnter, countdown } = gate;
  // ─────────────────────────────────────────────────────────────────────

  if (!isKidMode || !selectedKid) {
    return <KidProfileSelector kids={user?.kids || []} />;
  }

  const handleEnterClassroom = () => {
    navigate(`/classroom/${nextClass?.id}`);
  };

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
