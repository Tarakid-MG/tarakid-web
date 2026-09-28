import React, { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  adminService,
  type BookedSlot,
  type AssignedBooking,
} from "../../services/admin.service";
import AdminLayout from "./AdminLayout";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [assigned, setAssigned] = useState<AssignedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slots, assignedData] = await Promise.all([
          adminService.getBookedSlots(),
          adminService.getAssignedBookings(),
        ]);
        setBookedSlots(slots);
        setAssigned(assignedData);
      } catch {
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pending = bookedSlots.filter(
    (s) => !assigned.some((a) => String(a.id) === String(s.id)),
  );

  const stats = [
    {
      label: "Créneaux réservés",
      value: bookedSlots.length,
      icon: CalendarCheck,
      color: "bg-blue/10 text-blue",
      to: "/admin/bookings",
    },
    {
      label: "Assignés",
      value: assigned.length,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
      to: "/admin/bookings",
    },
    {
      label: "En attente (sans prof)",
      value: pending.length,
      icon: Clock,
      color: "bg-orange/10 text-orange",
      to: "/admin/bookings",
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-navy">Dashboard</h1>
          <p className="text-sm text-navy/40 font-medium mt-1">
            Vue d'ensemble de l'activité TaraKid
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon, color, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="bg-white border border-slate-200 rounded-2xl p-6 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              {loading ? (
                <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse mb-1" />
              ) : (
                <p className="text-3xl font-black text-navy">{value}</p>
              )}
              <p className="text-sm text-navy/50 font-semibold mt-1">{label}</p>
              <div className="flex items-center gap-1 mt-3 text-xs font-bold text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Voir</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-base font-black text-navy mb-4">Accès rapide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Gérer les réservations",
                to: "/admin/bookings",
                emoji: "📅",
              },
              {
                label: "Historique",
                to: "/admin/booking-history",
                emoji: "🕐",
              },
              { label: "Professeurs", to: "/admin/teachers", emoji: "👩‍🏫" },
              { label: "Leçons & Unités", to: "/admin/lessons", emoji: "📚" },
            ].map(({ label, to, emoji }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="bg-white border border-slate-200 rounded-2xl p-4 text-left hover:shadow-md hover:border-blue/30 hover:-translate-y-0.5 transition-all flex items-center gap-3"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-sm font-bold text-navy">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent unassigned */}
        {!loading && pending.length > 0 && (
          <div>
            <h2 className="text-base font-black text-navy mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange" />
              Créneaux sans professeur
            </h2>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
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
                  {pending.slice(0, 5).map((s) => (
                    <tr
                      key={`${s.id}`}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                    >
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
                        <button
                          onClick={() => navigate("/admin/bookings")}
                          className="text-xs font-bold text-blue hover:underline"
                        >
                          Assigner →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {pending.length > 5 && (
                <div className="px-4 py-3 border-t border-slate-100 text-center">
                  <button
                    onClick={() => navigate("/admin/bookings")}
                    className="text-xs font-bold text-blue hover:underline"
                  >
                    Voir tous les {pending.length} créneaux →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
