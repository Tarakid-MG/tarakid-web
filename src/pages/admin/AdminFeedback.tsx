import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  feedbackService,
  type LessonFeedback,
} from "../../services/feedback.service";

const AdminFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<LessonFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatPersonName = (
    firstName?: string,
    lastName?: string,
    fallback?: string,
  ) => {
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    return fullName || fallback || "Non assigné";
  };

  const formatClassSchedule = (item: LessonFeedback) => {
    if (!item.booking?.sessionDate) return "Horaire indisponible";

    const start = item.booking.startTime?.substring(0, 5) || "--:--";
    const end = item.booking.endTime?.substring(0, 5) || "--:--";
    return `${new Date(item.booking.sessionDate).toLocaleDateString("fr-FR")} • ${start} - ${end}`;
  };

  const loadFeedback = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await feedbackService.getAll();
      setFeedback(data);
      await feedbackService.markAllAsRead();
      window.dispatchEvent(new Event("feedback-read"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de charger les avis",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-navy">Feedback</h1>
            <p className="text-sm font-medium text-navy/40 mt-1">
              Retours des parents après les leçons
            </p>
          </div>
          <button
            onClick={loadFeedback}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-navy/60 hover:text-blue hover:border-blue/30 font-bold text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue" />
            </div>
          ) : feedback.length === 0 ? (
            <div className="py-16 text-center text-navy/30">
              <ThumbsUp className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">Aucun feedback pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-navy/40">
                      Classe
                    </th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-navy/40">
                      Professeur
                    </th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-navy/40">
                      Parent / Enfant
                    </th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-navy/40">
                      Note
                    </th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-navy/40">
                      Commentaire
                    </th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-navy/40">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feedback.map((item) => (
                    <tr key={item.id} className={!item.isRead ? "bg-blue/5" : ""}>
                      <td className="px-5 py-4">
                        <div className="text-sm font-black text-navy">
                          {item.booking?.lessonTitle || "Cours standard"}
                        </div>
                        <div className="text-xs font-semibold text-navy/45 mt-1">
                          {formatClassSchedule(item)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-black text-navy">
                          {formatPersonName(
                            item.teacher?.firstName,
                            item.teacher?.lastName,
                            item.teacher?.email,
                          )}
                        </div>
                        {item.teacher?.email && (
                          <div className="text-xs font-medium text-navy/45 mt-1">
                            {item.teacher.email}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-black text-navy">
                          {formatPersonName(
                            item.parent?.firstName,
                            item.parent?.lastName,
                            item.parent?.email,
                          )}
                        </div>
                        <div className="text-xs font-semibold text-navy/45 mt-1">
                          Enfant : {item.kid?.name || "Inconnu"}
                          {item.kid?.level ? ` • ${item.kid.level}` : ""}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {item.rating === "LIKE" ? (
                          <span className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-3 py-1.5 text-green-600 text-xs font-black">
                            <ThumbsUp className="w-4 h-4" />
                            Like
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-red-500 text-xs font-black">
                            <ThumbsDown className="w-4 h-4" />
                            Dislike
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-navy/70 max-w-xl">
                        {item.comment || (
                          <span className="text-navy/30">Sans commentaire</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-navy/50 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFeedback;
