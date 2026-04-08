import React, { useState, useEffect } from "react";
import { Layers, CheckCircle2, AlertCircle, Settings } from "lucide-react";
import {
  adminService,
  type Level,
  type LevelRule,
} from "../../services/admin.service";
import AdminLayout from "./AdminLayout";

// Components
import LevelForm from "../../components/admin/levels/LevelForm";
import LevelRuleForm from "../../components/admin/levels/LevelRuleForm";
import LevelList from "../../components/admin/levels/LevelList";
import LevelRuleList from "../../components/admin/levels/LevelRuleList";

const Message = ({ msg }: { msg: { type: "ok" | "err"; text: string } }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold ${msg.type === "ok" ? "bg-green-50 border border-green-100 text-green-600" : "bg-red-50 border border-red-100 text-red-600"}`}
  >
    {msg.type === "ok" ? (
      <CheckCircle2 className="w-5 h-5 shrink-0" />
    ) : (
      <AlertCircle className="w-5 h-5 shrink-0" />
    )}
    {msg.text}
  </div>
);

type Tab = "levels" | "rules";

const AdminLevels: React.FC = () => {
  const [tab, setTab] = useState<Tab>("levels");
  const [levels, setLevels] = useState<Level[]>([]);
  const [rules, setRules] = useState<LevelRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  // Level Form State
  const [levelForm, setLevelForm] = useState<Omit<Level, "id">>({
    name: "",
    code: "",
    order: 0,
  });
  const [editLevelId, setEditLevelId] = useState<string | null>(null);

  // Rule Form State
  const [ruleForm, setRuleForm] = useState<Partial<LevelRule>>({
    minAge: 0,
    maxAge: 18,
    englishReadingLevels: [],
    englishSpeakingLevels: [],
    operator: "AND",
    targetLevelCode: "L0",
    priority: 0,
  });
  const [ruleEditId, setRuleEditId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lvls, rls] = await Promise.all([
        adminService.getLevels(),
        adminService.getLevelRules(),
      ]);
      setLevels(lvls);
      setRules(rls);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLevelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      if (editLevelId) {
        await adminService.updateLevel(editLevelId, levelForm);
        setMsg({ type: "ok", text: "Niveau mis à jour !" });
      } else {
        await adminService.createLevel(levelForm);
        setMsg({ type: "ok", text: "Niveau créé !" });
      }
      setLevelForm({ name: "", code: "", order: 0 });
      setEditLevelId(null);
      fetchData();
    } catch (err: unknown) {
      setMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Erreur",
      });
    }
  };

  const handleLevelRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      if (ruleEditId) {
        await adminService.updateLevelRule(ruleEditId, ruleForm);
        setMsg({ type: "ok", text: "Règle mise à jour !" });
      } else {
        await adminService.createLevelRule(ruleForm);
        setMsg({ type: "ok", text: "Règle créée !" });
      }
      setRuleForm({
        minAge: 0,
        maxAge: 18,
        englishReadingLevels: [],
        englishSpeakingLevels: [],
        operator: "AND",
        targetLevelCode: "L0",
        priority: 0,
      });
      setRuleEditId(null);
      fetchData();
    } catch {
      setMsg({ type: "err", text: "Erreur lors de l'enregistrement" });
    }
  };

  const handleLevelDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce niveau ?")) return;
    try {
      await adminService.deleteLevel(id);
      setMsg({ type: "ok", text: "Niveau supprimé" });
      fetchData();
    } catch {
      setMsg({ type: "err", text: "Erreur" });
    }
  };

  const handleRuleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette règle ?")) return;
    try {
      await adminService.deleteLevelRule(id);
      setMsg({ type: "ok", text: "Règle supprimée" });
      fetchData();
    } catch {
      setMsg({ type: "err", text: "Erreur" });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-navy">
              Niveaux & Attribution
            </h1>
            <p className="text-sm text-navy/40 font-medium mt-1">
              Gérez les niveaux et les règles de calcul automatique
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => {
              setTab("levels");
              setMsg(null);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === "levels"
                ? "bg-white text-navy shadow-sm"
                : "text-navy/40 hover:text-navy"
            }`}
          >
            <Layers className="w-4 h-4" />
            Niveaux (L0-L5)
          </button>
          <button
            onClick={() => {
              setTab("rules");
              setMsg(null);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === "rules"
                ? "bg-white text-navy shadow-sm"
                : "text-navy/40 hover:text-navy"
            }`}
          >
            <Settings className="w-4 h-4" />
            Règles d'attribution
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List Column (Left) */}
          <div className="lg:col-span-8">
            {tab === "levels" ? (
              <LevelList
                levels={levels}
                loading={loading}
                onEdit={(l) => {
                  setEditLevelId(l.id);
                  setLevelForm({ name: l.name, code: l.code, order: l.order });
                  setMsg(null);
                }}
                onDelete={handleLevelDelete}
              />
            ) : (
              <LevelRuleList
                rules={rules}
                loading={loading}
                onEdit={(r) => {
                  setRuleEditId(r.id);
                  setRuleForm({ ...r });
                  setMsg(null);
                }}
                onDelete={handleRuleDelete}
              />
            )}
          </div>

          {/* Form Column (Right) */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sticky top-6">
              {msg && <Message msg={msg} />}
              <div className={msg ? "mt-4" : ""}>
                {tab === "levels" ? (
                  <LevelForm
                    form={levelForm}
                    editId={editLevelId}
                    onSubmit={handleLevelSubmit}
                    onChange={(updates) =>
                      setLevelForm({ ...levelForm, ...updates })
                    }
                    onCancel={() => {
                      setEditLevelId(null);
                      setLevelForm({ name: "", code: "", order: 0 });
                    }}
                  />
                ) : (
                  <LevelRuleForm
                    form={ruleForm}
                    editId={ruleEditId}
                    onSubmit={handleLevelRuleSubmit}
                    onChange={(updates) =>
                      setRuleForm({ ...ruleForm, ...updates })
                    }
                    onCancel={() => {
                      setRuleEditId(null);
                      setRuleForm({
                        minAge: 0,
                        maxAge: 18,
                        englishReadingLevels: [],
                        englishSpeakingLevels: [],
                        operator: "AND",
                        targetLevelCode: "L0",
                        priority: 0,
                      });
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLevels;
