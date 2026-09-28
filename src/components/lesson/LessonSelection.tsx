import React, { useEffect, useState } from "react";
import lessonService from "../../services/lesson.service";
import type { Unit, Lesson } from "../../services/lesson.service";
import { useKidMode } from "../../hooks/useKidMode";
import { LessonSelectionHeader } from "./LessonSelectionHeader";
import { LessonUnitSection } from "./LessonUnitSection";
import { getSuggestedLessonStats } from "./lessonSelectionUtils";

interface LessonSelectionProps {
  onBack: () => void;
  onClose: () => void;
  onSelectLesson: (lesson: Lesson) => void;
}

export const LessonSelection: React.FC<LessonSelectionProps> = ({
  onBack,
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

  const { totalStars, progress } = getSuggestedLessonStats(
    units,
    suggestedLessonId,
  );

  return (
    <div className="flex min-h-full flex-col overflow-hidden rounded-[3rem] border-[4px] border-white/85 bg-white/90 shadow-[0_28px_70px_rgba(32,42,68,0.12)] backdrop-blur-xl">
      <LessonSelectionHeader
        totalStars={totalStars}
        progress={progress}
        onBack={onBack}
        onClose={onClose}
      />

      <div className="flex-1 px-4 pb-8 pt-2 md:px-8 md:pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue border-t-transparent" />
            <p className="animate-pulse font-black uppercase text-navy">
              Chargement...
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-[1600px] space-y-10">
            {units?.map((unit: Unit) => (
              <LessonUnitSection
                key={unit.id}
                unit={unit}
                level={selectedKid?.level}
                suggestedLessonId={suggestedLessonId}
                onSelectLesson={onSelectLesson}
                onLockedLesson={onClose}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
