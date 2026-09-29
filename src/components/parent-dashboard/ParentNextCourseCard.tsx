import { ArrowRight, Calendar, Clock3, Star, Video } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ParentPanel } from "../layout/ParentPanel";
import {
  formatDateFR,
  formatTime,
  getBookingHeadline,
  parentArt,
  type UnifiedBooking,
} from "./parentDashboardUtils";

export function ParentNextCourseCard({
  kidName,
  loading,
  booking,
  onOpenSchedule,
  onEnterKidMode,
  onReport,
  onCancel,
  onBook,
  canceling,
}: {
  kidName: string;
  loading: boolean;
  booking: UnifiedBooking | null;
  onOpenSchedule: () => void;
  onEnterKidMode: () => void;
  onReport: () => void;
  onCancel: () => void;
  onBook: () => void;
  canceling: boolean;
}) {
  return (
    <ParentPanel className="overflow-hidden p-5 md:p-6 xl:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-[1.55rem] font-bold tracking-[-0.03em] text-navy md:text-[1.8rem]">
            Prochain cours de {kidName}
          </h2>
          <p className="mt-1 text-[15px] leading-6 text-navy/58">
            Gérez facilement votre prochain créneau.
          </p>
        </div>

        <Button
          onClick={onOpenSchedule}
          variant="parentOutlineBlue"
          className="rounded-full border-blue/18 bg-white px-5 py-3 text-sm shadow-[0_10px_22px_rgba(32,42,68,0.05)]"
        >
          Planning <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-7">
        {loading ? (
          <div className="flex h-[280px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-blue/15 border-t-blue" />
          </div>
        ) : booking ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:items-center">
            <div className="relative flex justify-center lg:justify-start">
              <div className="absolute left-1/2 top-6 h-28 w-28 -translate-x-1/2 rounded-full bg-lightBlue/22 blur-3xl lg:left-24" />
              <div className="relative rounded-[1.7rem] bg-linear-to-br from-[#f2fbff] to-[#fff8e8] p-5 shadow-inner shadow-white/60">
                <img
                  src={parentArt.calendar}
                  alt=""
                  className="h-36 w-36 object-contain drop-shadow-[0_18px_24px_rgba(32,42,68,0.16)]"
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="blue" className="px-4 py-2">
                  {booking.displayType === "FREE_TRIAL"
                    ? "Cours d'essai"
                    : "Cours standard"}
                </Badge>
                <Badge variant="teal" className="px-4 py-2">
                  À venir
                </Badge>
              </div>

              <p className="mt-5 text-[1.7rem] leading-tight font-bold tracking-[-0.03em] text-navy md:text-[1.95rem]">
                {getBookingHeadline(booking)}
              </p>

              <div className="mt-5 flex flex-col gap-3 text-[15px] text-navy/70 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue" />
                  <span className="font-semibold">
                    {formatDateFR(booking.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-blue" />
                  <span className="font-semibold">
                    {formatTime(booking.start)} - {formatTime(booking.end)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 xl:flex-row">
                <Button
                  variant="secondary"
                  className="rounded-[1.1rem] px-6 shadow-[0_10px_22px_rgba(33,158,188,0.18)]"
                  onClick={onEnterKidMode}
                >
                  <Video className="h-5 w-5" />
                  <span>Se connecter</span>
                </Button>
                <Button
                  variant="parentOutlineOrange"
                  className="rounded-[1.1rem]"
                  onClick={onReport}
                  disabled={canceling}
                >
                  Reporter
                </Button>
                <Button
                  variant="parentOutlineRed"
                  className="rounded-[1.1rem]"
                  onClick={onCancel}
                  disabled={canceling}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-gold/15">
              <Star className="h-7 w-7 text-gold" />
            </div>
            <p className="mt-4 text-[1.55rem] font-bold tracking-[-0.03em] text-navy">
              Aucun cours programmé
            </p>
            <p className="mt-2 text-base leading-7 text-navy/60">
              Réservez votre prochain créneau dès maintenant.
            </p>
            <div className="mt-5 flex justify-center">
              <Button className="rounded-[1.1rem] px-6" onClick={onBook}>
                Réserver un cours
              </Button>
            </div>
          </div>
        )}
      </div>
    </ParentPanel>
  );
}
