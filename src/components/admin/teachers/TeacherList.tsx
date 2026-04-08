import React from "react";
import {
  Edit2,
  ShieldAlert,
  ShieldCheck,
  Mail,
  User as UserIcon,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { type User } from "./TeacherTypes";
import { parseISO, format } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface TeacherListProps {
  teachers: User[];
  loading: boolean;
  onEdit: (teacher: User) => void;
  onToggleStatus: (teacher: User) => void;
  onViewSchedule: (teacher: User) => void;
}

export const TeacherList: React.FC<TeacherListProps> = ({
  teachers,
  loading,
  onEdit,
  onToggleStatus,
  onViewSchedule,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-slate-50 animate-pulse rounded-2xl border border-slate-100"
          />
        ))}
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <UserIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-400">
          Aucun professeur trouvé
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {teachers.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue/20 transition-all group"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  t.isActive
                    ? "bg-blue/10 text-blue"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <UserIcon className="w-6 h-6" />
              </div>
              {t.isOnline && (
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-sm"
                  title="En ligne"
                />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-sm text-navy truncate">
                {t.firstName} {t.lastName}
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 mt-1">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{t.email}</span>
                </div>
                {t.isOnline ? (
                  <div className="flex items-center gap-1.5 shrink-0 border-l border-slate-200 pl-3 text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>En ligne maintenant</span>
                  </div>
                ) : t.lastLogin ? (
                  <div className="flex items-center gap-1.5 shrink-0 border-l border-slate-200 pl-3">
                    <Clock className="w-3 h-3" />
                    <span>
                      {format(parseISO(t.lastLogin), "PPp", { locale: fr })}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status Badge */}
            <div
              className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                t.isActive
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {t.isActive ? "Actif" : "Inactif"}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              <button
                onClick={() => onViewSchedule(t)}
                className="w-8 h-8 rounded-xl bg-teal/5 text-teal flex items-center justify-center hover:bg-teal hover:text-white transition-all"
                title="Voir le planning"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onEdit(t)}
                className="w-8 h-8 rounded-xl bg-blue/5 text-blue flex items-center justify-center hover:bg-blue hover:text-white transition-all"
                title="Modifier"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onToggleStatus(t)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  t.isActive
                    ? "bg-red-50 text-red-400 hover:bg-red-500 hover:text-white"
                    : "bg-green-50 text-green-400 hover:bg-green-500 hover:text-white"
                }`}
                title={t.isActive ? "Désactiver" : "Réactiver"}
              >
                {t.isActive ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
