import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Clock,
  MoreVertical,
  Star,
  Video,
} from "lucide-react";
import { Button } from "../ui/Button";
import { ParentPanel } from "../parent-dashboard";
import type { ScheduleItem } from "./scheduleTypes";
import { formatDayLabel, formatMonthLabel, toHHMM } from "./scheduleUtils";

type ScheduleListViewProps = {
  bookings: ScheduleItem[];
  kidName: string;
  activeMenuId: string | number | null;
  hasSubscription: boolean;
  subscriptionId?: number | string;
  onToggleMenu: (id: string | number) => void;
  onReport: (booking: ScheduleItem) => void;
  onCancel: (booking: ScheduleItem) => void;
  onJoinClass: () => void;
  onSeeAll: () => void;
  onReserve: () => void;
};

export function ScheduleListView({
  bookings,
  kidName,
  activeMenuId,
  hasSubscription,
  onToggleMenu,
  onReport,
  onCancel,
  onJoinClass,
  onSeeAll,
  onReserve,
}: ScheduleListViewProps) {
  if (bookings.length === 0) {
    return (
      <ParentPanel className="p-0">
        <div className="px-6 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-blue/10 text-blue">
            <Calendar className="h-7 w-7" />
          </div>
          <div className="mt-5 text-[1.35rem] font-black tracking-[-0.03em] text-navy">
            Aucun cours prévu
          </div>
          <div className="mx-auto mt-2 max-w-md text-[15px] leading-7 text-navy/60">
            Réservez un créneau pour continuer l&apos;apprentissage.
          </div>
          <div className="mt-6 flex justify-center">
            <Button onClick={onReserve} className="rounded-[1.1rem] px-7">
              {hasSubscription ? "Réserver un cours" : "Découvrir nos offres"}
            </Button>
          </div>
        </div>
      </ParentPanel>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => {
          const isTrial = booking.type === "FREE_TRIAL";

          return (
            <ParentPanel key={booking.id} className="overflow-hidden p-0">
              <div className="grid grid-cols-1 gap-5 px-4 py-4 md:grid-cols-[106px_1fr_220px_46px] md:items-center md:px-5 md:py-4">
                <div className="rounded-3xl bg-linear-to-br from-[#eef9ff] via-white to-[#f7fcff] p-4 text-center shadow-[inset_0_0_0_1px_rgba(33,158,188,0.06)]">
                  <div className="text-[0.82rem] font-black uppercase tracking-[0.06em] text-blue">
                    {formatDayLabel(booking.date)}
                  </div>
                  <div className="mt-1 text-[2.4rem] font-black leading-none tracking-[-0.05em] text-navy">
                    {new Date(booking.date).getDate()}
                  </div>
                  <div className="mt-1 text-[0.95rem] font-bold text-blue">
                    {formatMonthLabel(booking.date)}
                  </div>
                </div>

                <div className="flex min-w-0 gap-4">
                  <div
                    className={`hidden w-1 shrink-0 rounded-full md:block ${
                      isTrial ? "bg-orange" : "bg-blue"
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-navy/60 md:text-sm">
                      <span className="inline-flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue" />
                        {toHHMM(booking.start)} - {toHHMM(booking.end)}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${
                          isTrial
                            ? "border-orange/20 bg-orange/10 text-orange"
                            : "border-blue/16 bg-blue/10 text-blue"
                        }`}
                      >
                        {isTrial ? "Essai" : "Standard"}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/24 bg-gold/12 text-orange shadow-[0_12px_22px_rgba(239,191,4,0.12)]">
                        <Star className="h-5 w-5 fill-gold text-gold" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[1rem] font-black tracking-[-0.03em] text-navy md:text-[1.15rem]">
                          Anglais {isTrial ? "Découverte" : "Standard"}
                        </div>
                        <div className="text-sm text-navy/62 md:text-[15px]">
                          Pour :
                          <span className="ml-1 font-bold text-blue">{kidName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-center">
                  <Button
                    fullWidth
                    variant="secondary"
                    className="rounded-[1.1rem] border-[#1a7fa3] bg-blue text-sm"
                    onClick={onJoinClass}
                  >
                    <Video className="h-5 w-5" />
                    <span>Rejoindre la classe</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => onToggleMenu(booking.id)}
                    className="inline-flex items-center justify-center gap-2 text-sm font-bold text-blue transition hover:text-deepBlue"
                  >
                    Voir les détails
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMenu(booking.id);
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50/90 text-navy/45 transition hover:bg-white hover:text-navy"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {activeMenuId === booking.id ? (
                    <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-[1.15rem] border border-slate-200 bg-white py-2 shadow-[0_20px_42px_rgba(32,42,68,0.14)]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReport(booking);
                        }}
                        className="w-full px-4 py-2 text-left text-sm font-medium text-orange transition hover:bg-orange/5"
                      >
                        Reporter le cours
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancel(booking);
                        }}
                        className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Annuler le cours
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </ParentPanel>
          );
        })}
      </div>

      <div className="flex flex-col items-center justify-center gap-4 py-3 text-center">
        <p className="text-sm font-medium text-navy/55">
          Vous ne trouvez pas votre cours ?
        </p>
        <button
          type="button"
          onClick={onSeeAll}
          className="inline-flex items-center gap-2 rounded-full border border-blue/20 bg-white/90 px-6 py-3 font-bold text-blue shadow-[0_12px_28px_rgba(32,42,68,0.05)] transition hover:-translate-y-0.5"
        >
          Voir tous les cours
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
