import React from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import {
  type CreateUnitDto,
  type Unit,
  type KidLevel,
  labelCls,
  inputCls,
  blue,
} from "./LessonTypes";
import { Message } from "./Shared";

interface UnitManagementProps {
  unitForm: CreateUnitDto;
  setUnitForm: React.Dispatch<React.SetStateAction<CreateUnitDto>>;
  units: Unit[];
  unitCreating: boolean;
  editUnitId: string | null;
  onSave: (e: React.FormEvent) => void;
  onEdit: (u: Unit) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  message: { type: "ok" | "err"; text: string } | null;
  selectedLevel: KidLevel;
  lvlColor: string;
}

export const UnitManagement: React.FC<UnitManagementProps> = ({
  unitForm,
  setUnitForm,
  units,
  unitCreating,
  editUnitId,
  onSave,
  onEdit,
  onDelete,
  onCancel,
  message,
  selectedLevel,
  lvlColor,
}) => {
  return (
    <form onSubmit={onSave} className="space-y-5">
      {message && <Message msg={message} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={{ color: "rgba(32,42,68,0.4)" }}>
            Titre de l'Unité *
          </label>
          <input
            className={inputCls}
            required
            placeholder="Unit Name"
            value={unitForm.title}
            onChange={(e) =>
              setUnitForm({ ...unitForm, title: e.target.value })
            }
          />
        </div>
        <div>
          <label className={labelCls} style={{ color: "rgba(32,42,68,0.4)" }}>
            Ordre (Ex: 1)
          </label>
          <input
            className={inputCls}
            type="number"
            required
            value={unitForm.order}
            onChange={(e) =>
              setUnitForm({ ...unitForm, order: Number(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={unitCreating}
          className="flex-1 py-4 rounded-2xl bg-navy text-white font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{ boxShadow: "0 4px 16px rgba(32,42,68,0.2)" }}
        >
          {editUnitId ? (
            <Edit2 className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {unitCreating
            ? "Patientez…"
            : editUnitId
              ? "Enregistrer"
              : "Créer l'unité"}
        </button>
        {editUnitId && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 rounded-2xl font-bold text-sm transition-all"
            style={{ background: "#f1f5f9", color: "#64748b" }}
          >
            Annuler
          </button>
        )}
      </div>

      {/* Existing units */}
      <div className="pt-4 border-t border-slate-100">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
          Unités existantes pour {selectedLevel}
        </p>
        <div className="space-y-2">
          {units.length > 0 ? (
            units.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border"
                style={{ background: "#f8fafc", borderColor: "#f1f5f9" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                    style={{ background: lvlColor }}
                  >
                    {u.order}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-navy">
                      {u.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {u.lessons?.length || 0} leçon
                      {(u.lessons?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit(u)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: "rgba(33,158,188,0.08)",
                      color: blue,
                    }}
                    onMouseEnter={(e) => (
                      ((e.currentTarget as HTMLElement).style.background =
                        blue),
                      ((e.currentTarget as HTMLElement).style.color = "white")
                    )}
                    onMouseLeave={(e) => (
                      ((e.currentTarget as HTMLElement).style.background =
                        "rgba(33,158,188,0.08)"),
                      ((e.currentTarget as HTMLElement).style.color = blue)
                    )}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(u.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: "rgba(239,68,68,0.06)",
                      color: "#fca5a5",
                    }}
                    onMouseEnter={(e) => (
                      ((e.currentTarget as HTMLElement).style.background =
                        "rgba(239,68,68,0.12)"),
                      ((e.currentTarget as HTMLElement).style.color = "#ef4444")
                    )}
                    onMouseLeave={(e) => (
                      ((e.currentTarget as HTMLElement).style.background =
                        "rgba(239,68,68,0.06)"),
                      ((e.currentTarget as HTMLElement).style.color = "#fca5a5")
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 font-bold italic text-slate-300 text-sm">
              Aucune unité définie
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
