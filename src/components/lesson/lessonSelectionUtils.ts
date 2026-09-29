import type { Lesson, Unit } from "../../services/lesson.service";

export function getLessonThumbnail(
  lesson: Lesson,
  unit: Unit,
  level?: string | null,
) {
  const levelDigit = level?.replace("L", "") || "0";
  const dynamicThumb =
    lesson.thumbnailUrl ||
    `/thumbnailImage/${levelDigit}${unit.order}${lesson.order}.png`;

  return dynamicThumb;
}

export function getUnitAccent(unitOrder: number) {
  const accents = [
    {
      title: "text-navy",
      iconWrap: "bg-yellow/18 text-gold",
      line: "bg-lightBlue",
      badge: "bg-lightBlue/12 text-blue",
      sectionGlow: "from-lightBlue/10 via-white to-white",
      emoji: "⭐",
    },
    {
      title: "text-navy",
      iconWrap: "bg-orange/10 text-orange",
      line: "bg-orange/40",
      badge: "bg-orange/10 text-orange",
      sectionGlow: "from-orange/8 via-white to-white",
      emoji: "💗",
    },
    {
      title: "text-navy",
      iconWrap: "bg-turquoise/12 text-teal",
      line: "bg-turquoise",
      badge: "bg-turquoise/12 text-teal",
      sectionGlow: "from-turquoise/8 via-white to-white",
      emoji: "👑",
    },
  ] as const;

  return accents[(unitOrder - 1) % accents.length];
}

export function getSuggestedLessonStats(units: Unit[], suggestedLessonId: string | null) {
  const allLessons = units.flatMap((unit) => unit.lessons);
  const unlockedCount = allLessons.filter((lesson) => !lesson.isLocked).length;
  const totalStars = unlockedCount * 10;
  const progressGoal = Math.max(allLessons.length * 10, 10);
  const progress = Math.min((totalStars / progressGoal) * 100, 100);
  const suggestedLesson = allLessons.find((lesson) => lesson.id === suggestedLessonId);

  return {
    totalStars,
    progress,
    suggestedLessonTitle: suggestedLesson?.title || "Continue ton aventure",
  };
}
