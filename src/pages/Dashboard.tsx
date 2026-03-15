import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Gamepad2,
  HelpCircle,
  PlayCircle,
  Star,
  Trophy,
  Zap,
  X,
  Sparkles,
} from "lucide-react";

import { Navbar } from "../components/layout/Navbar";
import { Card, CardHeader, CardSection } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

import { useAuth } from "../context/AuthContextDefinition";
import { useKidMode } from "../hooks/useKidMode";

import { freeTrialService } from "../services/free-trial.service";
import { bookingService } from "../services/booking.service";
import { subscriptionService } from "../services/subscription.service";
import { kidService } from "../services/kid.service";

import type { Booking, Subscription, FreeTrialBooking } from "../types/auth";

const MOCK_ACTIVITIES = [
  {
    id: 1,
    type: "quiz",
    title: 'Quiz "Les Animaux" complété',
    date: "Hier",
    score: "8/10",
  },
  {
    id: 2,
    type: "video",
    title: 'Vidéo "Les Couleurs" regardée',
    date: "Il y a 2 jours",
  },
  {
    id: 3,
    type: "achievement",
    title: 'Badge "Explorateur" débloqué',
    date: "Il y a 3 jours",
  },
] as const;

function formatDateFR(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTime(timeString: string) {
  return timeString?.substring(0, 5) || "";
}

/** Small helper: accent card wrapper (no gradients) */
function AccentShell({
  accent = "blue",
  children,
  className = "",
}: {
  accent?: "blue" | "lightBlue" | "gold" | "orange" | "turquoise" | "teal";
  children: React.ReactNode;
  className?: string;
}) {
  const bar =
    accent === "gold"
      ? "bg-gold"
      : accent === "orange"
        ? "bg-orange"
        : accent === "turquoise"
          ? "bg-turquoise"
          : accent === "teal"
            ? "bg-teal"
            : accent === "lightBlue"
              ? "bg-lightBlue"
              : "bg-blue";

  return (
    <div className={`relative rounded-2xl ${className}`}>
      <div
        className={`absolute left-0 top-0 h-full w-1.5 rounded-l-2xl ${bar}`}
      />
      <div className="pl-4 pr-5 py-5 md:pl-5 md:pr-6 md:py-6">{children}</div>
    </div>
  );
}

const StatCard = ({
  icon,
  label,
  value,
  hint,
  accent = "blue",
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: "blue" | "gold" | "turquoise" | "orange";
  onClick?: () => void;
}) => {
  const iconWrap =
    accent === "gold"
      ? "bg-gold/15 border-gold/25 text-gold"
      : accent === "turquoise"
        ? "bg-turquoise/15 border-turquoise/25 text-teal"
        : accent === "orange"
          ? "bg-orange/15 border-orange/25 text-orange"
          : "bg-blue/15 border-blue/25 text-blue";

  return (
    <Card variant="default" className="p-0">
      <AccentShell accent={accent === "turquoise" ? "turquoise" : accent}>
        <div className="flex items-start justify-between gap-3">
          <div
            className={`h-10 w-10 rounded-xl border flex items-center justify-center ${iconWrap}`}
          >
            {icon}
          </div>

          {onClick ? (
            <button
              type="button"
              onClick={onClick}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue hover:text-deepBlue"
            >
              Ouvrir <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs font-semibold text-navy/40"> </span>
          )}
        </div>

        <div className="mt-4">
          <div className="text-2xl md:text-3xl font-semibold tracking-tight text-navy">
            {value}
          </div>
          <div className="text-sm font-medium text-navy/70 mt-1">{label}</div>
          {hint ? (
            <div className="text-xs text-navy/55 mt-1">{hint}</div>
          ) : null}
        </div>
      </AccentShell>
    </Card>
  );
};

const ActivityIcon = ({
  type,
}: {
  type: (typeof MOCK_ACTIVITIES)[number]["type"];
}) => {
  if (type === "quiz") return <BookOpen className="w-5 h-5" />;
  if (type === "video") return <PlayCircle className="w-5 h-5" />;
  return <Trophy className="w-5 h-5" />;
};

type UnifiedBooking = {
  id: string | number;
  displayType: "FREE_TRIAL" | "REGULAR";
  date: string;
  start: string;
  end: string;
  kidId?: string | number;
  // Add other properties if needed for display, e.g., course name
  courseName?: string;
};

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { enterKidMode, selectedKid, updateSelectedKid } = useKidMode();

  const [nextBooking, setNextBooking] = useState<UnifiedBooking | null>(null);
  const [stats, setStats] = useState({
    credits: 0,
    booked: 0,
    finished: 0,
    activeSubId: null as string | null,
  });
  const [loading, setLoading] = useState(true);

  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Sync selectedKid with user.kids to avoid stale data
  const { exitKidMode } = useKidMode();

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

  // Fetch latest level from backend periodically or on change
  useEffect(() => {
    if (!selectedKid) return;

    const fetchLevel = async () => {
      try {
        const { level } = await kidService.getLevel(selectedKid.id);
        if (level && level !== selectedKid.level) {
          updateSelectedKid({ ...selectedKid, level });
        }
      } catch (err) {
        console.error("Failed to fetch latest level", err);
      }
    };

    fetchLevel();
  }, [selectedKid?.id, updateSelectedKid, selectedKid]);

  // Auto-select first kid if none selected
  useEffect(() => {
    if (user?.kids && user.kids.length > 0 && !selectedKid) {
      updateSelectedKid(user.kids[0]);
    }
  }, [user, selectedKid, updateSelectedKid]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        const [trialBookings, regularBookings, kidSubscriptions]: [
          FreeTrialBooking[],
          Booking[],
          Subscription[],
        ] = await Promise.all([
          freeTrialService.getUserBookings(user.id),
          selectedKid
            ? bookingService.getKidBookings(selectedKid.id.toString())
            : Promise.resolve([]),
          selectedKid
            ? subscriptionService.getKidSubscriptions(selectedKid.id.toString())
            : Promise.resolve([]),
        ]);

        const kidTrials = selectedKid
          ? trialBookings.filter((b) => b.kidId === selectedKid.id)
          : trialBookings;

        // Unify for "Next Class"
        const unifiedUpcoming = [
          ...kidTrials
            .filter((b) => b.status === "CONFIRMED" && b.session)
            .map((b) => ({
              ...b,
              displayType: "FREE_TRIAL" as const,
              date: b.session!.date,
              start: b.session!.startTime,
              end: b.session!.endTime,
            })),
          ...regularBookings
            .filter((b) => b.status === "SCHEDULED")
            .map((b) => ({
              ...b,
              displayType: "REGULAR" as const,
              date: b.sessionDate,
              start: b.startTime,
              end: b.endTime,
            })),
        ]
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.start}`);
            const dateB = new Date(`${b.date}T${b.start}`);
            return dateA.getTime() - dateB.getTime();
          })
          .filter((b) => new Date(`${b.date}T${b.start}`) > new Date());

        setNextBooking(unifiedUpcoming[0] || null);

        // ── Stats ──────────────────────────────────────────────────────────
        // credits  = unbooked credits remaining on the active subscription
        // booked   = SCHEDULED bookings only (confirmed but not yet done)
        // finished = COMPLETED bookings
        let credits = 0;
        let booked = 0;
        let finished = 0;

        if (selectedKid) {
          // Regular bookings (from subscription)
          finished += regularBookings.filter(
            (b) => b.status === "COMPLETED",
          ).length;
          booked += regularBookings.filter(
            (b) => b.status === "SCHEDULED",
          ).length;

          const now = new Date();

          const freeTrialCompleted = kidTrials.filter(
            (b) =>
              b.status === "CONFIRMED" &&
              b.session &&
              new Date(`${b.session.date}T${b.session.endTime}`) < now,
          ).length;

          // Upcoming free-trial bookings (not yet past end time)
          const freeTrialBooked = kidTrials.filter(
            (b) =>
              b.status === "CONFIRMED" &&
              b.session &&
              new Date(`${b.session.date}T${b.session.endTime}`) >= now,
          ).length;

          finished += freeTrialCompleted;
          booked += freeTrialBooked;

          // Credits = remaining unbooked credits on the active subscription
          const activeSub = kidSubscriptions.find((s) => s.status === "ACTIVE");
          credits = activeSub
            ? activeSub.remainingCredits
            : (user.credits ?? 0);

          setStats({
            credits,
            booked,
            finished,
            activeSubId: activeSub?.id || null,
          });
        } else {
          // No kid selected — fall back to user-level credits
          credits = user.credits ?? 0;
          setStats({ credits, booked, finished, activeSubId: null });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, selectedKid]);

  const handleCancelBooking = async () => {
    if (!nextBooking || !user?.id) return;

    setCanceling(true);
    try {
      if (nextBooking.displayType === "FREE_TRIAL") {
        await freeTrialService.cancelBooking(Number(nextBooking.id), user.id);
      } else {
        await bookingService.cancelBooking(String(nextBooking.id));
      }
      await refreshProfile();
      setNextBooking(null);
      setShowCancelConfirm(false);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Erreur lors de l'annulation de la réservation");
    } finally {
      setCanceling(false);
    }
  };

  const handleReschedule = async () => {
    if (!nextBooking || !user?.id) return;

    setCanceling(true);
    try {
      if (nextBooking.displayType === "FREE_TRIAL") {
        await freeTrialService.cancelBooking(Number(nextBooking.id), user.id);
        navigate(`/free-trial-booking?userId=${user.id}`);
      } else {
        // For regular bookings, reschedule means cancel then go to book-classes
        await bookingService.cancelBooking(String(nextBooking.id));
        navigate("/schedule");
      }
      await refreshProfile();
    } catch (error) {
      console.error("Failed to reschedule:", error);
      alert("Erreur lors de la reprogrammation");
      setCanceling(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 text-navy">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
        {/* Header row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-6">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Bonjour, <span className="text-blue">{user?.firstName}</span> 👋
            </h1>

            <p className="text-navy/60 mt-1">
              Prêt pour une nouvelle journée d&apos;apprentissage ?
            </p>
          </div>

          {/* Kid Mode — HIGH VISIBILITY */}
          <div className="lg:col-span-3">
            <Card variant="default" className="p-0">
              <AccentShell
                accent="orange"
                className="bg-white border border-orange/25 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (selectedKid) navigate("/kid-dashboard");
                    else if (user?.kids && user.kids.length === 1) {
                      enterKidMode(user.kids[0]);
                      navigate("/kid-dashboard");
                    } else navigate("/kid-dashboard");
                  }}
                  className="
                    w-full text-left
                    rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-orange/30
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange/15 border border-orange/25 flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-5 h-5 text-orange" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-navy">
                        Mode Enfant
                      </div>
                      <div className="text-[11px] text-navy/70 mt-0.5">
                        Jeux & activités
                      </div>
                    </div>

                    <div className="h-8 w-8 rounded-lg bg-blue/10 border border-blue/20 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-blue" />
                    </div>
                  </div>
                </button>
              </AccentShell>
            </Card>
          </div>

          {/* Subscription — PREMIUM ACCESS */}
          <div className="lg:col-span-3">
            <Card variant="default" className="p-0">
              <AccentShell
                accent="gold"
                className="bg-white border border-gold/25 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => navigate("/subscription")}
                  className="
                    w-full text-left
                    rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-gold/30
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-gold" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-navy">
                        Abonnement
                      </div>
                      <div className="text-[11px] text-navy/70 mt-0.5">
                        Des cours 1 à 1
                      </div>
                    </div>

                    <div className="h-8 w-8 rounded-lg bg-blue/10 border border-blue/20 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-blue" />
                    </div>
                  </div>
                </button>
              </AccentShell>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Credits = purchased but not yet booked */}
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            label="Crédits disponibles"
            value={loading ? "…" : stats.credits}
            hint="Cours achetés non encore réservés"
            accent="gold"
            onClick={() => {
              if (stats.credits > 0) {
                const url = stats.activeSubId
                  ? `/book-classes?subscriptionId=${stats.activeSubId}`
                  : `/book-classes`;
                navigate(url);
              } else {
                navigate("/subscription");
              }
            }}
          />
          {/* Booked = SCHEDULED (confirmed, upcoming) */}
          <StatCard
            icon={<BookOpen className="w-5 h-5" />}
            label="Cours réservés"
            value={loading ? "…" : stats.booked}
            hint="Séances planifiées à venir"
            accent="blue"
            onClick={() => navigate("/schedule")}
          />
          {/* Finished = COMPLETED */}
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Cours terminés"
            value={loading ? "…" : stats.finished}
            hint="Séances déjà effectuées"
            accent="turquoise"
          />
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Main */}
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
            {/* Next booking — NO gradients, HIGH CLARITY */}
            <Card variant="default" className="p-0">
              <AccentShell
                accent="lightBlue"
                className="bg-white border border-lightBlue/25 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue" />
                    </div>
                    <div>
                      <div className="font-semibold text-navy">
                        {selectedKid
                          ? `Prochain cours de ${selectedKid.name}`
                          : "Prochain cours"}
                      </div>
                      <div className="text-sm text-navy/60">
                        Gérez votre prochain créneau.
                      </div>
                    </div>
                  </div>

                  <button
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold
                      text-blue hover:text-deepBlue border border-blue/20 hover:bg-blue/10 transition"
                    onClick={() => navigate("/schedule")}
                    type="button"
                  >
                    Planning <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-5">
                  {loading ? (
                    <div className="py-10 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-beige border-t-blue" />
                    </div>
                  ) : nextBooking ? (
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Details */}
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
                          <Star className="w-6 h-6 text-gold fill-gold" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {nextBooking.displayType === "FREE_TRIAL" ? (
                              <span className="text-[11px] font-bold uppercase tracking-wider text-deepBlue bg-lightBlue/15 border border-lightBlue/25 px-2 py-1 rounded-lg">
                                Cours d’essai
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold uppercase tracking-wider text-blue bg-blue/15 border border-blue/25 px-2 py-1 rounded-lg">
                                Cours Standard
                              </span>
                            )}
                            <span className="text-[11px] font-bold uppercase tracking-wider text-teal bg-turquoise/15 border border-turquoise/25 px-2 py-1 rounded-lg">
                              À venir
                            </span>
                          </div>

                          <div className="mt-2 font-semibold text-navy">
                            {nextBooking.displayType === "FREE_TRIAL"
                              ? "L'aventure TaraKid commence !"
                              : "Prêt pour votre prochain cours ?"}
                          </div>

                          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 text-sm text-navy/70">
                              <Calendar className="w-4 h-4 text-blue" />
                              <span className="font-medium">
                                {formatDateFR(nextBooking.date)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-navy/70">
                              <Clock className="w-4 h-4 text-blue" />
                              <span className="font-medium">
                                {formatTime(nextBooking.start)} –{" "}
                                {formatTime(nextBooking.end)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="w-full lg:w-auto lg:ml-auto flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => {
                            if (selectedKid) {
                              enterKidMode(selectedKid);
                              navigate("/kid-dashboard");
                            } else {
                              navigate("/kid-dashboard");
                            }
                          }}
                        >
                          Se connecter
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleReschedule}
                          disabled={canceling}
                          className="rounded-xl border-blue/30 text-blue hover:bg-blue/10"
                        >
                          Reporter
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => setShowCancelConfirm(true)}
                          disabled={canceling}
                          className="rounded-xl border-orange/30 text-orange hover:bg-orange/10"
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-beige border border-slate-200 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-navy/40" />
                      </div>
                      <div className="mt-3 font-semibold text-navy">
                        Aucun cours programmé
                      </div>
                      <div className="text-sm text-navy/60 mt-1">
                        Réservez votre prochain créneau dès maintenant.
                      </div>
                      <div className="mt-4 flex justify-center">
                        <Button
                          onClick={() =>
                            navigate(`/free-trial-booking?userId=${user?.id}`)
                          }
                          className="bg-blue text-white hover:bg-deepBlue rounded-xl px-6"
                        >
                          Réserver un cours
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </AccentShell>
            </Card>

            {/* Activities (keep simple) */}
            <Card variant="default" className="p-5 md:p-6">
              <CardHeader
                title="Activité récente"
                subtitle="Historique des activités et progrès."
              />
              <CardSection className="space-y-2">
                {MOCK_ACTIVITIES.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-xl border border-slate-200 bg-beige/40 flex items-center justify-center">
                      <ActivityIcon type={a.type} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate text-navy">
                        {a.title}
                      </div>
                      <div className="text-sm text-navy/60">{a.date}</div>
                    </div>

                    {"score" in a && a.score ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-turquoise/15 border border-turquoise/25 text-teal">
                        {a.score}
                      </span>
                    ) : null}

                    <ArrowRight className="w-4 h-4 text-navy/25" />
                  </div>
                ))}
              </CardSection>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            {/* Level (as you like) */}
            <Card
              variant="blue"
              className="relative overflow-hidden p-5 md:p-6"
            >
              <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10" />
              <div className="absolute right-4 top-4 opacity-20">
                <Trophy className="w-14 h-14" />
              </div>

              <CardHeader
                title={
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow fill-yellow" />
                    <span>Niveau {selectedKid?.level || "L0"}</span>
                  </div>
                }
                subtitle={
                  <span className="text-white/80">
                    {(() => {
                      switch (selectedKid?.level) {
                        case "L0":
                          return "Pre-K Explorer";
                        case "L1":
                          return "Junior Starter";
                        case "L2":
                          return "Starter";
                        case "L3":
                          return "Mover";
                        case "L4":
                          return "Flyer";
                        case "L5":
                          return "Master Explorer";
                        default:
                          return "Aventure TaraKid";
                      }
                    })()}
                  </span>
                }
              />

              <CardSection>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-turquoise transition-all duration-500"
                    style={{
                      width: (() => {
                        switch (selectedKid?.level) {
                          case "L0":
                            return "0%";
                          case "L1":
                            return "20%";
                          case "L2":
                            return "40%";
                          case "L3":
                            return "60%";
                          case "L4":
                            return "80%";
                          case "L5":
                            return "100%";
                          default:
                            return "0%";
                        }
                      })(),
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-white/80">
                  Progression de l'apprentissage
                </div>
              </CardSection>
            </Card>

            {/* Quick actions — VERY visible, very accessible (no gradients) */}
            <Card variant="default" className="p-0">
              <AccentShell
                accent="gold"
                className="bg-white border border-gold/25 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <div className="font-semibold text-navy">
                        Actions rapides
                      </div>
                      <div className="text-sm text-navy/60">
                        Accès direct aux pages importantes
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/subscription")}
                    className="
                      w-full text-left
                      rounded-2xl p-4
                      border border-slate-200 bg-white
                      hover:border-gold/35 hover:bg-gold/10
                      transition
                      focus:outline-none focus:ring-2 focus:ring-gold/35
                    "
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-xs font-semibold text-navy/60">
                            Abonnement
                          </div>
                          <div className="font-semibold text-navy">
                            Recharger
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-navy/35" />
                    </div>
                    <div className="mt-2 text-xs text-navy/60">
                      Ajoutez des crédits rapidement.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/schedule")}
                    className="
                      w-full text-left
                      rounded-2xl p-4
                      border border-slate-200 bg-white
                      hover:border-blue/35 hover:bg-blue/10
                      transition
                      focus:outline-none focus:ring-2 focus:ring-blue/35
                    "
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-xs font-semibold text-navy/60">
                            Planning
                          </div>
                          <div className="font-semibold text-navy">Voir</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-navy/35" />
                    </div>
                    <div className="mt-2 text-xs text-navy/60">
                      Consultez et organisez vos cours.
                    </div>
                  </button>
                </div>
              </AccentShell>
            </Card>

            {/* Support */}
            <Card variant="default" className="p-5 md:p-6">
              <CardHeader
                title={
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-teal" />
                    <span>Besoin d&apos;aide ?</span>
                  </div>
                }
                subtitle="Vérifiez votre matériel avant le prochain cours."
              />
              <CardSection>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-teal/30 text-teal hover:bg-teal/10 rounded-xl"
                >
                  Tester mon matériel
                </Button>
              </CardSection>
            </Card>
          </div>
        </div>
      </main>

      {/* Cancel Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card variant="default" className="p-5 md:p-6 relative">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="absolute right-4 top-4 p-2 rounded-lg hover:bg-slate-50"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 text-navy/50" />
              </button>

              <div className="font-semibold text-lg text-navy">
                Annuler le cours ?
              </div>
              <div className="text-sm text-navy/60 mt-2">
                Vous pourrez toujours réserver un autre créneau plus tard.
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={canceling}
                  className="border-blue/25 text-blue hover:bg-blue/10 rounded-xl"
                >
                  Garder
                </Button>
                <Button
                  onClick={handleCancelBooking}
                  className="bg-orange text-white hover:bg-orange/90 rounded-xl"
                  loading={canceling}
                >
                  Oui, annuler
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
