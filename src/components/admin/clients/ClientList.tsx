import React from "react";
import {
  User as UserIcon,
  Mail,
  Users,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Clock,
} from "lucide-react";
import { type User } from "../../../services/admin.service";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface ClientListProps {
  clients: User[];
  loading: boolean;
  onViewDetails: (client: User) => void;
  onToggleStatus: (client: User) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  loading,
  onViewDetails,
  onToggleStatus,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-slate-50 animate-pulse rounded-3xl border border-slate-100"
          />
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
          Aucun client trouvé
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map((c) => {
        const kidCount = c.kids?.length || 0;

        return (
          <div
            key={c.id}
            className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-blue/20 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-5 min-w-0">
              {/* Avatar/Icon */}
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${c.isActive ? "bg-blue/10 text-blue" : "bg-slate-100 text-slate-400"}`}
                >
                  <UserIcon className="w-7 h-7" />
                </div>
                {c.isOnline && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-sm"
                    title="En ligne"
                  />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-navy truncate">
                    {c.firstName} {c.lastName}
                  </h3>
                  <div
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${c.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                  >
                    {c.isActive ? "Actif" : "Inactif"}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1.5">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-blue/70">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {kidCount} enfant{kidCount > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {/* Login Info */}
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">
                  Statut
                </p>
                {c.isOnline ? (
                  <div className="flex items-center justify-end gap-1.5 text-[11px] font-bold text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    En ligne
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-1.5 text-[11px] font-bold text-navy/60">
                    <Clock className="w-3 h-3" />
                    {c.lastLogin
                      ? format(parseISO(c.lastLogin), "PPp", { locale: fr })
                      : "Jamais"}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleStatus(c)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    c.isActive
                      ? "bg-red-50 text-red-400 hover:bg-red-500 hover:text-white"
                      : "bg-green-50 text-green-400 hover:bg-green-500 hover:text-white"
                  }`}
                  title={c.isActive ? "Désactiver" : "Réactiver"}
                >
                  {c.isActive ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => onViewDetails(c)}
                  className="w-10 h-10 rounded-2xl bg-blue/5 text-blue flex items-center justify-center hover:bg-blue hover:text-white transition-all shadow-sm"
                  title="Voir les détails"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
