import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  CalendarClock,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { bookingService } from "../../services/booking.service";
import { freeTrialService } from "../../services/free-trial.service";
import { subscriptionService } from "../../services/subscription.service";
import type { Subscription } from "../../types/auth";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | number;
  bookingType: "REGULAR" | "FREE_TRIAL";
  userId: number;
  /** kidId is required for REGULAR bookings to find the active subscription */
  kidId?: string;
  teacherId?: number;
}

const ReportBookingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  bookingId,
  bookingType,
  userId,
  kidId,
  teacherId,
}) => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [reporting, setReporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || bookingType !== "REGULAR" || !kidId) return;
    subscriptionService
      .getKidSubscriptions(kidId)
      .then((subs) => {
        const active = (subs as Subscription[]).find(
          (s) => s.status === "ACTIVE",
        );
        setSubscription(active || null);
      })
      .catch(() => setSubscription(null));
  }, [isOpen, bookingType, kidId]);

  const subEndDate = useMemo(() => {
    if (!subscription?.endDate) return null;
    return new Date(subscription.endDate);
  }, [subscription]);

  const subEndLabel = useMemo(() => {
    if (!subEndDate) return "";
    return subEndDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [subEndDate]);

  const handleConfirm = async () => {
    setReporting(true);
    setError(null);
    try {
      if (bookingType === "FREE_TRIAL") {
        await freeTrialService.reportBooking(Number(bookingId), userId);
        onClose();
        navigate(`/free-trial-booking?userId=${userId}`);
      } else {
        await bookingService.reportBooking(String(bookingId));
        onClose();
        if (subscription?.id) {
          const query = new URLSearchParams({
            subscriptionId: subscription.id,
          });
          if (teacherId) {
            query.set("reportMode", "1");
            query.set("reportTeacherId", String(teacherId));
          }
          navigate(`/book-classes?${query.toString()}`);
        } else {
          navigate("/book-classes");
        }
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Une erreur est survenue.";
      setError(msg);
    } finally {
      setReporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-300 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange/10 rounded-2xl flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-orange" />
            </div>
            <div>
              <h2 className="text-lg font-black text-navy">
                Reporter ce cours
              </h2>
              <p className="text-xs text-navy/50 font-medium">
                Votre crédit sera restitué pour un nouveau créneau
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Subscription constraint info */}
          {bookingType === "REGULAR" && subscription && (
            <div className="flex items-start gap-3 p-4 bg-blue/5 border border-blue/10 rounded-2xl">
              <CalendarClock className="w-5 h-5 text-blue shrink-0 mt-0.5" />
              <p className="text-sm text-navy font-medium leading-relaxed">
                Votre abonnement{" "}
                <span className="font-black text-blue">
                  {subscription.planName}
                </span>{" "}
                est valide jusqu'au{" "}
                <span className="font-black">{subEndLabel}</span>. Vous devrez
                réserver votre nouveau créneau{" "}
                <span className="font-black text-orange">avant cette date</span>
                .
              </p>
            </div>
          )}

          {bookingType === "FREE_TRIAL" && (
            <div className="flex items-start gap-3 p-4 bg-blue/5 border border-blue/10 rounded-2xl">
              <CalendarClock className="w-5 h-5 text-blue shrink-0 mt-0.5" />
              <p className="text-sm text-navy font-medium leading-relaxed">
                Ce cours d'essai sera annulé et vous pourrez choisir un nouveau
                créneau disponible.
              </p>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-orange/5 border border-orange/10 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-orange shrink-0 mt-0.5" />
            <p className="text-sm text-navy/70 font-medium leading-relaxed">
              En reportant, ce cours sera marqué comme{" "}
              <span className="font-black text-orange">Reporté</span> et votre
              crédit sera restitué. Cette action est possible uniquement
              <span className="font-black"> 5 heures avant le début</span> du
              cours.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            disabled={reporting}
            className="flex-1 py-3 px-5 rounded-2xl border-2 border-slate-100 text-navy/60 font-black text-sm hover:border-slate-200 hover:bg-slate-50 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={reporting}
            className="flex-1 py-3 px-5 rounded-2xl bg-orange text-white font-black text-sm hover:brightness-110 transition-all shadow-lg shadow-orange/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {reporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Reporter & Rechoisir <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportBookingModal;
