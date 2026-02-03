import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Sparkles,
  Edit2,
  X,
  Check,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Logo } from "../../components/ui/Logo";
import { freeTrialService } from "../../services/free-trial.service";
import { type FreeTrialSession } from "../../types/auth";
import BookingCalendar from "../../components/quiz/BookingCalendar";

const AdminSessions: React.FC = () => {
  const [sessions, setSessions] = useState<FreeTrialSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [bulkData, setBulkData] = useState({
    startDate: selectedDate,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    daysOfWeek: [] as number[],
    rangeStart: "06:00",
    rangeEnd: "21:00",
    capacity: 5,
  });

  const [editingSession, setEditingSession] = useState<FreeTrialSession | null>(
    null,
  );

  const generateTimes = (start: string, end: string) => {
    const times: string[] = [];
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    let current = new Date(2000, 0, 1, startH, startM);
    const endDt = new Date(2000, 0, 1, endH, endM);

    while (current <= endDt) {
      const h = String(current.getHours()).padStart(2, "0");
      const m = String(current.getMinutes()).padStart(2, "0");
      const timeStr = `${h}:${m}`;

      // A class is 25 minutes. We check if it fits in the range.
      const sessionEnd = new Date(current.getTime() + 25 * 60000);
      if (sessionEnd > endDt) break;

      times.push(timeStr);
      // Move to next slot (30 min interval)
      current = new Date(current.getTime() + 30 * 60000);
    }
    return times;
  };

  const fetchSessions = async () => {
    try {
      const data = await freeTrialService.getAvailableSessions();
      setSessions(data);
    } catch (err) {
      setError(`Erreur lors du chargement des sessions, ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (bulkData.daysOfWeek.length === 0) {
        setError("Veuillez sélectionner au moins un jour de la semaine");
        return;
      }

      const startTimes = generateTimes(bulkData.rangeStart, bulkData.rangeEnd);
      if (startTimes.length === 0) {
        setError(
          "Aucune session ne peut être générée dans cette plage horaire (minimum 25 min requis)",
        );
        return;
      }

      await freeTrialService.createBulkSessions({
        ...bulkData,
        startTimes,
      });
      setSuccess(`${startTimes.length} sessions par jour créées avec succès !`);
      fetchSessions();
    } catch (err: unknown) {
      setError(`Erreur lors de la création, ${err}`);
    }
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    setError("");
    setSuccess("");
    try {
      await freeTrialService.updateSession(editingSession.id, {
        startTime: editingSession.startTime,
        capacity: editingSession.capacity,
      });
      setSuccess("Session mise à jour !");
      setEditingSession(null);
      fetchSessions();
    } catch (err: unknown) {
      setError(`Erreur lors de la mise à jour, ${err}`);
    }
  };

  const handleDeleteSession = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce créneau ?"))
      return;

    try {
      await freeTrialService.deleteSession(id);
      setSuccess("Session supprimée avec succès !");
      fetchSessions();
    } catch (err: unknown) {
      setError(`Erreur lors de la suppression, ${err}`);
    }
  };

  const calculateEndTime = (startTime: string) => {
    if (!startTime) return "";
    const [h, m] = startTime.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m + 25);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const availableDates = Array.from(
    new Set(sessions.map((s) => s.date.split("T")[0])),
  );
  const filteredSessions = sessions.filter(
    (s) => s.date.split("T")[0] === selectedDate,
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Logo className="h-8" />
          <div className="h-6 w-[2px] bg-slate-200"></div>
          <h1 className="text-xl font-black text-navy uppercase tracking-widest flex items-center">
            Admin <span className="text-blue ml-2 italic">Dashboard</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-blue/10 text-blue rounded-full text-xs font-black uppercase tracking-wider">
            Gestion des cours d'essai
          </div>
        </div>
      </header>

      <main className="grow p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Selection & Creation */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
          <section>
            <h2 className="text-lg font-black text-navy mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-blue" />
              1. Calendrier des disponibilités
            </h2>
            <BookingCalendar
              availableDates={availableDates}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              isAdmin={true}
            />
          </section>

          <section>
            <Card className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Plus className="w-24 h-24" />
              </div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-lg font-black text-navy flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-blue" />
                  Création par série
                </h2>
              </div>

              <form
                onSubmit={handleCreateSession}
                className="space-y-6 relative z-10"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Date de début"
                    type="date"
                    value={bulkData.startDate}
                    onChange={(e) =>
                      setBulkData({ ...bulkData, startDate: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Date de fin"
                    type="date"
                    value={bulkData.endDate}
                    onChange={(e) =>
                      setBulkData({ ...bulkData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">
                    Jours de la semaine
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(
                      (day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const newDays = bulkData.daysOfWeek.includes(index)
                              ? bulkData.daysOfWeek.filter((d) => d !== index)
                              : [...bulkData.daysOfWeek, index];
                            setBulkData({ ...bulkData, daysOfWeek: newDays });
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                            bulkData.daysOfWeek.includes(index)
                              ? "bg-blue text-white shadow-lg shadow-blue/20 rotate-2"
                              : "bg-slate-100 text-navy/40 hover:bg-slate-200"
                          }`}
                        >
                          {day}
                        </button>
                      ),
                    )}
                  </div>
                </div>
                <div className="bg-blue/5 p-6 rounded-[30px] border-2 border-blue/10">
                  <p className="text-[10px] font-black text-blue uppercase tracking-widest mb-4">
                    Plage Horaire (Sessions de 25m + 5m de pause)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Début de service"
                      type="time"
                      value={bulkData.rangeStart}
                      onChange={(e) =>
                        setBulkData({ ...bulkData, rangeStart: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Fin de service"
                      type="time"
                      value={bulkData.rangeEnd}
                      onChange={(e) =>
                        setBulkData({ ...bulkData, rangeEnd: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mt-4">
                    <Input
                      label="Capacité par session"
                      type="number"
                      min="1"
                      value={bulkData.capacity}
                      onChange={(e) =>
                        setBulkData({
                          ...bulkData,
                          capacity: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Preview of generated times */}
                {bulkData.rangeStart && bulkData.rangeEnd && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">
                      Sessions qui seront générées :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {generateTimes(
                        bulkData.rangeStart,
                        bulkData.rangeEnd,
                      ).map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-navy"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-xs font-bold">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="p-4 bg-green-50 border-2 border-green-100 text-green-600 rounded-2xl flex items-start space-x-3">
                    <Check className="w-5 h-5 shrink-0" />
                    <p className="text-xs font-bold">{success}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  className="shadow-xl shadow-blue/20"
                >
                  <span>Créer la série</span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </Card>
          </section>
        </div>

        {/* Right Column - Existing Sessions */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-4 sticky top-[80px] bg-slate-50/80 backdrop-blur-md py-4 z-40">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-navy uppercase tracking-tight">
                {new Date(selectedDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  timeZone: "Asia/Riyadh",
                })}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-navy/40 uppercase tracking-widest shadow-sm">
                {filteredSessions.length} sessions
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue"></div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <Card className="p-20 text-center border-2 border-dashed border-slate-200 bg-transparent">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarIcon className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold italic">
                Aucune session programmée pour cette journée.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white p-4 rounded-[28px] border-2 border-white shadow-sm hover:shadow-xl hover:border-blue/10 transition-all group relative overflow-hidden flex flex-col justify-between h-full min-h-[140px]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xl font-black text-navy">
                        {session.startTime}
                      </p>
                      <p className="text-[10px] font-black text-navy/20 uppercase tracking-widest">
                        {session.endTime}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingSession(session)}
                        className="p-2 text-slate-300 hover:text-blue hover:bg-blue/5 rounded-lg transition-all"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <div className="flex -space-x-1.5">
                        {[...Array(Math.min(session.capacity, 3))].map(
                          (_, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black ${i < session.bookedSlots ? "bg-orange text-white" : "bg-slate-100 text-slate-400"}`}
                            >
                              {i + 1}
                            </div>
                          ),
                        )}
                        {session.capacity > 3 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[8px] font-black text-slate-400">
                            +{session.capacity - 3}
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest ${session.bookedSlots === session.capacity ? "text-red-400" : "text-green-500"}`}
                      >
                        {session.bookedSlots}/{session.capacity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-lg p-8 relative overflow-hidden shadow-2xl">
            <button
              onClick={() => setEditingSession(null)}
              className="absolute top-6 right-6 p-2 text-navy/20 hover:text-navy transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-blue/10 rounded-2xl flex items-center justify-center text-blue">
                <Edit2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-navy">
                  Modifier la session
                </h3>
                <p className="text-sm font-bold text-navy/40">
                  ID: #{editingSession.id} • {editingSession.date}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateSession} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Heure de début"
                  type="time"
                  value={editingSession.startTime}
                  onChange={(e) =>
                    setEditingSession({
                      ...editingSession,
                      startTime: e.target.value,
                    })
                  }
                  required
                />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-navy/40 uppercase tracking-widest mb-2 block">
                    Fin (Auto)
                  </span>
                  <div className="p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-navy/40 font-bold">
                    {calculateEndTime(editingSession.startTime)}
                  </div>
                </div>
              </div>
              <Input
                label="Capacité"
                type="number"
                min={editingSession.bookedSlots}
                value={editingSession.capacity}
                onChange={(e) =>
                  setEditingSession({
                    ...editingSession,
                    capacity: parseInt(e.target.value),
                  })
                }
                required
              />

              {editingSession.bookedSlots > 0 && (
                <div className="p-4 bg-orange/5 border-2 border-orange/10 rounded-2xl flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange shrink-0" />
                  <p className="text-[10px] font-bold text-orange/80 uppercase tracking-wider leading-relaxed">
                    Attention: {editingSession.bookedSlots} places sont déjà
                    réservées.
                  </p>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setEditingSession(null)}
                >
                  Annuler
                </Button>
                <Button type="submit" fullWidth>
                  Sauvegarder
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminSessions;
