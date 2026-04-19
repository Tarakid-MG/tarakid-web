import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContextDefinition";
import { bookingService } from "../services/booking.service";
import { freeTrialService } from "../services/free-trial.service";
import { Navbar } from "../components/layout/Navbar";
import {
  Clock,
  Calendar,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock3,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import type { Booking, Kid, FreeTrialBooking } from "../types/auth";
import { useKidMode } from "../hooks/useKidMode";

type UnifiedBooking = {
  id: string | number;
  type: "FREE_TRIAL" | "REGULAR";
  date: string;
  start: string;
  end: string;
  status: Booking["status"] | FreeTrialBooking["status"];
  title: string;
};

function formatDateFR(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toHHMM(time: string) {
  return (time || "").substring(0, 5);
}

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedKid } = useKidMode();

  const [bookings, setBookings] = useState<UnifiedBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedKidId =
    selectedKid?.id ||
    (user?.kids && user.kids.length > 0 ? user.kids[0].id : null);

  const selectedKidObj: Kid | undefined = useMemo(() => {
    if (!user?.kids || !selectedKidId) return undefined;
    return user.kids.find((k) => k.id === selectedKidId);
  }, [user, selectedKidId]);

  const fetchData = useCallback(async () => {
    if (!user?.id || !selectedKidId) return;

    try {
      const [freeTrialData, regularData] = await Promise.all([
        freeTrialService.getBookings(user.id),
        bookingService.getKidBookings(String(selectedKidId)),
      ]);

      const unified: UnifiedBooking[] = [
        ...(freeTrialData as FreeTrialBooking[])
          .filter((b) => b.kidId === selectedKidId)
          .map(
            (b): UnifiedBooking => ({
              id: b.id,
              type: "FREE_TRIAL",
              date: b.session?.date || "",
              start: b.session?.startTime || "",
              end: b.session?.endTime || "",
              status: b.status,
              title: "Essai Gratuit",
            }),
          ),
        ...(regularData as Booking[]).map(
          (b): UnifiedBooking => ({
            id: b.id,
            type: "REGULAR",
            date: b.sessionDate,
            start: b.startTime,
            end: b.endTime,
            status: b.status,
            title: "Anglais Standard",
          }),
        ),
      ];

      // Sort by date descending
      const sorted = unified
        .filter((b) => b.date && b.start)
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.start}`).getTime();
          const dateB = new Date(`${b.date}T${b.start}`).getTime();
          return dateB - dateA;
        });

      setBookings(sorted);
    } catch (error) {
      console.error("Failed to fetch history data", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedKidId]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const getStatusConfig = (status: Booking["status"]) => {
    switch (status) {
      case "COMPLETED":
        return {
          label: "Terminé",
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          icon: <CheckCircle2 className="w-4 h-4" />,
        };
      case "CANCELLED":
        return {
          label: "Annulé",
          color: "text-rose-600",
          bg: "bg-rose-50",
          border: "border-rose-100",
          icon: <XCircle className="w-4 h-4" />,
        };
      case "REPORTED":
        return {
          label: "Reporté",
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-100",
          icon: <Clock3 className="w-4 h-4" />,
        };
      case "MISSED":
      case "ABSENT":
      case "DONE_BUT_MISSING":
        return {
          label: "Absence",
          color: "text-slate-500",
          bg: "bg-slate-50",
          border: "border-slate-200",
          icon: <AlertCircle className="w-4 h-4" />,
        };
      default:
        return {
          label: "Prévu",
          color: "text-blue",
          bg: "bg-blue/5",
          border: "border-blue/10",
          icon: <Calendar className="w-4 h-4" />,
        };
    }
  };

  if (loading && bookings.length === 0) {
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

      <main className="grow max-w-7xl mx-auto w-full px-4 md:px-8 py-6 md:py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-navy">
              Historique des cours
            </h1>
            <p className="text-navy/40 font-medium mt-1">
              Retrouvez l'évolution des séances de{" "}
              <span className="text-blue font-bold">
                {selectedKidObj?.name}
              </span>
              .
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 text-sm font-bold text-navy/60">
              <Filter className="w-4 h-4" />
              <span>Derniers 30 jours</span>
            </div>
          </div>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const config = getStatusConfig(
                booking.status as Booking["status"],
              );
              return (
                <Card
                  key={booking.id}
                  className="p-0 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row items-stretch">
                    {/* Date / Time section */}
                    <div className="sm:w-48 bg-slate-50/50 border-r border-slate-100 p-5 flex sm:flex-col justify-between sm:justify-center items-center sm:items-start gap-2">
                      <div className="text-xs font-black text-navy/30 uppercase tracking-widest">
                        {booking.start.substring(0, 5)}
                      </div>
                      <div className="text-sm font-black text-navy leading-tight">
                        {new Date(booking.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="grow p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      <div className="grow space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-navy text-lg">
                            {booking.title}
                          </h3>
                          <div
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${config.bg} ${config.color} border ${config.border}`}
                          >
                            {config.icon}
                            {config.label}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-navy/40 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {toHHMM(booking.start)} - {toHHMM(booking.end)}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-slate-300" />
                          <div className="flex items-center gap-1.5 capitalize">
                            {formatDateFR(booking.date)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-slate-100 sm:pl-6">
                        <div className="text-right hidden md:block">
                          <div className="text-[10px] font-black text-navy/30 uppercase tracking-widest leading-none mb-1">
                            Abonnement
                          </div>
                          <div className="text-sm font-bold text-navy leading-none">
                            Tarakid Prime
                          </div>
                        </div>
                        <button
                          onClick={() => navigate("/help")}
                          className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-navy/40 hover:bg-blue hover:text-white transition-all group"
                        >
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
              <Calendar className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-navy">Aucun historique</h3>
              <p className="text-navy/40 font-medium max-w-sm mx-auto">
                Les cours terminés ou annulés apparaîtront ici pour suivre la
                progression de votre enfant.
              </p>
            </div>
            <button
              onClick={() => navigate("/book-classes")}
              className="inline-flex items-center gap-2 bg-blue text-white px-8 py-3 rounded-2xl font-black hover:bg-deepBlue transition-all"
            >
              Réserver un premier cours
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
