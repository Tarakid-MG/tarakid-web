import React from "react";
import { Plus, Edit2, Upload, AlertCircle } from "lucide-react";
import {
  type CreateLessonDto,
  type Unit,
  LESSON_TYPES,
  labelCls,
  inputCls,
} from "./LessonTypes";
import { Message } from "./Shared";

interface LessonFormProps {
  lessonForm: CreateLessonDto;
  setLessonForm: React.Dispatch<React.SetStateAction<CreateLessonDto>>;
  units: Unit[];
  loadingUnits: boolean;
  creating: boolean;
  uploadingThumb: boolean;
  editLessonId: string | null;
  selectedFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  message: { type: "ok" | "err"; text: string } | null;
  lvlColor: string;
  lvlBg: string;
}

export const LessonForm: React.FC<LessonFormProps> = ({
  lessonForm,
  setLessonForm,
  units,
  loadingUnits,
  creating,
  uploadingThumb,
  editLessonId,
  selectedFile,
  fileInputRef,
  onFileChange,
  onSubmit,
  message,
  lvlColor,
  lvlBg,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {message && <Message msg={message} />}

      {/* Unit select */}
      <div>
        <label className={labelCls} style={{ color: "rgba(32,42,68,0.4)" }}>
          Sélectionner l'Unité *
        </label>
        {loadingUnits ? (
          <div className="h-11 bg-slate-100 animate-pulse rounded-xl" />
        ) : units.length > 0 ? (
          <select
            className={inputCls}
            required
            value={lessonForm.unitId}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, unitId: e.target.value })
            }
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                Unité {u.order}: {u.title}
              </option>
            ))}
          </select>
        ) : (
          <div
            className="p-4 rounded-2xl flex items-center gap-3 text-sm font-bold"
            style={{
              background: "rgba(247,127,0,0.08)",
              border: "1.5px solid rgba(247,127,0,0.25)",
              color: "var(--color-orange)",
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            Aucune unité pour ce niveau. Créez-en une d'abord.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={{ color: "rgba(32,42,68,0.4)" }}>
            Titre de la leçon *
          </label>
          <input
            className={inputCls}
            required
            placeholder="Les couleurs, Alphabet..."
            value={lessonForm.title}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, title: e.target.value })
            }
          />
        </div>
        <div>
          <label className={labelCls} style={{ color: "rgba(32,42,68,0.4)" }}>
            Numéro de leçon (Ordre)
          </label>
          <input
            className={inputCls}
            type="number"
            min={1}
            value={lessonForm.order}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, order: Number(e.target.value) })
            }
          />
        </div>
      </div>

      {/* Thumbnail upload */}
      <div>
        <label className={labelCls} style={{ color: "rgba(32,42,68,0.4)" }}>
          Image de couverture (Optionnel)
        </label>
        <div
          className="flex items-center gap-4 p-4 rounded-2xl border"
          style={{ background: "#f8fafc", borderColor: "#f1f5f9" }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative shrink-0 border-2 border-dashed"
            style={{
              borderColor:
                selectedFile || lessonForm.thumbnailUrl ? lvlColor : "#e2e8f0",
              background:
                selectedFile || lessonForm.thumbnailUrl
                  ? "transparent"
                  : "#f8fafc",
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : lessonForm.thumbnailUrl ? (
              <img
                src={lessonForm.thumbnailUrl}
                alt="Current"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Upload className="w-5 h-5 mb-1" style={{ color: "#cbd5e1" }} />
                <span className="text-[8px] font-black text-slate-300">
                  UPLOAD
                </span>
              </>
            )}
            {uploadingThumb && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(32,42,68,0.65)" }}
              >
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-2.5 leading-relaxed">
              Sélectionnez une image PNG/JPG pour l'aperçu.
              <br />
              Stockée dans MinIO.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all"
              style={{ background: lvlBg, color: lvlColor }}
            >
              Choisir un fichier
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={onFileChange}
            />
          </div>
        </div>
      </div>

      {/* Lesson type */}
      <div>
        <label className={labelCls} style={{ color: "rgba(32,42,68,0.4)" }}>
          Type de contenu
        </label>
        <div className="flex gap-2">
          {LESSON_TYPES.map((t) => {
            const selected = lessonForm.type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setLessonForm({ ...lessonForm, type: t.value })}
                className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all"
                style={
                  selected
                    ? {
                        background: lvlBg,
                        color: lvlColor,
                        border: `2px solid #219EBC`,
                      }
                    : {
                        background: "#f8fafc",
                        color: "#94a3b8",
                        border: "2px solid #f1f5f9",
                      }
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content URL */}
      <div>
        <label className={labelCls} style={{ color: "rgba(32,42,68,0.4)" }}>
          {lessonForm.type === "pdf"
            ? "URL du document PDF"
            : "Contenu (URL ou Code Embed)"}
        </label>
        {lessonForm.type === "pdf" ? (
          <input
            className={inputCls}
            required
            placeholder="https://example.com/file.pdf"
            value={lessonForm.content}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, content: e.target.value })
            }
          />
        ) : (
          <textarea
            className={`${inputCls} min-h-[190px] resize-y`}
            required
            placeholder="<div>Votre contenu interactif ici...</div>"
            value={lessonForm.content}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, content: e.target.value })
            }
          />
        )}
      </div>

      {/* Description */}
      <div>
        <label className={labelCls} style={{ color: "rgba(32,42,68,0.4)" }}>
          Description facultative
        </label>
        <textarea
          className={`${inputCls} resize-none h-20`}
          placeholder="..."
          value={lessonForm.description}
          onChange={(e) =>
            setLessonForm({ ...lessonForm, description: e.target.value })
          }
        />
      </div>

      <button
        type="submit"
        disabled={creating || uploadingThumb || units.length === 0}
        className="w-full py-4 rounded-2xl bg-blue text-white font-black text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ boxShadow: "0 6px 20px rgba(33,158,188,0.25)" }}
      >
        {creating || uploadingThumb ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Patientez…
          </>
        ) : editLessonId ? (
          <>
            <Edit2 className="w-4 h-4" /> Mettre à jour la leçon
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" /> Créer la leçon
          </>
        )}
      </button>
    </form>
  );
};
