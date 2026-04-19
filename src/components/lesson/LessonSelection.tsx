import React, { useEffect, useState } from "react";
import {
  X,
  Play,
  ChevronRight,
  BookOpen,
  Lock,
  FileText,
  Video,
} from "lucide-react";
import lessonService from "../../services/lesson.service";
import type { Unit, Lesson } from "../../services/lesson.service";
import { useKidMode } from "../../hooks/useKidMode";

interface LessonSelectionProps {
  onClose: () => void;
  onSelectLesson: (lesson: Lesson) => void;
}

export const LessonSelection: React.FC<LessonSelectionProps> = ({
  onClose,
  onSelectLesson,
}) => {
  const { selectedKid } = useKidMode();
  const [units, setUnits] = useState<Unit[]>([]);
  const [suggestedLessonId, setSuggestedLessonId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedKid?.id || !selectedKid?.level) return;
      try {
        const data = await lessonService.getLessonsByKidAndLevel(
          selectedKid.id,
          selectedKid.level,
        );
        setUnits(data.units);
        setSuggestedLessonId(data.suggestedLessonId);
      } catch (error) {
        console.error("Failed to fetch units:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, [selectedKid]);

  return (
    <div className="flex flex-col min-h-full bg-slate-50 rounded-[3rem] overflow-hidden shadow-xl border-4 border-white">
      {/* Header */}
      <div className="bg-blue p-6 md:p-8 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black italic">
              MES LEÇONS
            </h2>
            <p className="text-white/80 font-bold uppercase tracking-wider text-sm mt-1">
              Choisis ton aventure du jour !
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-navy font-black animate-pulse uppercase">
              Chargement...
            </p>
          </div>
        ) : (
          <div className="max-w-8xl mx-auto space-y-12">
            {units?.map((unit: Unit) => (
              <div key={unit.id} className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="h-2 w-12 bg-teal rounded-full" />
                  <h3 className="text-2xl font-black text-navy uppercase tracking-tight">
                    {unit.title}
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {unit.lessons.map((lesson: Lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        if (lesson.isLocked) {
                          onClose();
                          return;
                        }

                        // Ensure lesson has the thumbnail URL calculated for the player
                        const levelDigit =
                          selectedKid?.level?.replace("L", "") || "0";
                        const dynamicThumb = `/thumbnailImage/${levelDigit}${unit.order}${lesson.order}.png`;
                        const finalLesson = {
                          ...lesson,
                          thumbnailUrl: lesson.thumbnailUrl || dynamicThumb,
                        };

                        onSelectLesson(finalLesson);
                      }}
                      className={`group relative bg-white border-4 rounded-[2.25rem] overflow-hidden text-left transition-all focus:outline-none focus:ring-4 focus:ring-blue/20 ${
                        lesson.isLocked
                          ? "border-slate-200 opacity-75 cursor-not-allowed"
                          : "border-slate-100 hover:border-blue hover:-translate-y-1 hover:shadow-xl"
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        {/* Thumbnail */}
                        <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                          {(() => {
                            const levelDigit =
                              selectedKid?.level?.replace("L", "") || "0";
                            const unitOrder = unit.order;
                            const lessonOrder = lesson.order;
                            const dynamicThumb =
                              lesson.thumbnailUrl ||
                              `/thumbnailImage/${levelDigit}${unitOrder}${lessonOrder}.png`;

                            return (
                              <img
                                src={dynamicThumb}
                                alt={lesson.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  // Fallback if the dynamic .png doesn't exist
                                  const target = e.target as HTMLImageElement;
                                  if (!target.src.endsWith(".jpeg")) {
                                    target.src = dynamicThumb.replace(
                                      ".png",
                                      ".jpeg",
                                    );
                                  } else if (
                                    target.src !==
                                    "/images/lesson-placeholder.png"
                                  ) {
                                    // Final fallback
                                    target.style.display = "none";
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const placeholder =
                                        document.createElement("div");
                                      placeholder.className =
                                        "w-full h-full flex items-center justify-center bg-slate-100";
                                      placeholder.innerHTML =
                                        '<svg class="w-12 h-12 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';
                                      parent.appendChild(placeholder);
                                    }
                                  }
                                }}
                              />
                            );
                          })()}
                          <div className="absolute top-4 right-4">
                            {lesson.isLocked ? (
                              <div className="bg-slate-500/90 backdrop-blur-sm p-2 rounded-xl text-white shadow-lg border border-white">
                                <Lock className="w-5 h-5 fill-current" />
                              </div>
                            ) : (
                              <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl text-blue shadow-lg border border-white">
                                {lesson.type === "pdf" ? (
                                  <FileText className="w-5 h-5" />
                                ) : lesson.type === "video" ? (
                                  <Video className="w-5 h-5" />
                                ) : (
                                  <Play className="w-5 h-5 fill-current" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className="bg-blue/10 text-blue px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                              LEÇON {lesson.order}
                            </span>
                          </div>

                          <h4 className="text-xl font-black text-navy mb-4 leading-tight group-hover:text-blue transition-colors">
                            {lesson.title}
                          </h4>

                          <div
                            className={`flex items-center gap-2 font-black text-sm transition-colors ${
                              lesson.isLocked
                                ? "text-slate-400"
                                : "text-navy/40 group-hover:text-blue"
                            }`}
                          >
                            {lesson.isLocked ? "VERROUILLÉ" : "JOUER"}
                            {!lesson.isLocked && (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Ribbon decor */}
                      {lesson.id === suggestedLessonId && (
                        <div className="absolute top-4 left-4 bg-yellow text-navy text-[10px] font-black px-3 py-1 rounded-lg border-2 border-white shadow-sm -rotate-6 z-10 animate-bounce">
                          VOTRE PROCHAINE LEÇON
                        </div>
                      )}
                      {lesson.order === 1 &&
                        lesson.id !== suggestedLessonId && (
                          <div className="absolute top-4 left-4 bg-yellow text-navy text-[10px] font-black px-3 py-1 rounded-lg border-2 border-white shadow-sm -rotate-6">
                            NOUVEAU
                          </div>
                        )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
