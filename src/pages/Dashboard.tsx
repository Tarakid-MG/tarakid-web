import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Star,
  BookOpen,
  PlayCircle,
  CheckCircle,
  Circle,
  Gamepad2,
  ArrowRight,
  Plus,
  Calendar,
  Clock,
  Trophy,
  HelpCircle,
  Zap,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContextDefinition";
import { freeTrialService } from "../services/free-trial.service";
import { bookingService } from "../services/booking.service";
import { subscriptionService } from "../services/subscription.service";
import type { FreeTrialBooking, Booking, Subscription } from "../types/auth";
import { useKidMode } from "../hooks/useKidMode";
import { Navbar } from "../components/layout/Navbar";

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
];

const Dashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { enterKidMode, selectedKid } = useKidMode();
  const [nextBooking, setNextBooking] = useState<FreeTrialBooking | null>(null);
  const [stats, setStats] = useState({ total: 0, finished: 0, left: 0 });
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Auto-select first kid if none selected
  useEffect(() => {
    if (user?.kids && user.kids.length > 0 && !selectedKid) {
      enterKidMode(user.kids[0]);
    }
  }, [user, selectedKid, enterKidMode]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        const bookings = await freeTrialService.getUserBookings(user.id);

        // Filter by selected kid if applicable
        const relevantBookings = selectedKid
          ? bookings.filter((b) => b.kidId === selectedKid.id)
          : bookings;

        // Find next upcoming booking that's confirmed
        const upcoming = relevantBookings
          .filter(
            (b: FreeTrialBooking) => b.status === "CONFIRMED" && b.session,
          )
          .sort((a: FreeTrialBooking, b: FreeTrialBooking) => {
            const dateA = new Date(
              `${a.session!.date}T${a.session!.startTime}`,
            );
            const dateB = new Date(
              `${b.session!.date}T${b.session!.startTime}`,
            );
            return dateA.getTime() - dateB.getTime();
          })[0];

        setNextBooking(upcoming || null);

        // Calculate Stats
        let completedCount = 0;
        let totalBookedCount = 0;
        let remainingCredits = 0;

        if (selectedKid) {
          try {
            const [kidBookings, kidSubscriptions]: [Booking[], Subscription[]] =
              await Promise.all([
                bookingService.getKidBookings(selectedKid.id.toString()),
                subscriptionService.getKidSubscriptions(
                  selectedKid.id.toString(),
                ),
              ]);

            // Regular bookings stats
            const regularCompleted = kidBookings.filter(
              (b) => b.status === "COMPLETED",
            ).length;
            const regularBooked = kidBookings.filter((b) =>
              ["SCHEDULED", "COMPLETED"].includes(b.status),
            ).length;

            // Free trial stats for this kid
            const kidFreeTrials = bookings.filter(
              (b) => b.kidId === selectedKid.id,
            );
            const now = new Date();
            const freeTrialCompleted = kidFreeTrials.filter(
              (b) =>
                b.status === "CONFIRMED" &&
                b.session &&
                new Date(`${b.session.date}T${b.session.endTime}`) < now,
            ).length;
            const freeTrialBooked = kidFreeTrials.filter(
              (b) => b.status === "CONFIRMED",
            ).length;

            completedCount = regularCompleted + freeTrialCompleted;
            totalBookedCount = regularBooked + freeTrialBooked;

            // Subscription stats
            const activeSub = kidSubscriptions.find(
              (s) => s.status === "ACTIVE",
            );
            remainingCredits = activeSub
              ? activeSub.remainingCredits
              : user.credits || 0;
          } catch (err) {
            console.error("Failed to fetch kid data for stats", err);
          }
        } else {
          // Fallback if no kid selected (though we auto-select)
          remainingCredits = user.credits || 0;
        }

        setStats({
          total: totalBookedCount,
          finished: completedCount,
          left: remainingCredits,
        });
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
      await freeTrialService.cancelBooking(nextBooking.id, user.id);
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
      await freeTrialService.cancelBooking(nextBooking.id, user.id);
      await refreshProfile();
      navigate(`/free-trial-booking?userId=${user.id}`);
    } catch (error) {
      console.error("Failed to reschedule:", error);
      alert("Erreur lors de la reprogrammation");
      setCanceling(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar />

      <main className="grow p-6 md:p-8 max-w-7xl mx-auto w-full space-y-10">
        {/* Welcome & My Kids Section */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black text-navy mb-3 tracking-tight">
                Bonjour,{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue to-turquoise">
                  {user?.firstName}
                </span>{" "}
                {selectedKid ? (
                  <span className="block text-3xl mt-1 text-navy/80 font-bold">
                    (pour {selectedKid.name}) 👋
                  </span>
                ) : (
                  "👋"
                )}
              </h1>
              <p className="text-navy/60 font-medium text-xl">
                Prêt pour une nouvelle journée d'apprentissage ?
              </p>
            </div>

            <Card
              className="bg-linear-to-r from-orange to-yellow border-none p-1 pr-1 shadow-xl shadow-orange/20 hover:shadow-2xl hover:shadow-orange/30 transition-all hover:-translate-y-1 hover:scale-[1.02] cursor-pointer group w-full md:w-auto overflow-hidden relative"
              onClick={() => {
                if (selectedKid) {
                  navigate("/kid-dashboard");
                } else if (user?.kids && user.kids.length === 1) {
                  enterKidMode(user.kids[0]);
                  navigate("/kid-dashboard");
                } else {
                  navigate("/kid-dashboard"); // Opens selector if multiple or none
                }
              }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <Gamepad2 className="w-24 h-24 -rotate-12 text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-8 py-4 flex items-center gap-6 justify-between md:justify-start relative z-10">
                <div className="flex items-center gap-5">
                  <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Gamepad2 className="w-8 h-8 text-orange" />
                  </div>
                  <div className="text-white text-left">
                    <div className="font-black text-2xl leading-none mb-1">
                      Mode Enfant
                    </div>
                    <div className="text-white/90 text-sm font-bold">
                      Accéder aux jeux & activités
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Subscription Status */}
          <div className="mb-0">
            <Card
              variant="navy"
              className="p-8 relative overflow-hidden text-white bg-linear-to-r from-navy via-blue-900 to-blue border-none shadow-2xl shadow-blue/20 group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <Zap className="w-48 h-48 rotate-12" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                      <Zap className="w-6 h-6 text-yellow" />
                    </div>
                    <h3 className="text-2xl font-black tracking-wide">
                      Mon Abonnement
                    </h3>
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${user?.subscriptionPlan ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-white/10 text-white/60 border border-white/10"}`}
                    >
                      {user?.subscriptionPlan || "Découverte"}
                    </span>
                  </div>
                  <p className="text-blue-100 font-medium max-w-lg text-lg leading-relaxed">
                    Gérez vos crédits pour réserver des cours réguliers et
                    suivre la progression.
                  </p>
                </div>

                <div className="flex items-center gap-8 bg-black/20 p-6 rounded-3xl backdrop-blur-md border border-white/10 hover:bg-black/30 transition-colors">
                  <div className="text-center min-w-[100px]">
                    <p className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-yellow to-orange leading-none mb-2 drop-shadow-sm">
                      {user?.credits || 0}
                    </p>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
                      Crédits
                    </p>
                  </div>
                  <div className="w-px h-16 bg-linear-to-b from-transparent via-white/20 to-transparent"></div>
                  <div className="flex flex-col gap-3 w-full">
                    <Button
                      onClick={() => navigate("/subscription")}
                      size="sm"
                      className="bg-yellow text-navy hover:bg-yellow/90 font-black text-sm w-full shadow-lg shadow-yellow/20"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Recharger
                    </Button>
                    <button
                      onClick={() => navigate("/schedule")}
                      className="text-white/70 text-xs font-bold hover:text-white transition-colors flex items-center justify-center p-2 hover:bg-white/5 rounded-lg"
                    >
                      <Calendar className="w-3 h-3 mr-2" /> Voir le Planning
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-blue-50/50 border-none shadow-lg shadow-blue/5 hover:shadow-xl hover:shadow-blue/10 hover:-translate-y-1 transition-all duration-300 flex items-center space-x-6 group cursor-default">
            <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center text-blue group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-10 h-10" />
            </div>
            <div>
              <p className="text-xs font-black text-navy/40 uppercase tracking-widest mb-1">
                Total Cours
              </p>
              <h3 className="text-4xl font-black text-navy tracking-tight">
                {stats.total}
              </h3>
            </div>
          </Card>
          <Card className="p-6 bg-green-50/50 border-none shadow-lg shadow-green-500/5 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300 flex items-center space-x-6 group cursor-default">
            <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <p className="text-xs font-black text-navy/40 uppercase tracking-widest mb-1">
                Terminés
              </p>
              <h3 className="text-4xl font-black text-navy tracking-tight">
                {stats.finished}
              </h3>
            </div>
          </Card>
          <Card className="p-6 bg-orange-50/50 border-none shadow-lg shadow-orange-500/5 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 flex items-center space-x-6 group cursor-default">
            <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center text-orange group-hover:scale-110 transition-transform duration-300">
              <Circle className="w-10 h-10" />
            </div>
            <div>
              <p className="text-xs font-black text-navy/40 uppercase tracking-widest mb-1">
                Restants
              </p>
              <h3 className="text-4xl font-black text-navy tracking-tight">
                {stats.left}
              </h3>
            </div>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Next Class Card (Featured) */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-navy tracking-tight">
                  {selectedKid
                    ? `Prochain cours pour ${selectedKid.name}`
                    : "Votre Prochain Cours"}
                </h2>
                {nextBooking && (
                  <span className="px-4 py-1.5 bg-yellow/20 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest border border-yellow/20">
                    Cours d'essai
                  </span>
                )}
              </div>

              {loading ? (
                <Card
                  variant="blue"
                  className="p-12 flex items-center justify-center border-none shadow-xl bg-white/50 backdrop-blur-sm"
                >
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-blue"></div>
                </Card>
              ) : nextBooking && nextBooking.session ? (
                <Card
                  variant="navy"
                  className="p-8 relative overflow-hidden text-white bg-linear-to-r from-navy via-blue-900 to-blue border-none shadow-2xl shadow-blue/20 group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <Sparkles className="w-64 h-64 rotate-12" />
                  </div>

                  <div className="p-8 md:p-10 text-white relative z-10 ">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-110"></div>
                        <div className="w-28 h-28 rounded-full border-4 border-white/20 overflow-hidden bg-white/10 shrink-0 relative z-10 shadow-lg">
                          <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher"
                            alt="Professeur"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="grow text-center md:text-left space-y-2">
                        <h3 className="text-3xl font-black mb-2 tracking-tight">
                          Cours d'essai gratuit
                        </h3>
                        <div className="flex flex-col md:flex-row gap-6 text-blue-50 font-bold text-lg">
                          <div className="flex items-center justify-center md:justify-start gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                            <Calendar className="w-5 h-5 text-yellow" />
                            <span>{formatDate(nextBooking.session.date)}</span>
                          </div>
                          <div className="flex items-center justify-center md:justify-start gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                            <Clock className="w-5 h-5 text-yellow" />
                            <span>
                              {formatTime(nextBooking.session.startTime)} -{" "}
                              {formatTime(nextBooking.session.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 shrink-0 min-w-[180px]">
                        <Button
                          variant="inverse"
                          size="lg"
                          className="group-hover:scale-105 transition-all duration-300 shadow-xl shadow-blue/20 bg-white text-blue font-black border-2 border-transparent hover:border-white/50"
                        >
                          <PlayCircle className="w-6 h-6 fill-current mr-2" />
                          Se Connecter
                        </Button>

                        <div className="flex gap-2">
                          <button
                            onClick={handleReschedule}
                            disabled={canceling}
                            className="flex-1 px-4 py-3 bg-black/20 hover:bg-black/30 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 backdrop-blur-md"
                          >
                            Reporter
                          </button>
                          <button
                            onClick={() => setShowCancelConfirm(true)}
                            disabled={canceling}
                            className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 backdrop-blur-md"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card
                  variant="blue"
                  className="p-12 text-center border-4 border-dashed border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue/20 transition-all duration-300 group"
                >
                  <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-12 h-12 text-slate-300 group-hover:text-blue transition-colors" />
                  </div>
                  <h3 className="text-2xl font-black text-navy mb-3">
                    Aucun cours programmé
                  </h3>
                  <p className="text-navy/50 font-medium mb-8 max-w-md mx-auto text-lg">
                    Réservez votre prochain cours pour continuer l'aventure et
                    débloquer de nouveaux badges !
                  </p>
                  <Button
                    onClick={() =>
                      navigate(`/free-trial-booking?userId=${user?.id}`)
                    }
                    size="lg"
                    className="shadow-xl shadow-blue/20 hover:-translate-y-1 transition-transform"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Réserver un cours
                  </Button>
                </Card>
              )}
            </section>

            {/* Recent Activity */}
            <section>
              <h2 className="text-2xl font-black text-navy mb-6 tracking-tight">
                {selectedKid
                  ? `Activité Récente de ${selectedKid.name}`
                  : "Activité Récente"}
              </h2>
              <div className="space-y-4">
                {MOCK_ACTIVITIES.map((activity) => (
                  <Card
                    key={activity.id}
                    className="p-5 flex items-center gap-6 hover:bg-slate-50 transition-all duration-200 border-none shadow-sm hover:shadow-md group cursor-pointer"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 ${
                        activity.type === "quiz"
                          ? "bg-purple-100 text-purple-600"
                          : activity.type === "video"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow/10 text-orange"
                      }`}
                    >
                      {activity.type === "quiz" && (
                        <BookOpen className="w-7 h-7" />
                      )}
                      {activity.type === "video" && (
                        <PlayCircle className="w-7 h-7" />
                      )}
                      {activity.type === "achievement" && (
                        <Trophy className="w-7 h-7" />
                      )}
                    </div>
                    <div className="grow">
                      <h4 className="font-bold text-lg text-navy mb-1 group-hover:text-blue transition-colors">
                        {activity.title}
                      </h4>
                      <p className="text-sm font-medium text-navy/40">
                        {activity.date}
                      </p>
                    </div>
                    {activity.score && (
                      <div className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-black text-sm border border-green-100">
                        {activity.score}
                      </div>
                    )}
                    <div className="p-2 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Gamification Card */}
            <Card className="p-8 bg-linear-to-br from-yellow via-orange to-red-500 text-white border-none shadow-2xl shadow-orange/30 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <Trophy className="w-40 h-40 -rotate-12" />
              </div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-10 h-10 fill-white text-white" />
                </div>
                <h3 className="text-3xl font-black mb-2 tracking-tight">
                  Niveau 3
                </h3>
                <p className="text-white/90 font-bold mb-8 text-lg">
                  Explorateur Junior
                </p>

                <div className="bg-black/20 rounded-full h-4 w-full mb-3 overflow-hidden backdrop-blur-sm">
                  <div className="bg-white h-full w-[70%] rounded-full shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 w-full h-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs font-black text-white/80 uppercase tracking-widest">
                  350 / 500 XP pour le prochain niveau
                </p>
              </div>
            </Card>

            {/* Quick Help */}
            <Card className="p-8 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="font-black text-navy mb-4 flex items-center gap-3 text-lg">
                <div className="p-2 bg-blue/10 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-blue" />
                </div>
                Besoin d'aide technique ?
              </h3>
              <p className="text-navy/60 mb-6 leading-relaxed font-medium">
                Problème avec la caméra ou le micro avant le cours ? Testez
                votre équipement en 2 minutes.
              </p>
              <Button
                variant="outline"
                className="w-full text-blue border-blue/20 hover:bg-blue/5 hover:border-blue/40 py-6 text-base shadow-sm"
              >
                Tester mon équipement
              </Button>
            </Card>
          </div>
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-8 relative">
            <h3 className="text-2xl font-black text-navy mb-4">
              Annuler le cours ?
            </h3>
            <p className="text-navy/60 font-medium mb-6">
              Êtes-vous sûr de vouloir annuler votre cours d'essai ? Vous
              pourrez toujours en réserver un autre plus tard.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                disabled={canceling}
                className="flex-1"
              >
                Non, garder
              </Button>
              <Button
                onClick={handleCancelBooking}
                loading={canceling}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Oui, annuler
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
