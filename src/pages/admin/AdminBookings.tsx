import React, { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Search,
  UserCheck,
  RefreshCw,
  Eye,
  Star,
} from "lucide-react";
import {
  adminService,
  type BookedSlot,
  type AssignedBooking,
  type BookingDetails,
  type HistoryBooking,
} from "../../services/admin.service";
import { type User } from "../../types/auth";
import AdminLayout from "./AdminLayout";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

type Tab = "regular" | "trial" | "assigned" | "history";

// ─── Assign Teacher Modal ─────────────────────────────────────────────────────
interface AssignModalProps {
  slot: BookedSlot;
  onClose: () => void;
  onAssigned: () => void;
}

const AssignModal: React.FC<AssignModalProps> = ({
  slot,
  onClose,
  onAssigned,
}) => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getAvailableTeachersForSlot(slot.date, slot.time)
      .then(setTeachers)
      .catch(() => setError("Impossible de charger les professeurs"))
      .finally(() => setLoading(false));
  }, [slot]);

  const handleAssign = async (teacherId: number) => {
    setAssigning(teacherId);
    setError("");
    try {
      await adminService.assignTeacher(String(slot.id), slot.type, teacherId);
      onAssigned();
    } catch {
      setError("Erreur lors de l'assignation");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-black text-navy">
              Assigner un professeur
            </h3>
            <p className="text-sm text-navy/50 font-medium">
              {slot.date} à {slot.time} · {slot.type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-navy/30 hover:text-navy transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-xl text-sm font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-10 text-navy/30">
            <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-bold text-sm">Aucun professeur disponible</p>
          </div>
        ) : (
          <div className="space-y-2">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="font-bold text-navy text-sm">
                    {t.firstName} {t.lastName}
                  </p>
                  <p className="text-xs text-navy/40">{t.email}</p>
                </div>
                <button
                  onClick={() => handleAssign(t.id)}
                  disabled={assigning === t.id}
                  className="bg-blue text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-deepBlue transition-colors disabled:opacity-50"
                >
                  {assigning === t.id ? "..." : "Assigner"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Booking Details Modal ────────────────────────────────────────────────────
interface BookingDetailsModalProps {
  bookingId: string;
  onClose: () => void;
  onRefresh: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  bookingId,
  onClose,
  onRefresh,
}) => {
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [assigningAll, setAssigningAll] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    adminService
      .getBookingDetails(bookingId)
      .then(setDetails)
      .catch(() => setError("Impossible de charger les détails"))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const loadTeachers = async () => {
    if (teachers.length > 0) return;
    setLoadingTeachers(true);
    try {
      const data = await adminService.getTeachers();
      setTeachers(data);
    } catch {
      setError("Impossible de charger les professeurs");
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleAssignAll = async (teacherId: number) => {
    if (!details?.kid?.id) return;
    setAssigningAll(teacherId);
    try {
      await adminService.reassignKidBookings(details.kid.id, teacherId, true);
      onRefresh();
      onClose();
    } catch {
      setError("Erreur lors de l'assignation groupée");
    } finally {
      setAssigningAll(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 relative">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-black text-navy border-b border-slate-100 pb-2 w-full">
            Détails de la réservation
          </h3>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-navy/30 hover:text-navy transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-xl text-sm font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue" />
          </div>
        ) : details ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-1">
                  Enfant
                </p>
                <p className="font-semibold text-navy text-lg">
                  {details.kid?.name || "Inconnu"}
                </p>
                {details.kid && (
                  <div className="mt-2 text-sm text-navy/60 space-y-1">
                    <p>
                      Âge:{" "}
                      <span className="font-medium text-navy">
                        {details.kid.age} ans
                      </span>
                    </p>
                    <p>
                      Niveau:{" "}
                      <span className="font-medium text-navy">
                        {details.kid.level || "Non défini"}
                      </span>
                    </p>
                    <p>
                      Lecture (Ang):{" "}
                      <span className="font-medium text-navy">
                        {details.kid.englishReadingLevel || "Non défini"}
                      </span>
                    </p>
                    <p>
                      Oral (Ang):{" "}
                      <span className="font-medium text-navy">
                        {details.kid.englishSpeakingLevel || "Non défini"}
                      </span>
                    </p>
                    {details.kid.assignedTeacher && (
                      <p className="mt-2 pt-2 border-t border-slate-100">
                        Professeur Assigné:{" "}
                        <span className="font-bold text-blue">
                          {details.kid.assignedTeacher.firstName}{" "}
                          {details.kid.assignedTeacher.lastName}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-1">
                  Parent
                </p>
                {details.parent ? (
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-navy text-base">
                      {details.parent.firstName || ""}{" "}
                      {details.parent.lastName || ""}
                    </p>
                    <p className="text-navy/60">{details.parent.email}</p>
                    {details.parent.phoneNumber && (
                      <p className="text-navy/60">
                        {details.parent.phoneNumber}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-navy/60 font-medium">Non assigné</p>
                )}
              </div>
            </div>

            {details?.type === "REGULAR" &&
              details?.upcomingSessions &&
              details?.upcomingSessions.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-3">
                    Toutes les séances réservées
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {details?.upcomingSessions.map((s) => (
                      <div
                        key={String(s.id)}
                        className="flex items-center justify-between text-sm bg-white p-2 rounded-xl border border-slate-100"
                      >
                        <div>
                          <span className="font-bold text-navy">{s.date}</span>
                          <span className="ml-2 text-navy/40 font-bold">
                            {s.time}
                          </span>
                        </div>
                        <div>
                          {s.teacherId ? (
                            <span className="text-[10px] font-black text-blue uppercase bg-blue/5 px-2 py-0.5 rounded-lg border border-blue/10">
                              Assigné
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-orange uppercase bg-orange/5 px-2 py-0.5 rounded-lg border border-orange/10">
                              En attente
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {details?.type === "REGULAR" && details?.subscription && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-2">
                  Plan de l'abonnement
                </p>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-navy text-base">
                      {details.subscription.planName}
                    </p>
                    <p className="text-sm text-navy/60">
                      {details.subscription.frequency} fois par semaine
                    </p>
                    <p className="text-xs text-navy/40 mt-1">
                      Durée: {details.subscription.commitmentType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-navy/60">
                      Du{" "}
                      {new Date(
                        details.subscription.startDate,
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-medium text-navy/60">
                      Au{" "}
                      {new Date(
                        details.subscription.endDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-blue/5 p-4 rounded-2xl border border-blue/10">
              <p className="text-xs font-bold text-blue/60 uppercase tracking-wider mb-1">
                Session
              </p>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="font-bold text-navy">
                    {details?.date || "Date non définie"}
                  </p>
                  <p className="text-sm text-navy/60">
                    {details?.time || "Heure non définie"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold tracking-wider bg-orange/10 text-orange px-2 py-1 rounded-lg uppercase">
                    {details?.type}
                  </p>
                  <p className="text-xs font-bold tracking-wider bg-slate-200 text-slate-600 px-2 py-1 rounded-lg uppercase mt-1 inline-block">
                    {details?.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Bulk Assignment Toggle */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={loadTeachers}
                className="w-full bg-navy text-white font-bold py-3 rounded-2xl hover:bg-navy/90 transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-5 h-5" />
                Assigner tous les cours de cet enfant à un professeur
              </button>

              {loadingTeachers && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue" />
                </div>
              )}

              {!loadingTeachers && teachers.length > 0 && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {teachers.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-navy text-sm">
                          {t.firstName} {t.lastName}
                        </p>
                        <p className="text-xs text-navy/40">{t.email}</p>
                      </div>
                      <button
                        onClick={() => handleAssignAll(t.id)}
                        disabled={assigningAll === t.id}
                        className="bg-blue text-white text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-deepBlue transition-colors disabled:opacity-50"
                      >
                        {assigningAll === t.id ? "Assignation..." : "Choisir"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminBookings: React.FC = () => {
  const [tab, setTab] = useState<Tab>("regular");
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [assigned, setAssigned] = useState<AssignedBooking[]>([]);
  const [history, setHistory] = useState<HistoryBooking[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<BookedSlot | null>(null);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchTeacherId, setBatchTeacherId] = useState("");
  const [batchAssigning, setBatchAssigning] = useState(false);
  const [subTab, setSubTab] = useState<"regular" | "trial">("regular");
  const [detailsBookingId, setDetailsBookingId] = useState<string | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<
    { id: string | number; type?: string } | null
  >(null);
  const [unassigning, setUnassigning] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [slots, assignedData, historyData, teachersData] =
        await Promise.all([
          adminService.getBookedSlots(),
          adminService.getAssignedBookings(),
          adminService.getBookingHistory(),
          adminService.getTeachers(),
        ]);
      setBookedSlots(slots);
      setAssigned(assignedData);
      setHistory(historyData);
      setTeachers(teachersData);
    } catch {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const assignedIds = new Set(assigned.map((a) => String(a.id)));

  // --- Filtering & Grouping ---

  const pendingRegular = bookedSlots.filter(
    (s) => s.type === "REGULAR" && !assignedIds.has(String(s.id)),
  );

  const pendingTrial = bookedSlots.filter(
    (s) => s.type === "FREE_TRIAL" && !assignedIds.has(String(s.id)),
  );

  const assignedRegular = assigned.filter((a) => a.type === "REGULAR");
  const assignedTrial = assigned.filter((a) => a.type === "FREE_TRIAL");

  const historyRegular = history.filter(
    (h: HistoryBooking) => h.type?.toUpperCase() === "REGULAR",
  );
  const historyTrial = history.filter(
    (h: HistoryBooking) => h.type?.toUpperCase() === "FREE_TRIAL",
  );

  interface AdminBookingView {
    id: string | number;
    type?: string;
    date?: string;
    time?: string;
    sessionDate?: string;
    startTime?: string;
    kidName?: string;
    kidId?: string | number;
    userId?: string | number;
    kid?: { id?: number; name: string; age?: number };
    teacher?: { firstName?: string; lastName?: string };
    status?: string;
    bookingType?: string;
    planName?: string;
  }

  interface GroupedBooking {
    kidId: string;
    kidName: string;
    planName: string;
    slots: AdminBookingView[];
  }

  const groupBookings = (
    list: AdminBookingView[],
  ): Record<string, GroupedBooking> => {
    return list.reduce(
      (acc, slot) => {
        const kidId = slot.kidId || slot.kid?.id || "unknown";
        if (!acc[kidId]) {
          acc[kidId] = {
            kidId: String(kidId),
            kidName: slot.kidName || slot.kid?.name || "Inconnu",
            planName: slot.planName || "Régulier",
            slots: [],
          };
        }
        acc[kidId].slots.push(slot);
        return acc;
      },
      {} as Record<string, GroupedBooking>,
    );
  };

  const groupedRegular = groupBookings(pendingRegular);
  const groupedAssignedRegular = groupBookings(assignedRegular);
  const groupedHistoryRegular = groupBookings(historyRegular);

  const filterGroups = (
    groups: Record<string, GroupedBooking>,
  ): GroupedBooking[] =>
    Object.values(groups).filter(
      (g) =>
        g.kidName.toLowerCase().includes(search.toLowerCase()) ||
        g.planName.toLowerCase().includes(search.toLowerCase()),
    );

  const filteredGroupedRegular = filterGroups(groupedRegular);
  const filteredGroupedAssignedRegular = filterGroups(groupedAssignedRegular);
  const filteredGroupedHistoryRegular = filterGroups(groupedHistoryRegular);

  const filterTrial = (list: AdminBookingView[]) =>
    list.filter((view) => {
      return (
        (view.kidName || view.kid?.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (view.date || view.sessionDate || "").includes(search)
      );
    });

  const filteredPendingTrial = filterTrial(pendingTrial);
  const filteredAssignedTrial = filterTrial(assignedTrial);
  const filteredHistoryTrial = filterTrial(historyTrial);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBatchAssign = async () => {
    if (!batchTeacherId || selectedIds.size === 0) return;
    setBatchAssigning(true);
    try {
      const type = tab === "trial" ? "FREE_TRIAL" : "REGULAR";
      await adminService.batchAssign(
        Array.from(selectedIds),
        type,
        Number(batchTeacherId),
      );
      setSelectedIds(new Set());
      setBatchTeacherId("");
      await fetchData();
    } catch {
      setError("Erreur lors de l'assignation groupée");
    } finally {
      setBatchAssigning(false);
    }
  };

  const handleUnassign = (id: string | number, type?: string) => {
    if (!type) {
      setError("Type de réservation manquant pour la désassignation");
      return;
    }
    setUnassignTarget({ id, type });
  };

  const handleConfirmUnassign = async () => {
    if (!unassignTarget?.type) return;
    setUnassigning(true);
    try {
      await adminService.unassignTeacher(
        String(unassignTarget.id),
        unassignTarget.type.toUpperCase(),
      );
      await fetchData();
      setUnassignTarget(null);
    } catch {
      setError("Erreur lors de la désassignation");
    } finally {
      setUnassigning(false);
    }
  };

  const statusColor: Record<string, string> = {
    SCHEDULED: "bg-blue/10 text-blue",
    CONFIRMED: "bg-green-100 text-green-600",
    COMPLETED: "bg-slate-100 text-slate-500",
    CANCELLED: "bg-red-100 text-red-500",
    MISSED: "bg-orange/10 text-orange",
    ABSENT: "bg-yellow/10 text-yellow-700",
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-navy">Réservations</h1>
            <p className="text-sm text-navy/40 font-medium mt-1">
              Gérez et assignez les créneaux aux professeurs
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-bold text-navy/40 hover:text-blue transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
          {(
            [
              {
                id: "regular",
                label: "Régulier",
                icon: Clock,
                count: pendingRegular.length,
              },
              {
                id: "trial",
                label: "Essai Gratuit",
                icon: Star,
                count: pendingTrial.length,
              },
              {
                id: "assigned",
                label: "Assignés",
                icon: CheckCircle2,
                count: assigned.length,
              },
              {
                id: "history",
                label: "Historique",
                icon: RefreshCw,
                count: history.length,
              },
            ] as const
          ).map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === id
                  ? "bg-white text-navy shadow-sm"
                  : "text-navy/40 hover:text-navy"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  tab === id ? "bg-blue text-white" : "bg-navy/10 text-navy/50"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sub-tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/30" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 bg-white rounded-xl pl-9 pr-4 py-2 text-sm font-medium text-navy focus:outline-none focus:border-blue/50 transition-colors"
            />
          </div>

          {(tab === "assigned" || tab === "history") && (
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setSubTab("regular")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  subTab === "regular"
                    ? "bg-white text-navy shadow-sm"
                    : "text-navy/40 hover:text-navy"
                }`}
              >
                Régulier
                <span className="text-[10px] opacity-40">
                  (
                  {tab === "assigned"
                    ? assignedRegular.length
                    : historyRegular.length}
                  )
                </span>
              </button>
              <button
                onClick={() => setSubTab("trial")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  subTab === "trial"
                    ? "bg-white text-navy shadow-sm"
                    : "text-navy/40 hover:text-navy"
                }`}
              >
                Essai Gratuit
                <span className="text-[10px] opacity-40">
                  (
                  {tab === "assigned"
                    ? assignedTrial.length
                    : historyTrial.length}
                  )
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Batch assign bar */}
        {(tab === "regular" || tab === "trial") && selectedIds.size > 0 && (
          <div className="bg-blue/5 border border-blue/20 rounded-2xl px-4 py-3 flex items-center gap-4 flex-wrap">
            <span className="text-sm font-bold text-blue">
              {selectedIds.size} sélectionné(s)
            </span>
            <select
              value={batchTeacherId}
              onChange={(e) => setBatchTeacherId(e.target.value)}
              className="border border-blue/20 bg-white rounded-xl px-3 py-1.5 text-sm font-medium text-navy focus:outline-none"
            >
              <option value="">Sélectionner un professeur</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
            <button
              onClick={handleBatchAssign}
              disabled={!batchTeacherId || batchAssigning}
              className="bg-blue text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-deepBlue transition-colors disabled:opacity-50"
            >
              {batchAssigning ? "Assignation..." : "Assigner Tout"}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-navy/30 hover:text-navy transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Table Content */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue" />
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100">
                <tr>
                  {(tab === "regular" || tab === "trial") && (
                    <th className="px-4 py-3 w-10" />
                  )}
                  {((tab === "regular" ||
                    tab === "assigned" ||
                    tab === "history") &&
                    subTab === "regular") ||
                  tab === "regular" ? (
                    <>
                      <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                        Enfant
                      </th>
                      <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                        Plan
                      </th>
                      <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                        Séances
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                        Date / Heure
                      </th>
                      <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                        Enfant
                      </th>
                    </>
                  )}
                  {(tab === "assigned" || tab === "history") && (
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Professeur
                    </th>
                  )}
                  {tab === "history" && (
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Statut
                    </th>
                  )}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {/* Regular Unassigned Section */}
                {tab === "regular" &&
                  (filteredGroupedRegular.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-16 text-navy/30"
                      >
                        Aucun abonnement en attente
                      </td>
                    </tr>
                  ) : (
                    filteredGroupedRegular.map((g: GroupedBooking) => (
                      <tr
                        key={g.kidId}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={g.slots.every((s: AdminBookingView) =>
                              selectedIds.has(String(s.id)),
                            )}
                            onChange={() => {
                              const allSel = g.slots.every(
                                (s: AdminBookingView) =>
                                  selectedIds.has(String(s.id)),
                              );
                              const next = new Set(selectedIds);
                              g.slots.forEach((s: AdminBookingView) =>
                                allSel
                                  ? next.delete(String(s.id))
                                  : next.add(String(s.id)),
                              );
                              setSelectedIds(next);
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3 font-bold text-navy">
                          {g.kidName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue/5 text-blue text-[10px] font-black uppercase tracking-wider rounded-lg border border-blue/10">
                            {g.planName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-navy/60 font-medium text-xs">
                          {g.slots.length} séances
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() =>
                              setDetailsBookingId(String(g.slots[0].id))
                            }
                            className="bg-slate-100 text-navy hover:bg-slate-200 text-xs font-black px-4 py-2 rounded-xl transition-all"
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))
                  ))}

                {/* Free Trial Unassigned Section */}
                {tab === "trial" &&
                  (filteredPendingTrial.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-16 text-navy/30"
                      >
                        Aucun essai en attente
                      </td>
                    </tr>
                  ) : (
                    filteredPendingTrial.map((s: AdminBookingView) => (
                      <tr
                        key={String(s.id)}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(String(s.id))}
                            onChange={() => toggleSelect(String(s.id))}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-navy">{s.date}</p>
                          <p className="text-xs text-navy/40">{s.time}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-navy">
                          {s.kidName}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedSlot(s as BookedSlot)}
                            className="bg-blue text-white text-xs font-black px-4 py-2 rounded-xl"
                          >
                            Assigner
                          </button>
                        </td>
                      </tr>
                    ))
                  ))}

                {/* Assigned Section */}
                {tab === "assigned" &&
                  subTab === "regular" &&
                  (filteredGroupedAssignedRegular.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-16 text-navy/30"
                      >
                        Aucun assigné régulier
                      </td>
                    </tr>
                  ) : (
                    filteredGroupedAssignedRegular.map((g: GroupedBooking) => (
                      <tr
                        key={g.kidId}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-bold text-navy">
                          {g.kidName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue/5 text-blue text-[10px] font-black uppercase tracking-wider rounded-lg border border-blue/10">
                            {g.planName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-navy/60 font-medium text-xs">
                          {g.slots.length} séances
                        </td>
                        <td className="px-4 py-3 text-navy font-bold">
                          {g.slots[0].teacher?.firstName}{" "}
                          {g.slots[0].teacher?.lastName}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() =>
                              setDetailsBookingId(String(g.slots[0].id))
                            }
                            className="bg-slate-100 text-navy hover:bg-slate-200 text-xs font-black px-4 py-2 rounded-xl transition-all"
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))
                  ))}

                {tab === "assigned" &&
                  subTab === "trial" &&
                  (filteredAssignedTrial.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-16 text-navy/30"
                      >
                        Aucun essai assigné
                      </td>
                    </tr>
                  ) : (
                    filteredAssignedTrial.map((s: AdminBookingView) => (
                      <tr
                        key={String(s.id)}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-bold text-navy">
                            {s.date || s.sessionDate}
                          </p>
                          <p className="text-xs text-navy/40">
                            {s.startTime || s.time}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-bold text-navy">
                          {s.kidName || s.kid?.name}
                        </td>
                        <td className="px-4 py-3 font-bold text-navy">
                          {s.teacher?.firstName} {s.teacher?.lastName}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUnassign(s.id, s.type)}
                              className="text-red-500 hover:text-red-700 font-bold text-[10px] uppercase"
                            >
                              Désassigner
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ))}

                {/* History Section */}
                {tab === "history" &&
                  subTab === "regular" &&
                  (filteredGroupedHistoryRegular.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-16 text-navy/30"
                      >
                        Historique vide
                      </td>
                    </tr>
                  ) : (
                    filteredGroupedHistoryRegular.map((g: GroupedBooking) => (
                      <tr
                        key={g.kidId}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-bold text-navy">
                          {g.kidName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-lg">
                            {g.planName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-navy/60 font-medium text-xs">
                          {g.slots.length} séances
                        </td>
                        <td className="px-4 py-3 text-navy/60">
                          {g.slots[0].teacher?.firstName}{" "}
                          {g.slots[0].teacher?.lastName || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${statusColor[g.slots[0].status || ""] || "bg-slate-100 text-slate-500"}`}
                          >
                            {g.slots[0].status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() =>
                              setDetailsBookingId(String(g.slots[0].id))
                            }
                            className="text-navy hover:text-blue transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ))}

                {tab === "history" &&
                  subTab === "trial" &&
                  (filteredHistoryTrial.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-16 text-navy/30"
                      >
                        Historique essai vide
                      </td>
                    </tr>
                  ) : (
                    filteredHistoryTrial.map((s: AdminBookingView) => (
                      <tr
                        key={String(s.id)}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-bold text-navy">
                            {s.date || s.sessionDate}
                          </p>
                          <p className="text-xs text-navy/40">
                            {s.time || s.startTime}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-bold text-navy">
                          {s.kidName || s.kid?.name}
                        </td>
                        <td className="px-4 py-3">
                          {s.teacher?.firstName} {s.teacher?.lastName || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${statusColor[s.status || ""] || "bg-slate-100 text-slate-500"}`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" />
                      </tr>
                    ))
                  ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {selectedSlot && (
          <AssignModal
            slot={selectedSlot}
            onClose={() => setSelectedSlot(null)}
            onAssigned={() => {
              setSelectedSlot(null);
              fetchData();
            }}
          />
        )}
        {detailsBookingId && (
          <BookingDetailsModal
            bookingId={detailsBookingId}
            onClose={() => setDetailsBookingId(null)}
            onRefresh={fetchData}
          />
        )}

        <ConfirmModal
          isOpen={Boolean(unassignTarget)}
          title="Désassigner le professeur ?"
          message="Ce créneau redeviendra 'en attente' et devra être réassigné à un autre professeur."
          variant="danger"
          confirmLabel="Désassigner"
          loading={unassigning}
          onConfirm={handleConfirmUnassign}
          onCancel={() => setUnassignTarget(null)}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;
