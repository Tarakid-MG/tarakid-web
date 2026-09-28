import { Crown, Heart, Sparkles, Star } from "lucide-react";
import type { Lesson, Unit } from "../../services/lesson.service";
import { LessonCard } from "./LessonCard";
import { getUnitAccent } from "./lessonSelectionUtils";

const unitIcons = [Star, Heart, Sparkles, Crown] as const;

export function LessonUnitSection({
  unit,
  level,
  suggestedLessonId,
  onSelectLesson,
  onLockedLesson,
}: {
  unit: Unit;
  level?: string | null;
  suggestedLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  onLockedLesson: () => void;
}) {
  const accent = getUnitAccent(unit.order);
  const Icon = unitIcons[(unit.order - 1) % unitIcons.length];

  return (
    <section
      className={`rounded-[2.2rem] bg-linear-to-br ${accent.sectionGlow} px-1`}
    >
      <div className="mb-5 flex items-center gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-[1.4rem] ${accent.iconWrap} shadow-[0_10px_22px_rgba(32,42,68,0.06)]`}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <h3
            className={`text-[2rem] font-black uppercase tracking-[-0.04em] ${accent.title}`}
          >
            {unit.title}
          </h3>
          <div className="mt-2 flex items-center gap-3">
            <span className={`h-2 w-16 rounded-full ${accent.line}`} />
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${accent.badge}`}
            >
              {unit.lessons.length} leçons
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {unit.lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            unit={unit}
            level={level}
            suggestedLessonId={suggestedLessonId}
            onSelectLesson={onSelectLesson}
            onLockedLesson={onLockedLesson}
          />
        ))}
      </div>
    </section>
  );
}
