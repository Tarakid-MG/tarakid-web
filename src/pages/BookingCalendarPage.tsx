import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContextDefinition";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Info,
} from "lucide-react";
import { subscriptionService } from "../services/subscription.service";
import { bookingService } from "../services/booking.service";
import { freeTrialService } from "../services/free-trial.service";
import { type Subscription, type FreeTrialSession } from "../types/auth";
import BookingCalendar from "../components/quiz/BookingCalendar";
import type { AxiosError } from "axios";

const BookingCalendarPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const subscriptionId = searchParams.get("subscriptionId");

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [sessions, setSessions] = useState<FreeTrialSession[]>([]);
  const [customType, setCustomType] = useState<"individual" | "weekly">(
    "weekly",
  );

  // Custom Individual state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customBookings, setCustomBookings] = useState<
    Array<{ sessionDate: string; startTime: string; endTime: string }>
  >([]);

  // Custom Weekly state
  const [weeklySlots, setWeeklySlots] = useState<
    Array<{ dayOfWeek: number; time: string }>
  >([]);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  const staticTimes = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
  ];

  // Derived state for availability
  const availableDates = useMemo(() => {
    const dates = new Set(
      sessions
        .filter((s) => s.bookedSlots < s.capacity)
        .map((s) => s.date.split("T")[0]),
    );
    return Array.from(dates);
  }, [sessions]);

  const availableTimesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return sessions
      .filter(
        (s) =>
          s.date.split("T")[0] === selectedDate && s.bookedSlots < s.capacity,
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((s) => s.startTime);
  }, [selectedDate, sessions]);

  useEffect(() => {
    const fetchData = async () => {
      if (!subscriptionId) {
        navigate("/subscription");
        return;
      }

      try {
        const [sub, availableSessions] = await Promise.all([
          subscriptionService.getSubscription(subscriptionId),
          freeTrialService.getAvailableSessions(),
        ]);

        setSubscription(sub);
        setSessions(availableSessions);

        // Initialize weekly slots based on frequency
        setWeeklySlots(
          Array(sub.frequency)
            .fill(0)
            .map(() => ({ dayOfWeek: 1, time: "09:00" })),
        );
      } catch (error) {
        console.error("Failed to load data", error);
        alert("Impossible de charger les données");
        navigate("/subscription");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subscriptionId, navigate]);

  const addMinutes = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(":").map(Number);
    const totalMins = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMins / 60) % 24;
    const newMins = totalMins % 60;
    return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
  };

  const handleAddIndividualSlot = () => {
    if (!selectedDate || !selectedTime || !subscription) return;

    if (customBookings.length >= subscription.remainingCredits) {
      alert(
        `Vous ne pouvez pas réserver plus de ${subscription.remainingCredits} cours.`,
      );
      return;
    }

    const newSlot = {
      sessionDate: selectedDate,
      startTime: selectedTime,
      endTime: addMinutes(selectedTime, 25),
    };

    if (
      customBookings.some(
        (b) =>
          b.sessionDate === newSlot.sessionDate &&
          b.startTime === newSlot.startTime,
      )
    ) {
      alert("Ce créneau est déjà dans votre sélection.");
      return;
    }

    setCustomBookings([...customBookings, newSlot]);
    setSelectedTime(null);
  };

  const handleRemoveIndividualSlot = (index: number) => {
    setCustomBookings(customBookings.filter((_, i) => i !== index));
  };

  // Calculate preview dates for weekly schedule
  const weeklyPreview = useMemo(() => {
    const today = new Date();
    const preview: Array<{ date: Date; time: string }> = [];

    // Generate for next 4 weeks
    for (let week = 0; week < 4; week++) {
      weeklySlots.forEach((slot) => {
        const date = new Date(today);
        const daysToWait = (slot.dayOfWeek - date.getDay() + 7) % 7;
        // If today is the day but time passed, move to next week?
        // For simplicity, let's just schedule forward.
        if (daysToWait === 0 && week === 0) {
          // logic to check time could go here, for now we assume next instance
        }

        date.setDate(date.getDate() + daysToWait + 7 * week);
        preview.push({ date, time: slot.time });
      });
    }
    return preview.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [weeklySlots]);

  const handleCustomSubmit = async () => {
    if (!subscription) return;

    setBooking(true);
    try {
      let bookingsToCreate = [];

      if (customType === "individual") {
        if (customBookings.length === 0) {
          alert("Veuillez sélectionner au moins un cours.");
          setBooking(false);
          return;
        }
        bookingsToCreate = customBookings.map((b) => ({
          ...b,
          isRecurring: false,
        }));
      } else {
        const today = new Date();
        const numWeeks = 4;

        for (let week = 0; week < numWeeks; week++) {
          for (const slot of weeklySlots) {
            const date = new Date(today);
            const daysToWait = (slot.dayOfWeek - date.getDay() + 7) % 7;
            date.setDate(date.getDate() + daysToWait + 7 * week);

            bookingsToCreate.push({
              sessionDate: date.toISOString().split("T")[0],
              startTime: slot.time,
              endTime: addMinutes(slot.time, 25),
              isRecurring: true,
              recurrencePattern: {
                type: "weekly",
                daysOfWeek: [slot.dayOfWeek],
              },
            });
          }
        }
      }

      await bookingService.create({
        subscriptionId: subscription.id,
        kidId: subscription.kidId || user!.kids![0].id.toString(),
        bookings: bookingsToCreate,
      });

      await refreshProfile();
      setSuccess(true);
    } catch (error: unknown) {
      console.error("Booking failed", error);
      const err = error as unknown;
      alert(
        (err as AxiosError).response?.data ||
          "Une erreur est survenue lors de la réservation.",
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (!subscription) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <Card className="text-center py-12 px-8 overflow-hidden relative border-none shadow-2xl shadow-green-500/10">
            <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-green-400 to-emerald-500"></div>
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-navy mb-4">
              Parfait ! Vos cours sont réservés 🎉
            </h2>
            <p className="text-navy/60 font-bold mb-8 leading-relaxed text-lg">
              Votre emploi du temps a été créé avec succès. Vous pouvez
              maintenant voir vos prochains cours sur le tableau de bord.
            </p>
            <Button
              onClick={() => navigate("/schedule")}
              fullWidth
              size="lg"
              className="shadow-xl shadow-blue/20"
            >
              Voir mon emploi du temps
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <button
                onClick={() => navigate("/subscription")}
                className="mb-4 flex items-center text-navy/60 font-bold hover:text-blue transition-colors group"
              >
                <div className="p-1 bg-white rounded-lg shadow-sm mr-2 group-hover:scale-110 transition-transform">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                Retour aux abonnements
              </button>
              <h1 className="text-4xl font-black text-navy tracking-tight mb-2">
                Planifiez les cours de{" "}
                {subscription?.kid?.name ||
                  user?.kids?.find(
                    (k) => k.id.toString() === subscription?.kidId,
                  )?.name ||
                  user?.kids?.[0]?.name ||
                  "votre enfant"}{" "}
                📅
              </h1>
              <p className="text-lg text-navy/60 font-medium">
                Configurez les horaires préférés pour les prochaines semaines.
              </p>
            </div>

            <Card className="p-4 bg-white border-none shadow-lg shadow-blue/5 flex items-center gap-6">
              <div className="text-center px-2">
                <p className="text-xs font-black text-navy/40 uppercase tracking-widest mb-1">
                  Fréquence
                </p>
                <p className="text-2xl font-black text-blue">
                  {subscription.frequency}x{" "}
                  <span className="text-sm text-navy/40 font-bold">/ sem</span>
                </p>
              </div>
              <div className="w-px h-10 bg-slate-100"></div>
              <div className="text-center px-2">
                <p className="text-xs font-black text-navy/40 uppercase tracking-widest mb-1">
                  Crédits
                </p>
                <p className="text-2xl font-black text-orange">
                  {subscription.remainingCredits}
                </p>
              </div>
            </Card>
          </div>

          {/* Mode Selector */}
          <div className="flex justify-center">
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 inline-flex relative">
              <button
                onClick={() => setCustomType("weekly")}
                className={`px-6 py-3 rounded-xl font-black text-sm transition-all duration-300 relative z-10 ${customType === "weekly" ? "text-white shadow-lg shadow-blue/20" : "text-navy/60 hover:text-navy hover:bg-slate-50"}`}
              >
                {customType === "weekly" && (
                  <div className="absolute inset-0 bg-blue rounded-xl -z-10 animate-in zoom-in-95 duration-200"></div>
                )}
                Planning Hebdomadaire
              </button>
              <button
                onClick={() => setCustomType("individual")}
                className={`px-6 py-3 rounded-xl font-black text-sm transition-all duration-300 relative z-10 ${customType === "individual" ? "text-white shadow-lg shadow-blue/20" : "text-navy/60 hover:text-navy hover:bg-slate-50"}`}
              >
                {customType === "individual" && (
                  <div className="absolute inset-0 bg-navy rounded-xl -z-10 animate-in zoom-in-95 duration-200"></div>
                )}
                Sélection Manuelle
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {customType === "weekly" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Configuration */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-4">
                    {weeklySlots.map((slot, idx) => (
                      <Card
                        key={idx}
                        className="p-6 border-none shadow-lg shadow-blue/5 hover:shadow-xl hover:shadow-blue/10 transition-all duration-300 group overflow-hidden relative"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-blue to-cyan-400"></div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center text-blue font-black text-sm">
                            #{idx + 1}
                          </div>
                          <h4 className="text-lg font-black text-navy">
                            Créneau de cours
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-navy/40 uppercase tracking-wide ml-1">
                              Jour de la semaine
                            </label>
                            <div className="relative">
                              <select
                                className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-navy focus:border-blue outline-none transition-colors cursor-pointer hover:bg-white"
                                value={slot.dayOfWeek}
                                onChange={(e) => {
                                  const newSlots = [...weeklySlots];
                                  newSlots[idx] = {
                                    ...slot,
                                    dayOfWeek: parseInt(e.target.value),
                                  };
                                  setWeeklySlots(newSlots);
                                }}
                              >
                                <option value={1}>Lundi</option>
                                <option value={2}>Mardi</option>
                                <option value={3}>Mercredi</option>
                                <option value={4}>Jeudi</option>
                                <option value={5}>Vendredi</option>
                                <option value={6}>Samedi</option>
                                <option value={0}>Dimanche</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-navy/40">
                                <Calendar className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-navy/40 uppercase tracking-wide ml-1">
                              Heure de début
                            </label>
                            <div className="relative">
                              <select
                                className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-navy focus:border-blue outline-none transition-colors cursor-pointer hover:bg-white"
                                value={slot.time}
                                onChange={(e) => {
                                  const newSlots = [...weeklySlots];
                                  newSlots[idx] = {
                                    ...slot,
                                    time: e.target.value,
                                  };
                                  setWeeklySlots(newSlots);
                                }}
                              >
                                {staticTimes.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-navy/40">
                                <Clock className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Card className="bg-yellow/10 border-none p-6 text-navy/80 flex items-start gap-4">
                    <div className="p-2 bg-yellow rounded-xl shadow-sm text-white shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black mb-1">Le saviez-vous ?</h4>
                      <p className="text-sm font-bold opacity-80 leading-relaxed">
                        Créer une routine régulière aide votre enfant à mieux
                        assimiler les connaissances. Ces créneaux seront
                        réservés pour les 4 prochaines semaines.
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Right: Preview & Submit */}
                <div className="lg:col-span-5 relative lg:sticky lg:top-8">
                  <Card className="p-0 border-none shadow-2xl shadow-blue/15 overflow-hidden flex flex-col h-full bg-white">
                    <div className="bg-linear-to-br from-blue to-deepBlue p-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Calendar className="w-32 h-32 -rotate-12" />
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-2">
                          Aperçu du Planning
                        </h3>
                        <p className="text-blue-100 font-medium">
                          Vos prochaines sessions
                        </p>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 grow max-h-[400px] overflow-y-auto custom-scrollbar">
                      <div className="space-y-3">
                        {weeklyPreview.map((slot, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-slate-100"
                          >
                            <div className="w-12 h-12 rounded-xl bg-blue/5 flex flex-col items-center justify-center text-blue shrink-0">
                              <span className="text-[10px] font-black uppercase">
                                {slot.date.toLocaleDateString("fr-FR", {
                                  month: "short",
                                })}
                              </span>
                              <span className="text-lg font-black leading-none">
                                {slot.date.getDate()}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-navy text-sm">
                                {slot.date.toLocaleDateString("fr-FR", {
                                  weekday: "long",
                                })}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-navy/40 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {slot.time} - {addMinutes(slot.time, 25)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-white border-t border-slate-100">
                      <Button
                        onClick={handleCustomSubmit}
                        loading={booking}
                        variant="primary"
                        fullWidth
                        size="lg"
                        className="shadow-xl shadow-blue/20"
                      >
                        Confirmer ce planning
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Selection */}
                  <div className="lg:col-span-5 space-y-6">
                    <Card className="p-6 border-none shadow-lg shadow-blue/5">
                      <h3 className="text-xl font-black text-navy mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center text-blue">
                          <Calendar className="w-5 h-5" />
                        </div>
                        1. Choisir une date
                      </h3>
                      <BookingCalendar
                        availableDates={availableDates}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        isAdmin={true}
                      />
                      {availableDates.length === 0 && !loading && (
                        <div className="mt-4 p-4 bg-orange/5 border border-orange/10 rounded-xl flex items-start gap-3">
                          <Info className="w-5 h-5 text-orange shrink-0 mt-0.5" />
                          <p className="text-xs font-bold text-orange/80">
                            Aucune date disponible pour le moment. Veuillez
                            vérifier plus tard ou contacter le support.
                          </p>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Right Column: Times & Summary */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Time Selection */}
                    <Card className="p-8 border-none shadow-lg shadow-blue/5">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-navy flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center text-blue">
                            <Clock className="w-5 h-5" />
                          </div>
                          2. Choisir l'heure
                        </h3>
                        {selectedDate && (
                          <span className="text-xs font-black text-blue bg-blue/10 px-3 py-1 rounded-full uppercase tracking-wide">
                            {new Date(selectedDate).toLocaleDateString(
                              "fr-FR",
                              {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              },
                            )}
                          </span>
                        )}
                      </div>

                      {!selectedDate ? (
                        <div className="py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                          <p className="text-navy/40 font-black text-lg">
                            Veuillez d'abord sélectionner une date ✨
                          </p>
                        </div>
                      ) : availableTimesForSelectedDate.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                          <p className="text-navy/40 font-black text-lg">
                            Aucun créneau disponible pour cette date 😔
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-8 animate-in fade-in duration-300">
                          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                            {availableTimesForSelectedDate.map((t) => (
                              <button
                                key={t}
                                onClick={() => setSelectedTime(t)}
                                className={`py-3 rounded-xl border-2 font-black transition-all duration-200 ${
                                  selectedTime === t
                                    ? "border-blue bg-blue text-white shadow-lg shadow-blue/20 scale-105"
                                    : "border-slate-100 hover:border-blue/20 hover:bg-blue/5 text-navy/60 bg-white"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                          <Button
                            onClick={handleAddIndividualSlot}
                            disabled={!selectedTime}
                            fullWidth
                            size="lg"
                            className="shadow-xl shadow-blue/20"
                          >
                            Ajouter ce créneau
                          </Button>
                        </div>
                      )}
                    </Card>

                    {/* Summary Card */}
                    <Card className="p-0 border-none shadow-lg shadow-blue/5 overflow-hidden">
                      <div className="bg-linear-to-r from-blue/5 via-indigo-50/20 to-blue/5 p-6 border-b border-slate-100 items-center justify-between flex">
                        <div>
                          <h3 className="text-lg font-black text-navy">
                            Votre sélection
                          </h3>
                          <p className="text-xs font-bold text-navy/40">
                            Vos créneaux choisis
                          </p>
                        </div>
                        <span
                          className={`text-sm font-black px-4 py-2 rounded-xl transition-colors ${
                            customBookings.length ===
                            subscription.remainingCredits
                              ? "bg-green-100 text-green-600 shadow-sm"
                              : "bg-white text-navy/60 shadow-sm border border-slate-100"
                          }`}
                        >
                          {customBookings.length} /{" "}
                          {subscription.remainingCredits} crédits
                        </span>
                      </div>

                      <div className="p-6 bg-white min-h-[120px]">
                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                          {customBookings.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                <Clock className="w-6 h-6" />
                              </div>
                              <p className="text-navy/30 font-black italic">
                                Aucun créneau sélectionné
                              </p>
                            </div>
                          ) : (
                            customBookings.map((b, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm group hover:scale-[1.01] transition-transform"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-blue/5 rounded-xl flex items-center justify-center text-blue font-black text-xs">
                                    {i + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-navy first-letter:uppercase">
                                      {new Date(
                                        b.sessionDate,
                                      ).toLocaleDateString("fr-FR", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "short",
                                      })}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-navy/40 mt-0.5">
                                      <Clock className="w-3 h-3" />
                                      {b.startTime} - {b.endTime}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveIndividualSlot(i)}
                                  className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-lg hover:bg-red-50"
                                >
                                  <div className="sr-only">Supprimer</div>
                                  <span className="text-lg leading-none">
                                    &times;
                                  </span>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <Button
                          onClick={handleCustomSubmit}
                          disabled={customBookings.length === 0}
                          loading={booking}
                          fullWidth
                          size="lg"
                          className="shadow-xl shadow-blue/20"
                        >
                          Confirmer ma sélection
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookingCalendarPage;
