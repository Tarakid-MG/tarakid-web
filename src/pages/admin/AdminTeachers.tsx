import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, Users } from "lucide-react";
import { adminService } from "../../services/admin.service";
import AdminLayout from "./AdminLayout";

// Refactored Components
import {
  type Tab,
  type User,
  type CreateTeacherDto,
  navy,
  blue,
} from "../../components/admin/teachers/TeacherTypes";
import { TeacherForm } from "../../components/admin/teachers/TeacherForm";
import { TeacherList } from "../../components/admin/teachers/TeacherList";
import { TeacherScheduleView } from "../../components/admin/teachers/TeacherScheduleView";

const tabs = [
  { id: "create" as Tab, label: "Créer un prof", icon: UserPlus },
  { id: "list" as Tab, label: "Liste des Profs", icon: Users },
] as const;

const AdminTeachers: React.FC = () => {
  const [tab, setTab] = useState<Tab>("create");

  // Teachers list state
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeacherForSchedule, setSelectedTeacherForSchedule] =
    useState<User | null>(null);

  // Form state
  const [teacherForm, setTeacherForm] = useState<CreateTeacherDto>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [creating, setCreating] = useState(false);
  const [editTeacherId, setEditTeacherId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getTeachers();
      setTeachers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "list") {
      fetchTeachers();
    }
  }, [tab, fetchTeachers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      if (editTeacherId) {
        await adminService.updateTeacher(editTeacherId, teacherForm);
        setMessage({ type: "ok", text: "Professeur mis à jour !" });
      } else {
        await adminService.createTeacher(teacherForm);
        setMessage({ type: "ok", text: "Professeur créé avec succès !" });
      }

      if (!editTeacherId) {
        setTeacherForm({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
        });
      }

      // Refresh list if we are editing
      if (editTeacherId) {
        await fetchTeachers();
        setEditTeacherId(null);
        setTeacherForm({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
        });
        setTab("list");
      }
    } catch (err: unknown) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Erreur",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (t: User) => {
    setEditTeacherId(t.id);
    setTeacherForm({
      email: t.email,
      password: "", // Don't show password
      firstName: t.firstName || "",
      lastName: t.lastName || "",
    });
    setTab("create");
    setMessage(null);
  };

  const handleToggleStatus = async (t: User) => {
    if (
      !window.confirm(
        `${t.isActive ? "Désactiver" : "Réactiver"} ce professeur ?`,
      )
    )
      return;
    try {
      if (t.isActive) {
        await adminService.deactivateTeacher(t.id);
      } else {
        await adminService.reactivateTeacher(t.id);
      }
      await fetchTeachers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleCancelEdit = () => {
    setEditTeacherId(null);
    setTeacherForm({ email: "", password: "", firstName: "", lastName: "" });
    setTab("list");
    setMessage(null);
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: navy }}>
            Professeurs
          </h1>
          <p className="text-sm font-medium mt-1 text-slate-400">
            Gestion des comptes professeurs TaraKid
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? "bg-white shadow-sm"
                    : "text-slate-400 hover:text-navy"
                }`}
                style={active ? { color: navy } : {}}
              >
                <Icon
                  className="w-4 h-4"
                  style={active ? { color: blue } : {}}
                />
                {label}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          {tab === "create" ? (
            <TeacherForm
              teacherForm={teacherForm}
              setTeacherForm={setTeacherForm}
              creating={creating}
              editTeacherId={editTeacherId}
              message={message}
              onSubmit={handleSubmit}
              onCancel={handleCancelEdit}
            />
          ) : (
            <TeacherList
              teachers={teachers}
              loading={loading}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onViewSchedule={(t) => setSelectedTeacherForSchedule(t)}
            />
          )}
        </div>
      </div>

      {/* Teacher Schedule Modal */}
      {selectedTeacherForSchedule && (
        <TeacherScheduleView
          teacher={{
            id: selectedTeacherForSchedule.id,
            firstName: selectedTeacherForSchedule.firstName || "",
            lastName: selectedTeacherForSchedule.lastName || "",
          }}
          onClose={() => setSelectedTeacherForSchedule(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminTeachers;
