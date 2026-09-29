import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Globe2,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  PenLine,
  Phone,
  Save,
  Sparkles,
  UserRound,
} from "lucide-react";
import { TeacherLayout } from "../components/layout/TeacherLayout";
import { useAuth } from "../context/AuthContextDefinition";
import {
  userService,
  type UpdateTeacherProfileDto,
} from "../services/user.service";

const splitList = (value?: string[]) => (value || []).join(", ");
const parseList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const defaultLanguages = [
  { name: "Français", level: "Natif" },
  { name: "Anglais", level: "Courant" },
];

const TeacherProfile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<UpdateTeacherProfileDto>({});
  const [specialtiesText, setSpecialtiesText] = useState("");
  const [certificationsText, setCertificationsText] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      about: user.about || "",
      experienceYears: user.experienceYears || 0,
      languages: user.languages?.length ? user.languages : defaultLanguages,
      specialties: user.specialties || [],
      teachingStyle: user.teachingStyle || "",
      education: user.education || "",
      certifications: user.certifications || [],
    });
    setSpecialtiesText(splitList(user.specialties));
    setCertificationsText(splitList(user.certifications));
  }, [user]);

  const displayName = useMemo(
    () =>
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      "Profil professeur",
    [user],
  );

  const handleLanguageChange = (
    index: number,
    key: "name" | "level",
    value: string,
  ) => {
    setForm((prev) => {
      const languages = [...(prev.languages || defaultLanguages)];
      languages[index] = { ...languages[index], [key]: value };
      return { ...prev, languages };
    });
  };

  const addLanguage = () => {
    setForm((prev) => ({
      ...prev,
      languages: [...(prev.languages || []), { name: "", level: "" }],
    }));
  };

  const removeLanguage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      languages: (prev.languages || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await userService.updateProfile({
        ...form,
        experienceYears: Number(form.experienceYears || 0),
        languages: (form.languages || []).filter(
          (language) => language.name.trim() && language.level.trim(),
        ),
        specialties: parseList(specialtiesText),
        certifications: parseList(certificationsText),
      });
      await refreshProfile();
      setEditing(false);
      setMessage("Profil mis à jour avec succès.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur de sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-blue/10" />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-24 w-24 rounded-[2rem] bg-blue text-white flex items-center justify-center shadow-[0_10px_30px_rgba(33,158,188,0.25)]">
                <UserRound className="w-12 h-12" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue mb-2">
                  Profil enseignant
                </p>
                <h1 className="text-3xl md:text-4xl font-black text-navy">
                  {displayName}
                </h1>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                    <Mail className="w-4 h-4 text-blue" />
                    {user?.email}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/20 px-3 py-2">
                    <Award className="w-4 h-4 text-gold" />
                    {form.experienceYears || 0} ans d'expérience
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => (editing ? handleSave() : setEditing(true))}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue text-white px-5 py-3 font-black text-sm hover:bg-deepBlue disabled:opacity-60 transition-colors"
            >
              {editing ? <Save className="w-4 h-4" /> : <PenLine className="w-4 h-4" />}
              {saving ? "Sauvegarde..." : editing ? "Enregistrer" : "Modifier"}
            </button>
          </div>
          {message && (
            <div className="relative mt-5 rounded-2xl bg-teal/10 border border-teal/20 px-4 py-3 text-sm font-bold text-teal flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {message}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
            <SectionHeader icon={<BookOpen className="w-5 h-5" />} title="À propos" />
            {editing ? (
              <textarea
                value={form.about || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, about: e.target.value }))}
                rows={7}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue focus:bg-white resize-none"
                placeholder="Présentez votre parcours, votre approche et ce qui rend vos cours uniques."
              />
            ) : (
              <p className="text-sm md:text-base leading-8 text-slate-600 font-medium">
                {user?.about ||
                  "Ajoutez une présentation pour aider les parents à mieux vous connaître."}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoBlock
                icon={<GraduationCap className="w-5 h-5" />}
                label="Formation"
                editing={editing}
                value={form.education || ""}
                onChange={(value) => setForm((prev) => ({ ...prev, education: value }))}
                placeholder="Diplôme, école, certification..."
              />
              <InfoBlock
                icon={<Sparkles className="w-5 h-5" />}
                label="Style pédagogique"
                editing={editing}
                value={form.teachingStyle || ""}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, teachingStyle: value }))
                }
                placeholder="Ludique, conversationnel, structuré..."
              />
            </div>
          </section>

          <aside className="xl:col-span-5 space-y-6">
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <SectionHeader icon={<Globe2 className="w-5 h-5" />} title="Langues parlées" />
              <div className="space-y-3">
                {(form.languages || []).map((language, index) => (
                  <div key={index} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    {editing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          value={language.name}
                          onChange={(e) =>
                            handleLanguageChange(index, "name", e.target.value)
                          }
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-blue"
                          placeholder="Langue"
                        />
                        <input
                          value={language.level}
                          onChange={(e) =>
                            handleLanguageChange(index, "level", e.target.value)
                          }
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-blue"
                          placeholder="Niveau"
                        />
                        <button
                          onClick={() => removeLanguage(index)}
                          className="sm:col-span-2 text-left text-xs font-black text-red-500"
                        >
                          Supprimer
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-black text-navy">{language.name}</span>
                        <span className="text-xs font-black uppercase tracking-widest text-blue bg-blue/10 px-3 py-1.5 rounded-xl">
                          {language.level}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {editing && (
                  <button
                    onClick={addLanguage}
                    className="w-full rounded-2xl border border-dashed border-blue/30 bg-blue/5 py-3 text-sm font-black text-blue"
                  >
                    Ajouter une langue
                  </button>
                )}
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <SectionHeader icon={<Languages className="w-5 h-5" />} title="Informations" />
              <div className="space-y-4">
                <InfoBlock
                  icon={<Phone className="w-5 h-5" />}
                  label="Téléphone"
                  editing={editing}
                  value={form.phoneNumber || ""}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, phoneNumber: value }))
                  }
                  placeholder="+261..."
                />
                <InfoBlock
                  icon={<MapPin className="w-5 h-5" />}
                  label="Adresse"
                  editing={editing}
                  value={form.address || ""}
                  onChange={(value) => setForm((prev) => ({ ...prev, address: value }))}
                  placeholder="Ville, pays"
                />
                {editing && (
                  <InfoBlock
                    icon={<Award className="w-5 h-5" />}
                    label="Années d'expérience"
                    editing={editing}
                    value={String(form.experienceYears || 0)}
                    type="number"
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        experienceYears: Number(value || 0),
                      }))
                    }
                  />
                )}
              </div>
            </section>
          </aside>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ListEditor
            title="Spécialités"
            description="Séparez les spécialités par des virgules."
            value={specialtiesText}
            items={form.specialties || []}
            editing={editing}
            icon={<Sparkles className="w-5 h-5" />}
            onChange={setSpecialtiesText}
          />
          <ListEditor
            title="Certifications"
            description="Séparez les certifications par des virgules."
            value={certificationsText}
            items={form.certifications || []}
            editing={editing}
            icon={<Award className="w-5 h-5" />}
            onChange={setCertificationsText}
          />
        </div>
      </div>
    </TeacherLayout>
  );
};

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-2xl bg-blue/10 text-blue flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-lg font-black text-navy">{title}</h2>
    </div>
  );
}

function InfoBlock({
  icon,
  label,
  value,
  editing,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
      <div className="flex items-center gap-2 text-blue mb-2">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-blue"
        />
      ) : (
        <p className="text-sm font-bold text-navy">{value || "Non renseigné"}</p>
      )}
    </div>
  );
}

function ListEditor({
  title,
  description,
  value,
  items,
  editing,
  icon,
  onChange,
}: {
  title: string;
  description: string;
  value: string;
  items: string[];
  editing: boolean;
  icon: React.ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <SectionHeader icon={icon} title={title} />
      {editing ? (
        <>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue focus:bg-white"
            placeholder={description}
          />
          <p className="text-xs font-bold text-slate-400 mt-2">{description}</p>
        </>
      ) : items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-2xl bg-blue/10 border border-blue/15 px-3 py-2 text-xs font-black text-blue"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm font-medium text-slate-400">Non renseigné</p>
      )}
    </section>
  );
}

export default TeacherProfile;
