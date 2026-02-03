import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContextDefinition";
import { freeTrialService } from "../services/free-trial.service";
import { bookingService } from "../services/booking.service";
import { subscriptionService } from "../services/subscription.service";
import { Navbar } from "../components/layout/Navbar";
import { Calendar, Clock, Zap } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ChildSelector } from "../components/ui/ChildSelector";
import {
  type Booking,
  type Subscription,
  type FreeTrialBooking,
} from "../types/auth";

const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [selectedKidId, setSelectedKidId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubscription, setActiveSubscription] =
    useState<Subscription | null>(null);

  // Initial kid selection
  useEffect(() => {
    if (user?.kids && user.kids.length > 0) {
      setSelectedKidId(user.kids[0].id);
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedKidId) return;

      setLoading(true);
      try {
        // Fetch both free trial and regular bookings
        const [freeTrialData, regularData, subscriptions] = await Promise.all([
          freeTrialService.getBookings(user!.id),
          bookingService.getKidBookings(selectedKidId.toString()),
          subscriptionService.getKidSubscriptions(selectedKidId.toString()),
        ]);

        // Filter free trial bookings for this kid (if kidId matches)
        const freeTrialFiltered = freeTrialData.filter(
          (b: FreeTrialBooking) => b.kidId === selectedKidId,
        );

        // Active subscription for this kid
        const activeSub = subscriptions.find((s) => s.status === "ACTIVE");
        setActiveSubscription(activeSub || null);

        // Combine and sort
        const combined = [
          ...freeTrialFiltered.map((b) => ({
            ...b,
            type: "FREE_TRIAL",
            date: b.session?.date,
            start: b.session?.startTime,
            end: b.session?.endTime,
          })),
          ...regularData.map((b: Booking) => ({
            ...b,
            type: "REGULAR",
            date: b.sessionDate,
            start: b.startTime,
            end: b.endTime,
          })),
        ].sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateA - dateB;
        });

        setAllBookings(combined);
      } catch (error) {
        console.error("Failed to fetch schedule data", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedKidId) {
      fetchData();
    }
  }, [selectedKidId, user]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const getUpcomingBookings = () => {
    const now = new Date();
    return allBookings.filter((b) => new Date(b.date + "T" + b.start) > now);
  };

  const upcoming = getUpcomingBookings();

  if (loading && !allBookings.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Navbar />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="grow p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-navy mb-2">
              Emploi du temps de{" "}
              {user?.kids?.find((k) => k.id === selectedKidId)?.name ||
                "votre enfant"}
            </h1>
            <p className="text-navy/60 font-medium">
              Gérez les cours et la progression 📅
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {user?.kids && user.kids.length > 1 && (
              <ChildSelector
                kids={user.kids}
                selectedKidId={selectedKidId}
                onSelectKid={setSelectedKidId}
              />
            )}

            {activeSubscription ? (
              <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                <div className="bg-yellow/10 p-3 rounded-xl text-yellow-600">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy/40 uppercase tracking-wide">
                    Crédits restants
                  </p>
                  <p className="text-2xl font-black text-navy">
                    {activeSubscription.remainingCredits}
                  </p>
                </div>
                <Button
                  onClick={() =>
                    navigate(
                        activeSubscription.remainingCredits > 0 ?
                      `/book-classes?subscriptionId=${activeSubscription.id}` :
                      `/subscription`,
                    )
                  }
                  size="sm"
                  className="ml-4"
                >
                  Réserver
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate("/subscription")}
                variant="primary"
                className="shadow-xl shadow-blue/20"
              >
                <Zap className="w-5 h-5 mr-2" />
                S'abonner maintenant
              </Button>
            )}
          </div>
        </header>

        {upcoming.length > 0 ? (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center">
              <Clock className="w-5 h-5 mr-3 text-blue" />
              Prochains cours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((booking) => (
                <Card
                  key={booking.id}
                  className="p-6 border-l-4 border-l-blue relative overflow-hidden group hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue/5 text-blue font-bold px-3 py-1 rounded-lg text-sm">
                      {formatDate(booking.date)}
                    </div>
                    <div className="bg-slate-100 text-navy/40 font-bold px-2 py-1 rounded-md text-xs">
                      {booking.start.substring(0, 5)}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-black text-navy">
                        Anglais{" "}
                        {booking.type === "REGULAR" ? "Standard" : "Découverte"}
                      </h3>
                      {booking.type === "FREE_TRIAL" && (
                        <span className="bg-orange/10 text-orange text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          Essai
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-navy/60 flex items-center">
                      Pour:{" "}
                      <span className="ml-1 text-blue">
                        {user?.kids?.find((k) => k.id === selectedKidId)?.name}
                      </span>
                    </p>
                  </div>

                  <Button
                    fullWidth
                    variant="outline"
                    className="group-hover:bg-blue group-hover:text-white group-hover:border-blue transition-colors"
                  >
                    Rejoindre la classe
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        ) : (
          <Card className="p-12 text-center border-2 border-dashed border-slate-200 bg-slate-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-300">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-navy mb-2">
              Aucun cours prévu
            </h3>
            <p className="text-navy/40 font-bold mb-8 max-w-md mx-auto">
              Transformez le temps d'écran en temps d'apprentissage ! Réservez
              votre prochain cours dès maintenant.
            </p>
            {activeSubscription ? (
              <Button
                onClick={() =>
                  navigate(
                    `/book-classes?subscriptionId=${activeSubscription.id}`,
                  )
                }
              >
                Réserver un cours
              </Button>
            ) : (
              <Button onClick={() => navigate("/subscription")}>
                Découvrir nos offres
              </Button>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

export default SchedulePage;
