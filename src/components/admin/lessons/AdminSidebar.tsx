import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";
import { feedbackService } from "../../../services/feedback.service";
import { type Unit, type KidLevel, blue } from "./LessonTypes";

interface AdminSidebarProps {
  units: Unit[];
  totalLessons: number;
  selectedLevel: KidLevel;
  lvlColor: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  units,
  totalLessons,
  selectedLevel,
  lvlColor,
}) => {
  const [unreadFeedback, setUnreadFeedback] = useState(0);

  useEffect(() => {
    feedbackService
      .getUnreadCount()
      .then(setUnreadFeedback)
      .catch(console.error);
  }, []);

  return (
    <div className="lg:col-span-4 space-y-5">
      {/* Stats card */}
      <div className="rounded-3xl p-6 overflow-hidden relative bg-navy">
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
          style={{ background: lvlColor, filter: "blur(30px)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 pointer-events-none"
          style={{ background: blue, filter: "blur(25px)" }}
        />

        <p
          className="text-[9px] font-black uppercase tracking-[0.18em] mb-5 relative z-10"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Stats {selectedLevel}
        </p>

        <div className="grid grid-cols-2 gap-3 relative z-10">
          {[
            { label: "Unités", value: units.length, color: lvlColor },
            { label: "Leçons", value: totalLessons, color: blue },
          ].map((s, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1.5px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="text-3xl font-black text-white mb-1">
                {s.value}
              </div>
              <div
                className="text-[9px] font-black uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {s.label}
              </div>
              <div
                className="mt-2 h-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <div
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: s.value > 0 ? "60%" : "0%",
                    background: s.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link
        to="/admin/feedback"
        className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex items-center justify-between hover:border-blue/30 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue/10 text-blue flex items-center justify-center">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black text-navy">
              Feedback
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Avis parents
            </p>
          </div>
        </div>
        {unreadFeedback > 0 && (
          <span className="min-w-7 h-7 px-2 bg-red-500 text-white rounded-xl text-xs font-black flex items-center justify-center">
            {unreadFeedback}
          </span>
        )}
      </Link>

      {/* Help card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-4">
          Aide
        </p>
        <div className="space-y-4">
          {[
            {
              n: 1,
              text: (
                <>
                  Sélectionnez d'abord un{" "}
                  <strong className="text-navy">niveau</strong> en haut à
                  droite.
                </>
              ),
            },
            {
              n: 2,
              text: (
                <>
                  Cliquez sur le carré pointillé pour{" "}
                  <strong className="text-navy">uploader une preview</strong>{" "}
                  vers MinIO.
                </>
              ),
            },
            {
              n: 3,
              text: (
                <>
                  L'ID de l'unité sera automatiquement lié à votre nouvelle
                  leçon.
                </>
              ),
            },
          ].map((step) => (
            <div key={step.n} className="flex gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0"
                style={{ background: lvlColor }}
              >
                {step.n}
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
