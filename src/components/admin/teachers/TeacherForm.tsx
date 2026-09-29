import React, { useState } from "react";
import { UserPlus, Edit2, Eye, EyeOff } from "lucide-react";
import { type CreateTeacherDto, labelCls, inputCls } from "./TeacherTypes";
import { Message } from "./Shared";

interface TeacherFormProps {
  teacherForm: CreateTeacherDto;
  setTeacherForm: React.Dispatch<React.SetStateAction<CreateTeacherDto>>;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
  editTeacherId: number | null;
  message: { type: "ok" | "err"; text: string } | null;
  onCancel: () => void;
}

export const TeacherForm: React.FC<TeacherFormProps> = ({
  teacherForm,
  setTeacherForm,
  onSubmit,
  creating,
  editTeacherId,
  message,
  onCancel,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-base font-black text-navy mb-4 flex items-center gap-2">
        {editTeacherId ? (
          <Edit2 className="w-5 h-5 text-blue" />
        ) : (
          <UserPlus className="w-5 h-5 text-blue" />
        )}
        {editTeacherId ? "Modifier le professeur" : "Nouveau compte professeur"}
      </h2>

      {message && <Message msg={message} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Prénom</label>
          <input
            className={inputCls}
            placeholder="Marie"
            value={teacherForm.firstName}
            onChange={(e) =>
              setTeacherForm({
                ...teacherForm,
                firstName: e.target.value,
              })
            }
          />
        </div>
        <div>
          <label className={labelCls}>Nom</label>
          <input
            className={inputCls}
            placeholder="Dupont"
            value={teacherForm.lastName}
            onChange={(e) =>
              setTeacherForm({
                ...teacherForm,
                lastName: e.target.value,
              })
            }
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Email *</label>
        <input
          className={inputCls}
          type="email"
          placeholder="prof@tarakid.com"
          required
          value={teacherForm.email}
          onChange={(e) =>
            setTeacherForm({ ...teacherForm, email: e.target.value })
          }
        />
      </div>
      <div>
        <label className={labelCls}>
          {editTeacherId
            ? "Mot de passe (laisser vide pour ne pas changer)"
            : "Mot de passe *"}
        </label>
        <div className="relative">
          <input
            className={`${inputCls} pr-12`}
            type={showPassword ? "text" : "password"}
            placeholder={editTeacherId ? "••••••••" : "••••••••"}
            required={!editTeacherId}
            value={teacherForm.password}
            onChange={(e) =>
              setTeacherForm({ ...teacherForm, password: e.target.value })
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-navy transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={creating}
          className="flex-1 bg-blue hover:bg-deepBlue text-white font-black py-3 rounded-2xl transition-all disabled:opacity-50"
        >
          {creating
            ? editTeacherId
              ? "Mise à jour..."
              : "Création..."
            : editTeacherId
              ? "Mettre à jour"
              : "Créer le compte"}
        </button>
        {editTeacherId && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-2xl transition-all"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
};
