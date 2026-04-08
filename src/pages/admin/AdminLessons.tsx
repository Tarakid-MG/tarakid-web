import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Layers } from "lucide-react";
import {
  adminService,
  type KidLevel,
  type CreateLessonDto,
  type CreateUnitDto,
  type Unit,
  type Lesson,
} from "../../services/admin.service";
import AdminLayout from "./AdminLayout";

// Refactored Components
import {
  type Tab,
  LEVELS,
  LEVEL_COLORS,
  LEVEL_BG,
  navy,
  blue,
  teal,
} from "../../components/admin/lessons/LessonTypes";
import { LessonForm } from "../../components/admin/lessons/LessonForm";
import { LessonList } from "../../components/admin/lessons/LessonList";
import { UnitManagement } from "../../components/admin/lessons/UnitManagement";
import { AdminSidebar } from "../../components/admin/lessons/AdminSidebar";

// Tab config
const tabs = [
  { id: "create" as Tab, label: "Créer / Modifier", icon: Plus, color: blue },
  { id: "lessons" as Tab, label: "Liste Leçons", icon: Layers, color: teal },
  {
    id: "unit" as Tab,
    label: "Gérer Unités",
    icon: Layers,
    color: "var(--color-orange)",
  },
] as const;

const AdminLessons: React.FC = () => {
  const [tab, setTab] = useState<Tab>("create");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedLevel, setSelectedLevel] = useState<KidLevel>("L0");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const [editLessonId, setEditLessonId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<CreateLessonDto>({
    title: "",
    description: "",
    content: "",
    type: "genially",
    level: "L0",
    unitId: "",
    order: 1,
    thumbnailUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const [unitForm, setUnitForm] = useState<CreateUnitDto>({
    title: "",
    description: "",
    level: "L0",
    order: 1,
  });
  const [unitCreating, setUnitCreating] = useState(false);
  const [unitMsg, setUnitMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [editUnitId, setEditUnitId] = useState<string | null>(null);

  const fetchUnits = useCallback(
    async (level: KidLevel) => {
      setLoadingUnits(true);
      try {
        const data = await adminService.getUnitsByLevel(level);
        setUnits(data);
        if (data.length > 0 && !lessonForm.unitId) {
          setLessonForm((prev) => ({ ...prev, unitId: data[0].id }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUnits(false);
      }
    },
    [lessonForm.unitId],
  );

  useEffect(() => {
    fetchUnits(selectedLevel);
    setLessonForm((prev) => ({ ...prev, level: selectedLevel }));
    setUnitForm((prev) => ({ ...prev, level: selectedLevel }));
  }, [selectedLevel, fetchUnits]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleCreateOrUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.unitId) {
      setCreateMsg({ type: "err", text: "Veuillez sélectionner une unité" });
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    try {
      let lessonId = editLessonId;
      if (editLessonId) {
        await adminService.updateLesson(editLessonId, lessonForm);
      } else {
        const res = (await adminService.createLesson(lessonForm)) as {
          id: string;
        };
        lessonId = res.id;
      }
      if (selectedFile && lessonId) {
        setUploadingThumb(true);
        try {
          const { thumbnailUrl } = await adminService.uploadLessonThumbnail(
            lessonId,
            selectedFile,
          );
          setLessonForm((prev) => ({ ...prev, thumbnailUrl }));
        } catch (uploadErr) {
          console.error("Thumbnail upload failed:", uploadErr);
          setCreateMsg({
            type: "err",
            text: "Leçon enregistrée, mais l'image a échoué.",
          });
        } finally {
          setUploadingThumb(false);
          setSelectedFile(null);
        }
      }
      setCreateMsg({
        type: "ok",
        text: editLessonId
          ? "Leçon mise à jour !"
          : "Leçon créée avec succès !",
      });
      if (!editLessonId) {
        setLessonForm({
          ...lessonForm,
          title: "",
          content: "",
          thumbnailUrl: "",
          order: (lessonForm.order || 1) + 1,
        });
      }
      setEditLessonId(null);
      fetchUnits(selectedLevel);
    } catch (err: unknown) {
      setCreateMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Erreur",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditLesson = (l: Lesson) => {
    setEditLessonId(l.id);
    setLessonForm({
      title: l.title,
      description: l.description || "",
      content: l.content,
      type: l.type,
      level: selectedLevel,
      unitId: l.unitId,
      order: l.order,
      thumbnailUrl: l.thumbnailUrl || "",
    });
    setTab("create");
    setCreateMsg(null);
    setSelectedFile(null);
  };

  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm("Supprimer cette leçon ?")) return;
    try {
      await adminService.deleteLesson(id);
      fetchUnits(selectedLevel);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleCreateOrUpdateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnitCreating(true);
    setUnitMsg(null);
    try {
      if (editUnitId) {
        await adminService.updateUnit(editUnitId, unitForm);
        setUnitMsg({ type: "ok", text: "Unité mise à jour !" });
      } else {
        await adminService.createUnit(unitForm);
        setUnitMsg({ type: "ok", text: "Unité créée avec succès !" });
      }
      setUnitForm({ ...unitForm, title: "", order: (unitForm.order || 1) + 1 });
      setEditUnitId(null);
      fetchUnits(selectedLevel);
    } catch (err: unknown) {
      setUnitMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Erreur",
      });
    } finally {
      setUnitCreating(false);
    }
  };

  const handleEditUnit = (u: Unit) => {
    setEditUnitId(u.id);
    setUnitForm({
      title: u.title,
      description: u.description || "",
      level: u.level,
      order: u.order,
    });
    setUnitMsg(null);
    setTab("unit");
  };

  const handleDeleteUnit = async (id: string) => {
    if (!window.confirm("Supprimer cette unité et toutes ses leçons ?")) return;
    try {
      await adminService.deleteUnit(id);
      fetchUnits(selectedLevel);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const lvlColor = LEVEL_COLORS[selectedLevel] ?? blue;
  const lvlBg = LEVEL_BG[selectedLevel] ?? "rgba(33,158,188,0.1)";
  const totalLessons = units.reduce(
    (acc, u) => acc + (u.lessons?.length || 0),
    0,
  );

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 p-8 pb-20">
        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl font-black" style={{ color: navy }}>
              Contenu{" "}
              <span className="italic" style={{ color: blue }}>
                Pédagogique
              </span>
            </h1>
            <p className="text-sm font-medium mt-1.5 text-slate-400">
              Gérez les niveaux, unités et leçons de TaraKid
            </p>
          </div>

          {/* Level selector */}
          <div
            className="flex gap-1 p-1 rounded-2xl"
            style={{ background: "#f1f5f9" }}
          >
            {LEVELS.map((l) => {
              const active = selectedLevel === l;
              const color = LEVEL_COLORS[l];
              return (
                <button
                  key={l}
                  onClick={() => setSelectedLevel(l)}
                  className="px-4 py-2 rounded-xl text-xs font-black transition-all"
                  style={
                    active
                      ? {
                          background: color,
                          color: "white",
                          boxShadow: `0 4px 12px ${color}40`,
                        }
                      : { background: "transparent", color: "#94a3b8" }
                  }
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div
          className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl"
          style={{ background: "#f1f5f9" }}
        >
          {tabs.map(({ id, label, icon: Icon, color }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={
                  active
                    ? {
                        background: navy,
                        color: "white",
                        boxShadow: "0 4px 14px rgba(32,42,68,0.2)",
                      }
                    : { color: "#94a3b8", background: "transparent" }
                }
              >
                <Icon className="w-4 h-4" style={active ? {} : { color }} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Main Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Main content panel ─────────────────────────────────────── */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Panel header */}
              <div
                className="px-8 py-5 border-b border-slate-100 flex items-center justify-between"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(32,42,68,0.02), rgba(33,158,188,0.03))",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: lvlBg }}
                  >
                    <span
                      className="text-xs font-black"
                      style={{ color: lvlColor }}
                    >
                      {selectedLevel}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-sm font-black" style={{ color: navy }}>
                      {tab === "create" &&
                        (editLessonId ? "Modifier la leçon" : `Nouvelle leçon`)}
                      {tab === "lessons" && "Liste des Leçons"}
                      {tab === "unit" &&
                        (editUnitId ? "Modifier l'Unité" : "Gérer les Unités")}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                      Niveau {selectedLevel}
                    </p>
                  </div>
                </div>
                {tab === "create" && editLessonId && (
                  <button
                    onClick={() => {
                      setEditLessonId(null);
                      setLessonForm({
                        title: "",
                        description: "",
                        content: "",
                        type: "genially",
                        level: selectedLevel,
                        unitId: units[0]?.id || "",
                        order: lessonForm.order || 1,
                      });
                    }}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                    style={{
                      color: "#ef4444",
                      background: "rgba(239,68,68,0.08)",
                    }}
                  >
                    Annuler la modification
                  </button>
                )}
              </div>

              <div className="p-8">
                {/* ── CREATE / EDIT LESSON ─────────────────────────────── */}
                {tab === "create" && (
                  <LessonForm
                    lessonForm={lessonForm}
                    setLessonForm={setLessonForm}
                    units={units}
                    loadingUnits={loadingUnits}
                    creating={creating}
                    uploadingThumb={uploadingThumb}
                    editLessonId={editLessonId}
                    selectedFile={selectedFile}
                    fileInputRef={fileInputRef}
                    onFileChange={handleFileChange}
                    onSubmit={handleCreateOrUpdateLesson}
                    message={createMsg}
                    lvlColor={lvlColor}
                    lvlBg={lvlBg}
                  />
                )}

                {/* ── LIST LESSONS ─────────────────────────────────────── */}
                {tab === "lessons" && (
                  <LessonList
                    units={units}
                    onEdit={handleEditLesson}
                    onDelete={handleDeleteLesson}
                    lvlColor={lvlColor}
                    lvlBg={lvlBg}
                  />
                )}

                {/* ── MANAGE UNITS ─────────────────────────────────────── */}
                {tab === "unit" && (
                  <UnitManagement
                    unitForm={unitForm}
                    setUnitForm={setUnitForm}
                    units={units}
                    unitCreating={unitCreating}
                    editUnitId={editUnitId}
                    onSave={handleCreateOrUpdateUnit}
                    onEdit={handleEditUnit}
                    onDelete={handleDeleteUnit}
                    onCancel={() => {
                      setEditUnitId(null);
                      setUnitForm({
                        title: "",
                        description: "",
                        level: selectedLevel,
                        order: unitForm.order || 1,
                      });
                    }}
                    message={unitMsg}
                    selectedLevel={selectedLevel}
                    lvlColor={lvlColor}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Side panel ─────────────────────────────────────────────── */}
          <AdminSidebar
            units={units}
            totalLessons={totalLessons}
            selectedLevel={selectedLevel}
            lvlColor={lvlColor}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLessons;
