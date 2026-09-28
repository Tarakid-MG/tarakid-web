import React, { useState, useEffect } from "react";
import {
  X,
  User as UserIcon,
  Baby,
  ExternalLink,
  Calendar,
  ChevronDown,
  History,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";
import { type User, type KidLevel } from "../../../services/admin.service";
import {
  kidsService,
  type KidLevelHistory,
} from "../../../services/kids.service";
import { LevelChangeModal } from "../../common/LevelChangeModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface ClientDetailsProps {
  client: User;
  onClose: () => void;
  onRefresh?: () => void;
}

const ALL_LEVELS: KidLevel[] = ["L0", "L1", "L2", "L3", "L4", "L5"];

export const ClientDetails: React.FC<ClientDetailsProps> = ({
  client,
  onClose,
  onRefresh,
}) => {
  const [updatingKid, setUpdatingKid] = useState<{
    id: string;
    name: string;
    level: KidLevel;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [auditHistory, setAuditHistory] = useState<
    Record<string, KidLevelHistory[]>
  >({});
  const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>(
    {},
  );
  const [showHistory, setShowHistory] = useState<Record<string, boolean>>({});
  const [localKids, setLocalKids] = useState(client.kids || []);

  useEffect(() => {
    setLocalKids(client.kids || []);
  }, [client.kids]);

  const fetchHistory = async (kidId: string) => {
    setLoadingHistory((prev) => ({ ...prev, [kidId]: true }));
    try {
      const history = await kidsService.getLevelHistory(kidId);
      setAuditHistory((prev) => ({ ...prev, [kidId]: history }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory((prev) => ({ ...prev, [kidId]: false }));
    }
  };

  const handleLevelChangeRequest = (
    kidId: string,
    kidName: string,
    newLevel: KidLevel,
  ) => {
    setUpdatingKid({ id: kidId, name: kidName, level: newLevel });
  };

  const confirmLevelChange = async (reason: string) => {
    if (!updatingKid) return;
    setIsUpdating(true);
    try {
      await kidsService.updateKidLevel(
        updatingKid.id,
        updatingKid.level,
        reason,
      );

      setLocalKids((prev) =>
        prev.map((k) =>
          String(k.id) === updatingKid.id
            ? { ...k, level: updatingKid.level }
            : k,
        ),
      );

      if (onRefresh) onRefresh();
      await fetchHistory(updatingKid.id);
      setUpdatingKid(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du niveau");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleHistory = (kidId: string) => {
    const isShowing = !showHistory[kidId];
    setShowHistory((prev) => ({ ...prev, [kidId]: isShowing }));
    if (isShowing && !auditHistory[kidId]) {
      fetchHistory(kidId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-4xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white relative">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue/10 flex items-center justify-center">
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
          {localKids.length === 0 ? (
            <div className="text-center py-12">
              <Baby className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Aucun enfant lié à ce compte
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {localKids.map((kid) => (
                <div
                  key={kid.id}
                  className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="p-8 flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col gap-6 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-amber/10 flex items-center justify-center">
                            <Baby className="w-7 h-7 text-amber" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-navy">
                              {kid.name}
                            </h4>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                              {kid.gender === "male" ? "Garçon" : "Fille"} •{" "}
                              {kid.age} ans
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleHistory(String(kid.id))}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                              showHistory[String(kid.id)]
                                ? "bg-navy text-white"
                                : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            <History className="w-4 h-4" />
                            Audit Log
                          </button>

                          <div className="relative group/level">
                            <select
                              value={kid.level || "L0"}
                              onChange={(e) =>
                                handleLevelChangeRequest(
                                  String(kid.id),
                                  kid.name || "",
                                  e.target.value as KidLevel,
                                )
                              }
                              className="appearance-none bg-blue/10 text-blue text-[11px] font-black uppercase px-5 py-2 pr-10 rounded-xl border-none focus:ring-2 focus:ring-blue/50 cursor-pointer transition-all"
                            >
                              {ALL_LEVELS.map((lvl) => (
                                <option key={lvl} value={lvl}>
                                  Niveau {lvl}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-blue absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover/level:translate-y-[-40%] transition-transform" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          {
                            label: "Langue Maternelle",
                            value: kid.motherTongueProficiency,
                            icon: ClipboardList,
                          },
                          {
                            label: "Lecture Anglais",
                            value: kid.englishReadingLevel,
                            icon: ShieldCheck,
                          },
                          {
                            label: "Parler Anglais",
                            value: kid.englishSpeakingLevel,
                            icon: ShieldCheck,
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <item.icon className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {item.label}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-navy">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {kid.hobbies && kid.hobbies.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {kid.hobbies.map((hobby, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-wide border border-slate-200/50"
                            >
                              {hobby}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audit History Panel */}
                  {showHistory[String(kid.id)] && (
                    <div className="bg-slate-50/80 border-t border-slate-100 p-8 animate-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <h5 className="text-xs font-black text-navy uppercase tracking-[0.2em] flex items-center gap-2">
                          <History className="w-4 h-4 text-blue" />
                          Historique des réévaluations
                        </h5>
                      </div>

                      {loadingHistory[String(kid.id)] ? (
                        <div className="py-12 flex flex-col items-center gap-3">
                          <div className="w-6 h-6 border-2 border-blue/20 border-t-blue rounded-full animate-spin" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Chargement...
                          </p>
                        </div>
                      ) : !auditHistory[String(kid.id)] ||
                        auditHistory[String(kid.id)].length === 0 ? (
                        <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                          <p className="text-sm font-bold text-slate-400">
                            Aucun historique disponible pour cet élève.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {auditHistory[String(kid.id)].map((entry) => (
                            <div
                              key={entry.id}
                              className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col gap-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="bg-blue/10 p-2 rounded-xl">
                                    <UserIcon className="w-4 h-4 text-blue" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-navy leading-none">
                                      {entry.performer?.firstName}{" "}
                                      {entry.performer?.lastName}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                      {entry.performer?.role === "teacher"
                                        ? "Professeur"
                                        : "Admin"}{" "}
                                      • {entry.performer?.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-navy uppercase tracking-widest leading-none">
                                    {format(new Date(entry.createdAt), "PPp", {
                                      locale: fr,
                                    })}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2 justify-end">
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md text-[9px] font-bold line-through">
                                      {entry.oldLevel}
                                    </span>
                                    <ChevronDown className="w-3 h-3 text-slate-300 -rotate-90" />
                                    <span className="px-3 py-0.5 bg-blue text-white rounded-md text-[10px] font-black">
                                      {entry.newLevel}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex gap-3 italic">
                                <ClipboardList className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                <p className="text-xs font-bold text-navy leading-relaxed">
                                  "{entry.reason}"
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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

      {updatingKid && (
        <LevelChangeModal
          kidName={updatingKid.name}
          newLevel={updatingKid.level}
          onCancel={() => setUpdatingKid(null)}
          onConfirm={confirmLevelChange}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
};
