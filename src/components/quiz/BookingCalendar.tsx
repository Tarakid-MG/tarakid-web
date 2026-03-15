import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";

interface BookingCalendarProps {
  availableDates: string[];
  fullDates?: string[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  isAdmin?: boolean;
  minDate?: string;
  maxDate?: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  availableDates,
  fullDates = [],
  selectedDate,
  onDateSelect,
  isAdmin = false,
  minDate,
  maxDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isChangingMonth, setIsChangingMonth] = useState(false);

  const daysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const firstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const changeMonth = (offset: number) => {
    setIsChangingMonth(true);
    setTimeout(() => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset),
      );
      setIsChangingMonth(false);
    }, 250);
  };

  const formatDateKey = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${month}-${dayStr}`;
  };

  const isDateAvailable = (dateKey: string) => availableDates.includes(dateKey);
  const isDateFull = (dateKey: string) => fullDates.includes(dateKey);

  const monthName = currentMonth.toLocaleString("fr-FR", { month: "long" });
  const year = currentMonth.getFullYear();
  const days = Array.from(
    { length: daysInMonth(currentMonth) },
    (_, i) => i + 1,
  );
  const startDay = (firstDayOfMonth(currentMonth) + 6) % 7;
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div
      className={`bg-white rounded-[40px] p-8 shadow-2xl shadow-blue/5 border-2 border-white relative overflow-hidden group ${isAdmin ? "bg-slate-50/30" : ""}`}
    >
      {/* Background decorations */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue/5 rounded-full blur-3xl group-hover:bg-blue/10 transition-colors duration-700" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue/3 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h3 className="text-2xl font-black text-navy tracking-tight capitalize">
              {monthName}{" "}
              <span className="text-slate-300 font-light">{year}</span>
            </h3>
            <p className="text-[11px] font-bold text-blue/40 uppercase tracking-[0.15em] mt-0.5">
              {isAdmin
                ? "Gestion des disponibilités"
                : "Réservez votre créneau"}
            </p>
          </div>

          <div className="flex gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-inner">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2.5 hover:bg-white hover:text-blue hover:shadow-sm rounded-xl transition-all text-navy/60 active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-2.5 hover:bg-white hover:text-blue hover:shadow-sm rounded-xl transition-all text-navy/60 active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div
          className={`transition-all duration-300 ease-out ${
            isChangingMonth
              ? "opacity-40 scale-[0.98] blur-sm"
              : "opacity-100 scale-100 blur-0"
          }`}
        >
          {/* Weekday headers — pill style */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, i) => (
              <div
                key={day}
                className={`
                  flex items-center justify-center py-1.5 rounded-xl
                  text-[9px] font-black uppercase tracking-widest
                  ${i !== 5 ? "bg-blue/8 text-blue/70" : "bg-slate-50 text-navy/35"}
                `}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {days.map((day) => {
              const dateKey = formatDateKey(day);
              const isAvailable = isDateAvailable(dateKey);
              const isFull = isDateFull(dateKey);
              const isSelected = selectedDate === dateKey;
              const isToday =
                new Date().toISOString().split("T")[0] === dateKey;
              const isWithinRange =
                (!minDate || dateKey >= minDate) &&
                (!maxDate || dateKey <= maxDate);
              const canSelect = (isAvailable || isAdmin) && isWithinRange;

              return (
                <button
                  key={day}
                  disabled={!canSelect}
                  onClick={() => onDateSelect(dateKey)}
                  className={`
                    relative aspect-square rounded-2xl flex flex-col items-center justify-center
                    transition-all duration-200 group/day overflow-hidden
                    ${
                      isSelected
                        ? "bg-blue text-white shadow-lg shadow-blue/30 scale-105 z-10"
                        : canSelect
                          ? "bg-white hover:bg-blue/5 border border-slate-100 hover:border-blue/20 text-navy hover:scale-105 active:scale-95"
                          : "bg-slate-50/50 text-slate-300 cursor-not-allowed"
                    }
                    ${isToday && !isSelected ? "ring-2 ring-yellow ring-offset-2 ring-offset-white" : ""}
                  `}
                >
                  {/* Inner glow for selected */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-linear-to-br from-white/15 to-transparent rounded-2xl pointer-events-none" />
                  )}

                  {/* Today dot */}
                  {isToday && !isSelected && (
                    <div className="absolute top-2 w-1 h-1 bg-blue rounded-full" />
                  )}

                  <span
                    className={`
                      relative z-10 leading-none select-none
                      ${
                        isSelected
                          ? "text-base font-black scale-110"
                          : canSelect
                            ? "text-sm font-bold"
                            : "text-sm font-medium"
                      }
                    `}
                  >
                    {day}
                  </span>

                  {/* Availability dot */}
                  {isAvailable && !isSelected && (
                    <div className="absolute bottom-2 w-1.5 h-1.5 bg-blue/20 group-hover/day:bg-blue/50 rounded-full transition-colors" />
                  )}

                  {/* Full dot */}
                  {isFull && !isAvailable && !isSelected && (
                    <div className="absolute bottom-2 w-1.5 h-1.5 bg-slate-200 rounded-full" />
                  )}

                  {/* Sparkle for selected */}
                  {isSelected && !isAdmin && (
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow animate-bounce" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer legend */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue rounded-full shadow-sm shadow-blue/30" />
              <span className="text-[10px] font-bold text-navy/50 uppercase tracking-wider">
                {isAdmin ? "Sessions" : "Libre"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-200 rounded-full" />
              <span className="text-[10px] font-bold text-navy/50 uppercase tracking-wider">
                Occupé
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center px-3 py-1 bg-blue/10 rounded-full text-blue">
              <CalendarIcon className="w-3 h-3 mr-1.5" />
              <span className="text-[9px] font-black uppercase">
                Admin Mode
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
