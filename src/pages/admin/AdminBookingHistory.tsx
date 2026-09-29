import React, { useEffect, useMemo, useState } from "react";
import {
  History,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  adminService,
  type HistoryBooking,
} from "../../services/admin.service";
import AdminLayout from "./AdminLayout";

const statusColor: Record<string, string> = {
  SCHEDULED: "bg-blue/10 text-blue",
  CONFIRMED: "bg-green-100 text-green-600",
  COMPLETED: "bg-slate-100 text-slate-500",
  CANCELLED: "bg-red-100 text-red-500",
  MISSED: "bg-orange/10 text-orange",
  ABSENT: "bg-yellow/20 text-yellow-700",
  REPORTED: "bg-purple-100 text-purple-600",
  DONE_BUT_MISSING: "bg-pink-100 text-pink-600",
};

const AdminBookingHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getBookingHistory();
      setHistory(data);
    } catch {
      setError("Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statuses = [
    "ALL",
    "COMPLETED",
    "CANCELLED",
    "MISSED",
    "ABSENT",
    "REPORTED",
  ];

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, pageSize]);

  const filtered = history.filter((b) => {
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    const date = b.sessionDate ?? b.date ?? "";
    const matchSearch =
      date.includes(search) ||
      b.startTime.includes(search) ||
      b.status.toLowerCase().includes(search.toLowerCase()) ||
      (b.kid?.name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);
  const startEntry = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, filtered.length);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-navy">Historique</h1>
            <p className="text-sm text-navy/40 font-medium mt-1">
              Réservations passées, annulées et manquées
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

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/30" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-slate-200 bg-white rounded-xl pl-9 pr-4 py-2 text-sm font-medium text-navy focus:outline-none focus:border-blue/50"
            />
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === s
                    ? "bg-white text-navy shadow-sm"
                    : "text-navy/40 hover:text-navy"
                }`}
              >
                {s === "ALL" ? "Tous" : s}
              </button>
            ))}
          </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-navy/40">
            Afficher
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm font-bold text-navy focus:outline-none focus:border-blue/50"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-navy/30">
              <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-bold">Aucun résultat</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100">
                <tr>
                  {["Date", "Heure", "Enfant", "Professeur", "Statut"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {paginated.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-semibold text-navy">
                      {b.sessionDate ?? b.date ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-navy/60">{b.startTime}</td>
                    <td className="px-4 py-3 text-navy/80 font-medium">
                      {b.kid?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-navy/60">
                      {b.teacher
                        ? `${b.teacher.firstName ?? ""} ${b.teacher.lastName ?? ""}`.trim() ||
                          b.teacher.email
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                          statusColor[b.status] ?? "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-navy/30 font-semibold">
            {filtered.length === 0
              ? "0 entrée"
              : `${startEntry}-${endEntry} sur ${filtered.length} entrée(s)`}
          </p>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-navy/50 hover:text-blue hover:border-blue/30 disabled:opacity-40 disabled:hover:text-navy/50 disabled:hover:border-slate-200 flex items-center justify-center transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages })
                .map((_, index) => index + 1)
                .filter(
                  (pageNumber) =>
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(pageNumber - currentPage) <= 1,
                )
                .map((pageNumber, index, pages) => {
                  const previous = pages[index - 1];
                  const showGap = previous && pageNumber - previous > 1;
                  return (
                    <React.Fragment key={pageNumber}>
                      {showGap && (
                        <span className="px-2 text-xs font-black text-navy/25">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => setPage(pageNumber)}
                        className={`min-w-10 h-10 px-3 rounded-xl text-sm font-black transition-all ${
                          currentPage === pageNumber
                            ? "bg-blue text-white shadow-sm"
                            : "bg-white border border-slate-200 text-navy/45 hover:text-blue hover:border-blue/30"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-navy/50 hover:text-blue hover:border-blue/30 disabled:opacity-40 disabled:hover:text-navy/50 disabled:hover:border-slate-200 flex items-center justify-center transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBookingHistory;
