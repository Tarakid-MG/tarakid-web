import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, User, UserCheck } from "lucide-react";
import { useAuth } from "../../../context/AuthContextDefinition";
import type { Booking, FreeTrialBooking } from "../types";

interface TeacherSidebarProps {
  booking: Booking | FreeTrialBooking | null;
  onAcceptStudent: () => void;
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  booking,
  onAcceptStudent,
}) => {
  const { user } = useAuth();

  return (
    <div className="w-80 xl:w-[21rem] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbfc_100%)] border-l border-slate-100 flex flex-col p-5">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-teal/10 rounded-2xl flex items-center justify-center border border-teal/10">
          <Users className="w-5 h-5 text-teal" />
        </div>
        <div>
          <h3 className="font-black text-navy uppercase tracking-widest text-[10px]">Gestion Élèves</h3>
          <p className="text-xs font-bold text-slate-400 mt-0.5">Espace coach</p>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {booking?.isKidWaiting ? (
          <div className="p-5 rounded-[2rem] bg-white border-4 border-white shadow-[0_14px_28px_rgba(32,42,68,0.10)] flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <User className="w-8 h-8 text-blue" />
            </div>
            <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-1">L'élève arrive...</h3>
            <p className="text-xs font-medium text-slate-400 max-w-[150px]">Préparez-vous à commencer la leçon !</p>
            {!booking.isKidAccepted && (
              <button
                onClick={onAcceptStudent}
                className="w-full py-3 mt-4 bg-linear-to-r from-teal to-turquoise text-white rounded-[1rem] font-black text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-teal/20"
              >
                <UserCheck className="w-4 h-4" />
                ACCEPTER L'ÉLÈVE
              </button>
            )}
          </div>
        ) : (
          <div className="p-5 rounded-[2rem] bg-white border-4 border-white shadow-[0_14px_28px_rgba(32,42,68,0.10)] flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue/10">
              <UserCheck className="w-8 h-8 text-teal" />
            </div>
            <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-1">Élève en ligne</h3>
            <p className="text-xs font-black text-teal uppercase tracking-tighter">Prêt pour la leçon</p>
          </div>
        )}
      </div>

      <Link
        to="/teacher/profile"
        className="mt-auto p-4 rounded-[1.5rem] bg-white border-2 border-slate-100 hover:bg-blue/5 hover:border-blue/20 transition-all group shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-blue/10 flex items-center justify-center">
            <User className="w-5 h-5 text-blue" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span className="text-[10px] font-black text-blue uppercase">
                Maître présent
              </span>
            </div>
            <p className="text-sm font-black text-navy truncate mt-0.5">
              {[user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
                "Mon profil"}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-blue/50 group-hover:text-blue transition-colors" />
        </div>
      </Link>
    </div>
  );
};
