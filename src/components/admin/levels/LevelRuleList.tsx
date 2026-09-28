import React from "react";
import { Settings, ArrowRight, Edit2, Trash2 } from "lucide-react";
import { type LevelRule } from "../../../services/admin.service";

interface LevelRuleListProps {
  rules: LevelRule[];
  loading: boolean;
  onEdit: (rule: LevelRule) => void;
  onDelete: (id: string) => void;
}

const labelCls =
  "block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5";

const LevelRuleList: React.FC<LevelRuleListProps> = ({
  rules,
  loading,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-blue" />
          <h2 className="text-base font-black text-navy">Règles ordonnées</h2>
        </div>
        <div className="text-[10px] font-black text-navy/30 uppercase tracking-widest">
          Trié par priorité ASC
        </div>
      </div>
      <div className="divide-y divide-slate-100 text-sm">
        {loading ? (
          <div className="p-10 text-center text-navy/30 font-bold animate-pulse">
            Chargement des règles...
          </div>
        ) : rules.length === 0 ? (
          <div className="p-10 text-center text-navy/30 font-bold">
            Aucune règle définie
          </div>
        ) : (
          rules.map((r) => (
            <div
              key={r.id}
              className="p-6 hover:bg-slate-50 transition-colors group relative"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-navy text-white text-[10px] font-black">
                      PRIO {r.priority}
                    </span>
                    <div className="flex items-center gap-1.5 text-navy font-black">
                      {r.minAge ?? "?"} - {r.maxAge ?? "?"} ans
                      <ArrowRight className="w-3 h-3 text-blue" />
                      <span className="text-blue">{r.targetLevelCode}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 text-xs font-semibold">
                    <div>
                      <div className={labelCls}>Conditions Lecture</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(r.englishReadingLevels?.length ?? 0) > 0 ? (
                          r.englishReadingLevels.map((lvl) => (
                            <span
                              key={lvl}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-navy/60"
                            >
                              {lvl}
                            </span>
                          ))
                        ) : (
                          <span className="text-navy/20">Toutes</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className={labelCls}>Conditions Oral</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(r.englishSpeakingLevels?.length ?? 0) > 0 ? (
                          r.englishSpeakingLevels.map((lvl) => (
                            <span
                              key={lvl}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-navy/60"
                            >
                              {lvl}
                            </span>
                          ))
                        ) : (
                          <span className="text-navy/20">Toutes</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] font-black text-blue uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue/5 border border-blue/10">
                      Opérateur: {r.operator}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(r)}
                    className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-navy/40 hover:text-blue transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(r.id)}
                    className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-navy/40 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LevelRuleList;
