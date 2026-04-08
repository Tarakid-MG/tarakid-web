import React from "react";
import { Layers, Edit2, Trash2 } from "lucide-react";
import { type Level } from "../../../services/admin.service";

interface LevelListProps {
  levels: Level[];
  loading: boolean;
  onEdit: (level: Level) => void;
  onDelete: (id: string) => void;
}

const LevelList: React.FC<LevelListProps> = ({
  levels,
  loading,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <Layers className="w-5 h-5 text-blue" />
        <h2 className="text-base font-black text-navy">Niveaux existants</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="p-10 text-center text-navy/30 font-bold animate-pulse">
            Chargement des niveaux...
          </div>
        ) : levels.length === 0 ? (
          <div className="p-10 text-center text-navy/30 font-bold">
            Aucun niveau défini
          </div>
        ) : (
          levels.map((l) => (
            <div
              key={l.id}
              className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue/5 border border-blue/10 flex items-center justify-center text-blue font-black text-xs">
                  {l.code}
                </div>
                <div>
                  <div className="font-black text-navy">{l.name}</div>
                  <div className="text-[10px] font-bold text-navy/30 uppercase tracking-tighter">
                    Ordre: {l.order}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(l)}
                  className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-navy/40 hover:text-blue transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(l.id)}
                  className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-navy/40 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LevelList;
