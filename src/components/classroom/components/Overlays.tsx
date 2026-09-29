import React from "react";
import { User, Loader2, PhoneOff, Users } from "lucide-react";
import type { Lesson, Unit } from "../types";

interface OverlaysProps {
  sessionEnded: boolean;
  isTeacher: boolean;
  isAccepted: boolean;
  showLessonSelector: boolean;
  units: Unit[];
  isAssigningLesson: boolean;
  currentLesson: Lesson | null;
  onLeave: () => void;
  onAssignLesson: (id: string) => void;
  onCloseSelector: () => void;
}

export const Overlays: React.FC<OverlaysProps> = ({
  sessionEnded,
  isTeacher,
  isAccepted,
  showLessonSelector,
  units,
  isAssigningLesson,
  currentLesson,
  onLeave,
  onAssignLesson,
  onCloseSelector,
}) => {
  return (
    <>
      {/* Session Ended Overlay */}
      {sessionEnded && (
        <div className="absolute inset-0 bg-navy/88 backdrop-blur-xl z-300 flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-linear-to-br from-yellow to-orange rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-yellow/20 classroom-float-slow">
            <User className="w-12 h-12 text-navy" />
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Leçon terminée !</h2>
          <p className="text-slate-300 text-center max-w-md mb-10 font-medium">
            Bravo ! Tu as terminé ta session de 25 minutes. Tes progrès ont été enregistrés.
          </p>
          <button
            onClick={onLeave}
            className="px-10 py-4 bg-blue hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue/20 active:scale-95"
          >
            Fermer la classe
          </button>
        </div>
      )}

      {/* Waiting for Admission Overlay (for Kid) */}
      {!isTeacher && !isAccepted && (
        <div className="absolute inset-0 bg-navy/95 backdrop-blur-xl z-300 flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-linear-to-br from-blue to-lightBlue rounded-full flex items-center justify-center mb-6 shadow-2xl animate-pulse">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Admission en cours...</h2>
          <p className="text-slate-300 text-center max-w-md mb-10 font-medium leading-relaxed">
            Tu es presque arrivé ! <br />
            Attends que ton professeur t'ouvre la porte de la classe.
          </p>
          <button
            onClick={onLeave}
            className="px-8 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-xl font-bold uppercase tracking-widest transition-all"
          >
            Quitter
          </button>
        </div>
      )}

      {/* Lesson Selector Modal (Teacher Only) */}
      {showLessonSelector && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-400 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-white">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-navy uppercase tracking-tighter">Sélecteur de Leçon</h2>
                <p className="text-slate-400 font-bold text-sm">Choisis la prochaine étape de l'apprentissage</p>
              </div>
              <button
                onClick={onCloseSelector}
                className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <PhoneOff className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-8">
              {units.map((unit) => (
                <div key={unit.id} className="space-y-4">
                  <h3 className="text-xs font-black text-blue uppercase tracking-widest pl-2">{unit.title}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {unit.lessons.map((l) => (
                      <button
                        key={l.id}
                        disabled={isAssigningLesson}
                        onClick={() => onAssignLesson(l.id)}
                        className={`p-4 rounded-3xl border-2 transition-all flex items-start gap-4 text-left group active:scale-95 ${
                          currentLesson?.id === l.id ? "border-blue bg-blue/5" : "border-slate-50 hover:border-slate-200 hover:bg-slate-50/50"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                            currentLesson?.id === l.id ? "bg-blue text-white" : "bg-slate-100 text-slate-400 group-hover:bg-white"
                          }`}
                        >
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-navy truncate leading-snug">{l.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{l.type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {isAssigningLesson && (
              <div className="p-4 bg-slate-50 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-blue animate-spin" />
                <span className="text-xs font-bold text-navy uppercase tracking-widest">Attribution de la leçon...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
