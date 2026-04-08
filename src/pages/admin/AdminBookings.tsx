import React, { useEffect, useState, useCallback } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Search,
  UserCheck,
  RefreshCw,
  Eye,
} from "lucide-react";
import {
  adminService,
  type BookedSlot,
  type AssignedBooking,
  type BookingDetails,
  type BookingAssignmentHistory,
} from "../../services/admin.service";
import { type User } from "../../types/auth";
import AdminLayout from "./AdminLayout";

type Tab = "pending" | "assigned" | "history";

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
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  bookingId,
  onClose,
}) => {
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getBookingDetails(bookingId)
      .then(setDetails)
      .catch(() => setError("Impossible de charger les détails"))
      .finally(() => setLoading(false));
  }, [bookingId]);

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
            <div className="bg-blue/5 p-4 rounded-2xl border border-blue/10">
              <p className="text-xs font-bold text-blue/60 uppercase tracking-wider mb-1">
                Session
              </p>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="font-bold text-navy">
                    {details.date || "Date non définie"}
                  </p>
                  <p className="text-sm text-navy/60">
                    {details.time || "Heure non définie"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold tracking-wider bg-orange/10 text-orange px-2 py-1 rounded-lg uppercase">
                    {details.type}
                  </p>
                  <p className="text-xs font-bold tracking-wider bg-slate-200 text-slate-600 px-2 py-1 rounded-lg uppercase mt-1 inline-block">
                    {details.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminBookings: React.FC = () => {
  const [tab, setTab] = useState<Tab>("pending");
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [assigned, setAssigned] = useState<AssignedBooking[]>([]);
  const [history, setHistory] = useState<BookingAssignmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<BookedSlot | null>(null);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchTeacherId, setBatchTeacherId] = useState("");
  const [batchAssigning, setBatchAssigning] = useState(false);
  const [detailsBookingId, setDetailsBookingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [slots, assignedData, historyData] = await Promise.all([
        adminService.getBookedSlots(),
        adminService.getAssignedBookings(),
        adminService.getAssignmentsTrace(),
      ]);
      setBookedSlots(slots);
      setAssigned(assignedData);
      setHistory(historyData);
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
  const pending = bookedSlots.filter((s) => !assignedIds.has(String(s.id)));

  const filteredPending = pending.filter(
    (s) =>
      s.date.includes(search) ||
      s.time.includes(search) ||
      s.type.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredAssigned = assigned.filter(
    (a) =>
      (a.sessionDate ?? a.date ?? "").includes(search) ||
      a.startTime.includes(search) ||
      a.status.toLowerCase().includes(search.toLowerCase()),
  );

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
      await adminService.batchAssign(
        Array.from(selectedIds),
        "regular",
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

  const handleUnassign = async (id: string | number, type: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir désassigner le professeur ?"))
      return;
    setLoading(true);
    try {
      await adminService.unassignTeacher(String(id), type.toUpperCase());
      await fetchData();
    } catch {
      setError("Erreur lors de la désassignation");
      setLoading(false);
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
                id: "pending",
                label: "En attente",
                icon: Clock,
                count: pending.length,
              },
              {
                id: "assigned",
                label: "Assignés",
                icon: CheckCircle2,
                count: assigned.length,
              },
              {
                id: "history",
                label: "Historique d'assignation",
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

        {/* Search */}
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

        {/* Batch assign bar */}
        {tab === "pending" && selectedIds.size > 0 && (
          <div className="bg-blue/5 border border-blue/20 rounded-2xl px-4 py-3 flex items-center gap-4 flex-wrap">
            <span className="text-sm font-bold text-blue">
              {selectedIds.size} sélectionné(s)
            </span>
            <input
              type="number"
              placeholder="ID Professeur"
              value={batchTeacherId}
              onChange={(e) => setBatchTeacherId(e.target.value)}
              className="border border-blue/20 bg-white rounded-xl px-3 py-1.5 text-sm font-medium text-navy focus:outline-none"
            />
            <button
              onClick={handleBatchAssign}
              disabled={!batchTeacherId || batchAssigning}
              className="bg-blue text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-deepBlue transition-colors disabled:opacity-50"
            >
              {batchAssigning ? "Assignation..." : "Assigner"}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-navy/30 hover:text-navy transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue" />
            </div>
          ) : tab === "pending" ? (
            filteredPending.length === 0 ? (
              <div className="text-center py-16 text-navy/30">
                <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-bold">Aucun créneau en attente</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 w-10" />
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Heure
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Type
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredPending.map((s) => (
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
                      <td className="px-4 py-3 font-semibold text-navy">
                        {s.date}
                      </td>
                      <td className="px-4 py-3 text-navy/60">{s.time}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-orange/10 text-orange text-[10px] font-black uppercase tracking-wider rounded-lg">
                          {s.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDetailsBookingId(String(s.id))}
                            className="bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs font-black p-1.5 rounded-xl transition-all"
                            title="Détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedSlot(s)}
                            className="bg-blue/10 text-blue hover:bg-blue hover:text-white text-xs font-black px-3 py-1.5 rounded-xl transition-all"
                          >
                            Assigner
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : tab === "assigned" ? (
            filteredAssigned.length === 0 ? (
              <div className="text-center py-16 text-navy/30">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-bold">Aucune réservation assignée</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Heure
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Professeur
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Enfant
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Statut
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredAssigned.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-semibold text-navy">
                        {a.sessionDate ?? a.date ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-navy/60">{a.startTime}</td>
                      <td className="px-4 py-3 text-navy/80 font-medium">
                        {a.teacher
                          ? `${a.teacher.firstName ?? ""} ${a.teacher.lastName ?? ""}`.trim() ||
                            a.teacher.email
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-navy/60">
                        {a.kid?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                            statusColor[a.status] ??
                            "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDetailsBookingId(String(a.id))}
                            className="bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs font-black p-1.5 rounded-xl transition-all"
                            title="Détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleUnassign(a.id, a.type || "regular")
                            }
                            className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-xs font-black px-3 py-1.5 rounded-xl transition-all"
                          >
                            Désassigner
                          </button>
                          <button
                            onClick={() =>
                              setSelectedSlot({
                                id: a.id,
                                date: a.sessionDate ?? a.date ?? "",
                                time: a.startTime,
                                type: a.type || "regular",
                              })
                            }
                            className="bg-blue/10 text-blue hover:bg-blue hover:text-white text-xs font-black px-3 py-1.5 rounded-xl transition-all"
                          >
                            Réassigner
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : tab === "history" ? (
            history.length === 0 ? (
              <div className="text-center py-16 text-navy/30">
                <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-bold">Aucun historique d'assignation</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Action
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      Admin
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr
                      key={h.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-semibold text-navy">
                        {new Date(h.createdAt).toLocaleString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 text-navy/60">
                        {h.bookingType === "REGULAR"
                          ? "Régulier"
                          : "Essai Libre"}
                      </td>
                      <td className="px-4 py-3">
                        {h.newTeacherId === null ? (
                          <span className="text-red-600 font-medium text-xs bg-red-50 px-2 py-1 rounded">
                            Désassigné (Ancien:{" "}
                            {h.previousTeacherName || h.previousTeacherId})
                          </span>
                        ) : h.previousTeacherId === null ? (
                          <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded">
                            Assigné (Nouveau:{" "}
                            {h.newTeacherName || h.newTeacherId})
                          </span>
                        ) : (
                          <span className="text-blue font-medium text-xs bg-blue/10 px-2 py-1 rounded">
                            Réassigné (
                            {h.previousTeacherName || h.previousTeacherId} →{" "}
                            {h.newTeacherName || h.newTeacherId})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-navy/60 font-medium">
                        {h.assignedByName}{" "}
                        <span className="text-xs text-navy/40">
                          ({h.assignedByRole})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : null}
        </div>
      </div>

      {/* Assign modal */}
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

      {/* Booking Details modal */}
      {detailsBookingId && (
        <BookingDetailsModal
          bookingId={detailsBookingId}
          onClose={() => setDetailsBookingId(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminBookings;
