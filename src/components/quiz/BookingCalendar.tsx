import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

interface BookingCalendarProps {
    availableDates: string[]; // ISO date strings
    selectedDate: string | null;
    onDateSelect: (date: string) => void;
    isAdmin?: boolean;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
    availableDates,
    selectedDate,
    onDateSelect,
    isAdmin = false,
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isChangingMonth, setIsChangingMonth] = useState(false);

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const changeMonth = (offset: number) => {
        setIsChangingMonth(true);
        setTimeout(() => {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset));
            setIsChangingMonth(false);
        }, 200);
    };

    const formatDateKey = (day: number) => {
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${month}-${dayStr}`;
    };

    const isDateAvailable = (dateKey: string) => {
        return availableDates.includes(dateKey);
    };

    const monthName = currentMonth.toLocaleString('fr-FR', { month: 'long' });
    const year = currentMonth.getFullYear();
    const days = Array.from({ length: daysInMonth(currentMonth) }, (_, i) => i + 1);
    const startDay = firstDayOfMonth(currentMonth);

    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    return (
        <div className={`bg-white rounded-[40px] p-8 shadow-2xl shadow-blue/5 border-2 border-white relative overflow-hidden group ${isAdmin ? 'bg-slate-50/30' : ''}`}>
            {/* Subtle background decoration */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue/5 rounded-full blur-3xl group-hover:bg-blue/10 transition-colors duration-700"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-navy capitalize flex items-center">
                            {monthName}
                            <span className="text-blue/50 ml-2 italic">{year}</span>
                        </h3>
                        {!isAdmin && (
                            <p className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] mt-1">
                                Sélectionnez votre date magique
                            </p>
                        )}
                    </div>

                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-inner">
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

                <div className={`transition-all duration-300 ${isChangingMonth ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                    <div className="grid grid-cols-7 gap-4 mb-6 text-center">
                        {weekDays.map(day => (
                            <div key={day} className="text-[10px] font-black text-navy/40 uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-3">
                        {/* Empty slots for spacing */}
                        {Array.from({ length: startDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
                        ))}

                        {days.map(day => {
                            const dateKey = formatDateKey(day);
                            const isAvailable = isDateAvailable(dateKey);
                            const isSelected = selectedDate === dateKey;
                            const isToday = new Date().toISOString().split('T')[0] === dateKey;

                            return (
                                <button
                                    key={day}
                                    disabled={!isAvailable && !isAdmin} // Admins might want to see/select empty dates
                                    onClick={() => onDateSelect(dateKey)}
                                    className={`
                                        aspect-square rounded-full flex flex-col items-center justify-center transition-all relative group/day
                                        ${isAvailable || isAdmin
                                            ? isSelected
                                                ? 'bg-blue text-white shadow-xl shadow-blue/30 scale-110 z-20 overflow-hidden'
                                                : isAvailable
                                                    ? 'bg-white border-2 border-slate-50 hover:border-blue/20 hover:bg-blue/5 text-navy font-bold hover:scale-105 active:scale-95'
                                                    : 'bg-white border-2 border-slate-50 text-navy/40 hover:border-slate-200 shadow-sm'
                                            : 'bg-slate-50/50 text-navy/30 cursor-not-allowed opacity-40'
                                        }
                                        ${isToday && !isSelected ? 'ring-2 ring-yellow ring-offset-2' : ''}
                                    `}
                                >
                                    <span className={`text-lg font-black relative z-10 ${isSelected ? 'animate-in zoom-in-50' : ''}`}>{day}</span>

                                    {isAvailable && !isSelected && (
                                        <div className="absolute bottom-2.5 w-2 h-2 bg-blue/40 rounded-full group-hover/day:bg-blue group-hover/day:scale-125 transition-all"></div>
                                    )}

                                    {isSelected && !isAdmin && (
                                        <Sparkles className="absolute top-1 right-1 w-4 h-4 text-yellow animate-pulse" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-navy/50">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center">
                            <div className="w-2.5 h-2.5 bg-blue rounded-full mr-2 shadow-sm shadow-blue/20"></div>
                            <span>{isAdmin ? 'Sessions' : 'Disponible'}</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-2.5 h-2.5 bg-slate-100 border border-slate-200 rounded-full mr-2"></div>
                            <span>Indisponible</span>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="flex items-center text-blue/60">
                            <CalendarIcon className="w-3 h-3 mr-2" />
                            <span>Vue Admin</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingCalendar;
