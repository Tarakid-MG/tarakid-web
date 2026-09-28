import { ChevronLeft, ChevronRight, Clock, Video } from "lucide-react";
import { Button } from "../ui/Button";
import { ParentPanel } from "../parent-dashboard";
import type { CalendarDay, ScheduleItem } from "./scheduleTypes";
import {
  formatLongDateLabel,
  getScheduleStatusTheme,
  scheduleArtCycle,
  toDateKey,
  toHHMM,
  weekDayLabels,
} from "./scheduleUtils";

type ScheduleCalendarViewProps = {
  currentMonthLabel: string;
  kidName: string;
  calendarDays: CalendarDay[];
  selectedCalendarDate: string | null;
  selectedCalendarBookings: ScheduleItem[];
  onSelectDate: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetMonth: () => void;
  onJoinClass: () => void;
};

export function ScheduleCalendarView({
  currentMonthLabel,
  kidName,
  calendarDays,
  selectedCalendarDate,
  selectedCalendarBookings,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onResetMonth,
  onJoinClass,
}: ScheduleCalendarViewProps) {
  return (
    <div className="space-y-5">
      <ParentPanel className="p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black tracking-[-0.03em] text-navy">
              {currentMonthLabel}
            </h3>
            <p className="mt-1 text-sm text-navy/55">
              Vue mensuelle des cours de {kidName}.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-2 shadow-[0_10px_24px_rgba(32,42,68,0.04)]">
            <button
              type="button"
              onClick={onPrevMonth}
              className="flex h-9 w-9 items-center justify-center rounded-full text-navy transition hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onResetMonth}
              className="rounded-full bg-blue/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-blue"
            >
              Ce mois
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-full text-navy transition hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDayLabels.map((label) => (
            <div
              key={label}
              className="pb-2 text-center text-[11px] font-black uppercase tracking-[0.18em] text-navy/35"
            >
              {label}
            </div>
          ))}

          {calendarDays.map((day) => {
            const isSelected = selectedCalendarDate === day.dateKey;
            const isToday = day.dateKey === toDateKey(new Date());
            const primaryBooking = day.bookings[0];
            const statusTheme = primaryBooking
              ? getScheduleStatusTheme(
                  primaryBooking.derivedStatus,
                  primaryBooking.type === "FREE_TRIAL",
                )
              : null;

            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => {
                  if (day.bookings.length > 0) onSelectDate(day.dateKey);
                }}
                className={[
                  "min-h-[96px] rounded-[1.15rem] border p-2 text-left align-top transition md:min-h-[112px] md:p-3",
                  day.inMonth
                    ? "border-slate-100 bg-white/90"
                    : "border-transparent bg-slate-50/55 text-navy/28",
                  day.bookings.length > 0
                    ? "hover:-translate-y-0.5 hover:border-blue/16 hover:shadow-[0_12px_24px_rgba(32,42,68,0.06)]"
                    : "",
                  isSelected
                    ? "border-blue/20 bg-blue/8 shadow-[inset_0_0_0_1px_rgba(33,158,188,0.10)]"
                    : "",
                  isToday ? "ring-2 ring-gold/35" : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-black text-navy">
                    {day.date.getDate()}
                  </span>
                  {day.bookings.length > 0 ? (
                    <span
                      className={[
                        "rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em]",
                        statusTheme?.count || "bg-blue/10 text-blue",
                      ].join(" ")}
                    >
                      {day.bookings.length}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 space-y-1.5">
                  {day.bookings.slice(0, 2).map((booking) => {
                    const bookingTheme = getScheduleStatusTheme(
                      booking.derivedStatus,
                      booking.type === "FREE_TRIAL",
                    );

                    return (
                      <div
                        key={`${day.dateKey}-${booking.id}`}
                        className={[
                          "truncate rounded-full px-2 py-1 text-[11px] font-bold",
                          bookingTheme.chip,
                        ].join(" ")}
                      >
                        {toHHMM(booking.start)} {bookingTheme.badge}
                      </div>
                    );
                  })}
                  {day.bookings.length > 2 ? (
                    <div className="text-[11px] font-semibold text-navy/45">
                      +{day.bookings.length - 2} autres
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </ParentPanel>

      {selectedCalendarBookings.length > 0 ? (
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-black tracking-[-0.02em] text-navy">
              Cours du {formatLongDateLabel(selectedCalendarDate || "")}
            </h3>
            <p className="mt-1 text-sm text-navy/55">
              Séances prévues pour cette journée.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {selectedCalendarBookings.map((booking, index) => {
              const artSrc = scheduleArtCycle[index % scheduleArtCycle.length];
              const isTrial = booking.type === "FREE_TRIAL";
              const bookingTheme = getScheduleStatusTheme(
                booking.derivedStatus,
                isTrial,
              );

              return (
                <ParentPanel
                  key={`calendar-${booking.id}`}
                  className="overflow-hidden p-0"
                >
                  <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-[1fr_92px] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-navy/60">
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue" />
                          {toHHMM(booking.start)} - {toHHMM(booking.end)}
                        </span>
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]",
                            bookingTheme.chip,
                          ].join(" ")}
                        >
                          {bookingTheme.badge}
                        </span>
                      </div>
                      <div className="mt-3 text-lg font-black tracking-[-0.03em] text-navy">
                        Anglais {isTrial ? "Découverte" : "Standard"}
                      </div>
                      <div className="mt-1 text-sm text-navy/60">
                        Pour <span className="font-bold text-blue">{kidName}</span>
                      </div>
                      <div className="mt-3">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]",
                            bookingTheme.detail,
                          ].join(" ")}
                        >
                          {bookingTheme.label}
                        </span>
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="secondary"
                          className="rounded-2xl px-5 py-2.5 text-sm"
                          onClick={onJoinClass}
                        >
                          <Video className="h-4 w-4" />
                          <span>Rejoindre</span>
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <img
                        src={artSrc}
                        alt=""
                        className="h-20 w-20 object-contain drop-shadow-[0_12px_20px_rgba(32,42,68,0.14)]"
                      />
                    </div>
                  </div>
                </ParentPanel>
              );
            })}
          </div>
        </div>
      ) : selectedCalendarDate ? (
        <ParentPanel className="p-6 text-center">
          <div className="text-base font-black text-navy">Aucun cours sur cette date</div>
          <div className="mt-2 text-sm text-navy/55">
            Sélectionnez un jour avec un badge pour voir les détails.
          </div>
        </ParentPanel>
      ) : (
        <ParentPanel className="p-6 text-center">
          <div className="text-base font-black text-navy">Sélectionnez une date</div>
          <div className="mt-2 text-sm text-navy/55">
            Cliquez sur un jour du calendrier pour afficher les cours de cette
            journée.
          </div>
        </ParentPanel>
      )}
    </div>
  );
}
