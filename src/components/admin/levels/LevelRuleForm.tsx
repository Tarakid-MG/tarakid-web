import React from "react";
import { Plus, Edit2 } from "lucide-react";
import {
  type LevelRule,
  type EnglishLevel,
  type KidLevel,
} from "../../../services/admin.service";

interface LevelRuleFormProps {
  form: Partial<LevelRule>;
  editId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (updates: Partial<LevelRule>) => void;
  onCancel: () => void;
}

const labelCls =
  "block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5";
const inputCls =
  "w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-navy focus:outline-none focus:border-blue/50 transition-colors placeholder-navy/30";

const ENGLISH_LEVEL_OPTIONS: EnglishLevel[] = [
  "NONE",
  "WORDS",
  "SENTENCES",
  "FLUENT",
];
const KID_LEVEL_OPTIONS: KidLevel[] = ["L0", "L1", "L2", "L3", "L4", "L5"];

const LevelRuleForm: React.FC<LevelRuleFormProps> = ({
  form,
  editId,
  onSubmit,
  onChange,
  onCancel,
}) => {
  const toggleSkill = (
    field: "englishReadingLevels" | "englishSpeakingLevels",
    level: EnglishLevel,
  ) => {
    const current = (form[field] as EnglishLevel[]) || [];
    if (current.includes(level)) {
      onChange({ [field]: current.filter((l) => l !== level) });
    } else {
      onChange({ [field]: [...current, level] });
    }
  };

  return (
    <>
      <h2 className="text-base font-black text-navy mb-4 flex items-center gap-2">
        {editId ? (
          <Edit2 className="w-5 h-5 text-blue" />
        ) : (
          <Plus className="w-5 h-5 text-blue" />
        )}
        {editId ? "Modifier la règle" : "Nouvelle règle"}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Âge Min</label>
            <input
              type="number"
              className={inputCls}
              value={form.minAge ?? ""}
              onChange={(e) =>
                onChange({
                  minAge: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            />
          </div>
          <div>
            <label className={labelCls}>Âge Max</label>
            <input
              type="number"
              className={inputCls}
              value={form.maxAge ?? ""}
              onChange={(e) =>
                onChange({
                  maxAge: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Niveaux de Lecture</label>
          <div className="flex flex-wrap gap-1.5">
            {ENGLISH_LEVEL_OPTIONS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => toggleSkill("englishReadingLevels", l)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight border-2 transition-all ${
                  form.englishReadingLevels?.includes(l)
                    ? "border-blue bg-blue/5 text-blue"
                    : "border-slate-100 text-navy/30 hover:border-slate-200"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Niveaux d'Oral</label>
          <div className="flex flex-wrap gap-1.5">
            {ENGLISH_LEVEL_OPTIONS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => toggleSkill("englishSpeakingLevels", l)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight border-2 transition-all ${
                  form.englishSpeakingLevels?.includes(l)
                    ? "border-blue bg-blue/5 text-blue"
                    : "border-slate-100 text-navy/30 hover:border-slate-200"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Opérateur</label>
            <select
              className={inputCls}
              value={form.operator}
              onChange={(e) =>
                onChange({
                  operator: e.target.value as "AND" | "OR",
                })
              }
            >
              <option value="AND">AND (Les deux)</option>
              <option value="OR">OR (L'un ou l'autre)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Niveau Cible</label>
            <select
              className={inputCls}
              value={form.targetLevelCode}
              onChange={(e) =>
                onChange({
                  targetLevelCode: e.target.value as KidLevel,
                })
              }
            >
              {KID_LEVEL_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Priorité (Bas = Prioritaire)</label>
          <input
            type="number"
            className={inputCls}
            value={form.priority}
            onChange={(e) =>
              onChange({
                priority: parseInt(e.target.value),
              })
            }
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

export default LevelRuleForm;
