import React from "react";
import {
  X,
  User as UserIcon,
  Baby,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { type User } from "../../../services/admin.service";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface ClientDetailsProps {
  client: User;
  onClose: () => void;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({
  client,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-4xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white relative">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.25rem] bg-blue/10 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-navy leading-tight">
                {client.firstName} {client.lastName}
              </h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Détails du compte parent • {client.kids?.length || 0} enfants
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400 hover:text-navy"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Kids Content */}
        <div className="flex-1 overflow-auto p-8 lg:p-10 bg-slate-50/30">
          {!client.kids || client.kids.length === 0 ? (
            <div className="text-center py-12">
              <Baby className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Aucun enfant lié à ce compte
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {client.kids.map((kid) => (
                <div
                  key={kid.id}
                  className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber/10 flex items-center justify-center">
                        <Baby className="w-6 h-6 text-amber" />
                      </div>
                      <div>
                        <h4 className="font-black text-navy">{kid.name}</h4>
                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                          {kid.gender === "male" ? "Garçon" : "Fille"} •{" "}
                          {kid.age} ans
                        </span>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-blue/10 rounded-full">
                      <span className="text-[10px] font-black text-blue uppercase">
                        {kid.level || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">
                        Langue Maternelle
                      </span>
                      <span className="text-navy">
                        {kid.motherTongueProficiency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">
                        Lecture Anglais
                      </span>
                      <span className="text-navy">
                        {kid.englishReadingLevel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">
                        Parler Anglais
                      </span>
                      <span className="text-navy">
                        {kid.englishSpeakingLevel}
                      </span>
                    </div>
                  </div>

                  {kid.hobbies && kid.hobbies.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                      {kid.hobbies.map((hobby, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-wide"
                        >
                          {hobby}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-center gap-10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-300" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Inscrit le{" "}
              {client.createdAt
                ? format(new Date(client.createdAt as string), "PP", {
                    locale: fr,
                  })
                : "N/A"}
            </span>
          </div>
          {client.phoneNumber && (
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-slate-300" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {client.phoneNumber}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
