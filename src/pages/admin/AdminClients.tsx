import React, { useState, useEffect, useCallback } from "react";
import { Users, Search } from "lucide-react";
import { adminService } from "../../services/admin.service";
import AdminLayout from "./AdminLayout";
import { ClientList } from "../../components/admin/clients/ClientList";
import { ClientDetails } from "../../components/admin/clients/ClientDetails";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { type User } from "../../types/auth";

const AdminClients: React.FC = () => {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getClients();
      setClients(data);
    } catch {
      console.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleConfirmToggleStatus = async () => {
    if (!toggleTarget) return;
    setTogglingStatus(true);
    setStatusError(null);
    try {
      if (toggleTarget.isActive) {
        await adminService.deactivateClient(toggleTarget.id);
      } else {
        await adminService.reactivateClient(toggleTarget.id);
      }
      await fetchClients();
      setToggleTarget(null);
    } catch {
      setStatusError("Erreur lors de la mise à jour du statut");
    } finally {
      setTogglingStatus(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const search = searchTerm.toLowerCase();
    return (
      c.firstName?.toLowerCase().includes(search) ||
      c.lastName?.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search)
    );
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-navy leading-none">
              Gestion des Clients
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
              Suivi des parents, enfants et activité en temps réel
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-blue/5 px-4 py-2 rounded-2xl border border-blue/10 flex items-center gap-3">
              <Users className="w-5 h-5 text-blue" />
              <span className="text-sm font-black text-navy">
                {clients.length} Parents
              </span>
            </div>
            <div className="bg-amber/5 px-4 py-2 rounded-2xl border border-amber/10 flex items-center gap-3">
              <span className="text-xs font-black text-amber uppercase tracking-widest">
                En ligne
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue transition-colors" />
            <input
              type="text"
              placeholder="Rechercher un parent par nom, prénom ou email..."
              className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-navy focus:ring-2 focus:ring-blue/20 transition-all placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">
              Filtrer par rôle
            </span>
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button className="px-5 py-2 rounded-xl bg-white shadow-sm text-xs font-black text-navy">
                Tous
              </button>
              <button className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-navy transition-colors">
                Client
              </button>
            </div>
          </div>
        </div>

        {/* Client List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-blue/20 border-t-blue rounded-full animate-spin" />
              <p className="text-sm font-black text-slate-300 uppercase tracking-widest">
                Récupération des données...
              </p>
            </div>
          ) : (
            <ClientList
              clients={filteredClients}
              loading={loading}
              onViewDetails={(c) => setSelectedClient(c)}
              onToggleStatus={(c) => {
                setStatusError(null);
                setToggleTarget(c);
              }}
            />
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedClient && (
        <ClientDetails
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onRefresh={fetchClients}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(toggleTarget)}
        title={
          toggleTarget?.isActive
            ? "Désactiver ce compte parent ?"
            : "Réactiver ce compte parent ?"
        }
        message={
          statusError ||
          (toggleTarget?.isActive
            ? "Ce parent ne pourra plus se connecter tant que son compte n'est pas réactivé."
            : "Ce parent pourra de nouveau se connecter et réserver des cours.")
        }
        variant={toggleTarget?.isActive ? "danger" : "info"}
        confirmLabel={toggleTarget?.isActive ? "Désactiver" : "Réactiver"}
        loading={togglingStatus}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setToggleTarget(null)}
      />
    </AdminLayout>
  );
};

export default AdminClients;
