import React from "react";
import { Plus, Edit2 } from "lucide-react";
import { type Level } from "../../../services/admin.service";

interface LevelFormProps {
  form: Omit<Level, "id">;
  editId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (updates: Partial<Omit<Level, "id">>) => void;
  onCancel: () => void;
}

const labelCls =
  "block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5";
const inputCls =
  "w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-navy focus:outline-none focus:border-blue/50 transition-colors placeholder-navy/30";

const LevelForm: React.FC<LevelFormProps> = ({
  form,
  editId,
  onSubmit,
  onChange,
  onCancel,
}) => {
  return (
    <>
      <h2 className="text-base font-black text-navy mb-4 flex items-center gap-2">
        {editId ? (
          <Edit2 className="w-5 h-5 text-blue" />
        ) : (
          <Plus className="w-5 h-5 text-blue" />
        )}
        {editId ? "Modifier le niveau" : "Nouveau niveau"}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        <div>
          <label className={labelCls}>Code (ex: L1)</label>
          <input
            className={inputCls}
            required
            value={form.code}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder="L1, L2..."
          />
        </div>
        <div>
          <label className={labelCls}>Nom (ex: Junior)</label>
          <input
            className={inputCls}
            required
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Junior, Explorer..."
          />
        </div>
        <div>
          <label className={labelCls}>Ordre</label>
          <input
            className={inputCls}
            type="number"
            required
            value={form.order}
            onChange={(e) => onChange({ order: parseInt(e.target.value) })}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue hover:bg-deepBlue text-white font-black py-3 rounded-2xl transition-all"
          >
            {editId ? "Enregistrer" : "Créer"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 bg-slate-100 text-navy/40 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default LevelForm;
