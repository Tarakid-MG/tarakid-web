import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContextDefinition";
import { freeTrialService } from "../services/free-trial.service";
import { bookingService } from "../services/booking.service";
import { subscriptionService } from "../services/subscription.service";
import { Navbar } from "../components/layout/Navbar";
import {
  Calendar,
  Clock,
  Zap,
  ArrowRight,
  Star,
  MoreVertical,
  CheckCircle,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import ReportBookingModal from "../components/ui/ReportBookingModal";
import type {
  Booking,
  Subscription,
  FreeTrialBooking,
  Kid,
} from "../types/auth";
import { useKidMode } from "../hooks/useKidMode";

type ScheduleItem = {
  id: string | number;
  type: "FREE_TRIAL" | "REGULAR";
  date: string; // YYYY-MM-DD
  start: string; // HH:mm:ss or HH:mm
  end: string;
  kidId?: string;
};

function formatDateFR(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function toHHMM(time: string) {
  return (time || "").substring(0, 5);
}

function toDateTime(date: string, time: string) {
  // safe parsing for "YYYY-MM-DD" + "HH:mm"
  return new Date(`${date}T${toHHMM(time)}:00`);
}

const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedKid, enterKidMode } = useKidMode();

  const [allBookings, setAllBookings] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubscription, setActiveSubscription] =
    useState<Subscription | null>(null);

  const selectedKidId =
    selectedKid?.id ||
    (user?.kids && user.kids.length > 0 ? user.kids[0].id : null);

  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<ScheduleItem | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [reportPending, setReportPending] = useState<ScheduleItem | null>(null);

  const selectedKidObj: Kid | undefined = useMemo(() => {
    if (!user?.kids || !selectedKidId) return undefined;
    return user.kids.find((k) => k.id === selectedKidId);
  }, [user, selectedKidId]);

  const fetchData = useCallback(async () => {
    if (!user?.id || !selectedKidId) return;

    try {
      const [freeTrialData, regularData, subscriptions] = await Promise.all([
        freeTrialService.getBookings(user.id),
        bookingService.getKidBookings(String(selectedKidId)),
        subscriptionService.getKidSubscriptions(String(selectedKidId)),
      ]);

      const freeTrialFiltered = (freeTrialData as FreeTrialBooking[]).filter(
        (b) =>
          b.kidId === selectedKidId &&
          b.status === "CONFIRMED" &&
          b.session?.date &&
          b.session?.startTime &&
          b.session?.endTime,
      );

      const activeSub = (subscriptions as Subscription[]).find(
        (s) => s.status === "ACTIVE",
      );
      setActiveSubscription(activeSub || null);

      const combined: ScheduleItem[] = [
        ...freeTrialFiltered.map(
          (b): ScheduleItem => ({
            id: b.id,
            type: "FREE_TRIAL",
            date: b.session!.date,
            start: b.session!.startTime,
            end: b.session!.endTime,
            kidId: b.kidId,
          }),
        ),
        ...(regularData as Booking[])
          .filter(
            (b) =>
              b.sessionDate &&
              b.startTime &&
              b.endTime &&
              !["CANCELLED", "REPORTED"].includes(b.status),
          )
          .map(
            (b): ScheduleItem => ({
              id: b.id,
              type: "REGULAR",
              date: b.sessionDate,
              start: b.startTime,
              end: b.endTime,
              kidId: selectedKidId || undefined,
            }),
          ),
      ];

      combined.sort((a, b) => {
        const A = toDateTime(a.date, a.start).getTime();
        const B = toDateTime(b.date, b.start).getTime();
        return A - B;
      });

      setAllBookings(combined);
    } catch (error) {
      console.error("Failed to fetch schedule data", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedKidId]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleGlobalClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const handleAction = (booking: ScheduleItem) => {
    setActiveMenuId(null);
    setPendingAction(booking);
  };

  const handleConfirm = async () => {
    if (!pendingAction || !user?.id) return;
    setConfirmLoading(true);
    try {
      if (pendingAction.type === "FREE_TRIAL") {
        await freeTrialService.cancelBooking(Number(pendingAction.id), user.id);
      } else {
        await bookingService.cancelBooking(String(pendingAction.id));
      }

      setSuccessMessage("Votre cours a été annulé avec succès.");
      await fetchData();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Une erreur est survenue lors de l'action.";
      alert(errorMessage);
    } finally {
      setConfirmLoading(false);
      setPendingAction(null);
    }
  };

  const upcoming = useMemo(() => {
    const now = new Date();
    return allBookings.filter((b) => toDateTime(b.date, b.start) > now);
  }, [allBookings]);

  // Loading full page (first load)
  if (loading && allBookings.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-blue" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!pendingAction}
        title="Annuler ce cours ?"
        message="Cette action est irréversible. Si le cours commence dans plus de 5 heures, votre crédit sera remboursé automatiquement."
        confirmLabel="Oui, annuler"
        cancelLabel="Retour"
        variant="danger"
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />

      <main className="grow max-w-7xl mx-auto w-full px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
        {/* Success Alert */}
        {successMessage && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-6 flex items-start gap-4 relative overflow-hidden group shadow-sm shadow-emerald-100/50">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CheckCircle className="w-24 h-24 text-emerald-600" />
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm border border-emerald-200">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="grow">
                <h4 className="text-emerald-900 font-bold mb-1">
                  C'est fait !
                </h4>
                <p className="text-emerald-700/80 font-medium text-sm leading-relaxed">
                  {successMessage}
                </p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="w-10 h-10 rounded-xl hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors"
                title="Fermer"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-navy">
              Emploi du temps{" "}
              <span className="text-navy/60 font-medium">
                {selectedKidObj?.name ? `de ${selectedKidObj.name}` : ""}
              </span>
            </h1>
            <p className="text-navy/60 mt-1">
              Gérez les cours et rejoignez la classe en un clic.
            </p>
          </div>

          {/* Credits / Subscription box (no gradient, high contrast) */}
          <div className="lg:col-span-5">
            <Card variant="default" className="p-0">
              <div className="relative">
                {/* Accent bar */}
                <div className="absolute left-0 top-0 h-full w-1.5 bg-gold rounded-l-2xl" />
                <div className="pl-4 pr-5 py-5 md:pl-5 md:pr-6 md:py-6">
                  {activeSubscription ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-gold/15 border border-gold/25 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-navy/60 uppercase tracking-wide">
                            Crédits restants
                          </div>
                          <div className="text-2xl font-semibold text-navy">
                            {activeSubscription.remainingCredits}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() =>
                          navigate(
                            activeSubscription.remainingCredits > 0
                              ? `/book-classes?subscriptionId=${activeSubscription.id}`
                              : `/subscription`,
                          )
                        }
                        size="sm"
                      >
                        Réserver
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-blue/10 border border-blue/20 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-blue" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-navy">
                            Aucun abonnement actif
                          </div>
                          <div className="text-sm text-navy/60">
                            Abonnez-vous pour réserver des cours.
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => navigate("/subscription")}
                        className="bg-blue text-white hover:bg-deepBlue rounded-xl"
                      >
                        S’abonner
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Upcoming section */}
        <section className="space-y-4 md:space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-navy flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue" />
              </span>
              Prochains cours
            </h2>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-sm font-semibold text-blue hover:text-deepBlue inline-flex items-center gap-2"
            >
              Retour dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {upcoming.map((booking) => {
                const kidName = selectedKidObj?.name || "Votre enfant";
                const isTrial = booking.type === "FREE_TRIAL";

                return (
                  <Card key={booking.id} variant="default" className="p-0">
                    <div className="relative">
                      {/* Accent bar */}
                      <div
                        className={`absolute left-0 top-0 h-full w-1.5 rounded-l-2xl ${
                          isTrial ? "bg-orange" : "bg-blue"
                        }`}
                      />
                      <div className="pl-4 pr-5 py-5 md:pl-5 md:pr-6 md:py-6">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-navy truncate">
                              {formatDateFR(booking.date)}
                            </div>
                            <div className="text-sm text-navy/60 mt-1 flex items-center gap-2">
                              <span className="inline-flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue" />
                                {toHHMM(booking.start)} – {toHHMM(booking.end)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${
                                isTrial
                                  ? "bg-orange/10 text-orange border-orange/20"
                                  : "bg-blue/10 text-blue border-blue/20"
                              }`}
                            >
                              {isTrial ? "ESSAI" : "STANDARD"}
                            </span>

                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(
                                    activeMenuId === booking.id
                                      ? null
                                      : booking.id,
                                  );
                                }}
                                className="p-1 rounded-lg hover:bg-slate-100 text-navy/40 hover:text-navy transition-colors"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>

                              {activeMenuId === booking.id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      setReportPending(booking);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-orange hover:bg-orange/5 font-medium transition-colors"
                                  >
                                    Reporter le cours
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAction(booking);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                                  >
                                    Annuler le cours
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <div className="mt-4">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center">
                              <Star className="w-5 h-5 text-gold fill-gold" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-navy">
                                Anglais {isTrial ? "Découverte" : "Standard"}
                              </div>
                              <div className="text-sm text-navy/60">
                                Pour :{" "}
                                <span className="text-blue font-semibold">
                                  {kidName}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-5">
                          <Button
                            fullWidth
                            variant="outline"
                            className="group-hover:bg-blue group-hover:text-white group-hover:border-blue hover:bg-blue hover:text-white hover:border-blue transition-colors"
                            onClick={() => {
                              const kid = user?.kids?.find(
                                (k) => k.id === selectedKidId,
                              );
                              if (kid) {
                                enterKidMode(kid);
                                navigate("/kid-dashboard");
                              }
                            }}
                          >
                            Rejoindre la classe
                          </Button>

                          <button
                            type="button"
                            onClick={() => navigate("/schedule")}
                            className="mt-2 w-full text-sm font-semibold text-blue hover:text-deepBlue inline-flex items-center justify-center gap-2"
                          >
                            Voir tous les cours{" "}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card variant="default" className="p-0">
              <div className="relative">
                <div className="absolute left-0 top-0 h-full w-1.5 bg-slate-200 rounded-l-2xl" />
                <div className="pl-4 pr-5 py-10 md:pl-5 md:pr-6 md:py-12 text-center">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-beige/60 border border-slate-200 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-navy/40" />
                  </div>

                  <div className="mt-4 text-lg font-semibold text-navy">
                    Aucun cours prévu
                  </div>
                  <div className="mt-1 text-sm text-navy/60 max-w-md mx-auto">
                    Réservez un créneau pour continuer l’apprentissage.
                  </div>

                  <div className="mt-5 flex justify-center">
                    {activeSubscription ? (
                      <Button
                        onClick={() =>
                          navigate(
                            `/book-classes?subscriptionId=${activeSubscription.id}`,
                          )
                        }
                        className="bg-blue text-white hover:bg-deepBlue rounded-xl px-6"
                      >
                        Réserver un cours
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigate("/subscription")}
                        className="bg-blue text-white hover:bg-deepBlue rounded-xl px-6"
                      >
                        Découvrir nos offres
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </section>
      </main>

      {/* Report Booking Modal */}
      {reportPending && (
        <ReportBookingModal
          isOpen={!!reportPending}
          onClose={() => {
            setReportPending(null);
            fetchData();
          }}
          bookingId={reportPending.id}
          bookingType={reportPending.type}
          userId={user?.id || 0}
          kidId={selectedKidId?.toString()}
        />
      )}
    </div>
  );
};

export default SchedulePage;
