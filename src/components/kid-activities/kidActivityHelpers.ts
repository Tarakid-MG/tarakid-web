import { buildKidSentence, type KidLessonKeyword } from "../../data/kidLessonActivities";

export function shuffle<T>(items: T[]) {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

export function isNegativeKeyword(keyword: KidLessonKeyword) {
  return keyword.possession === "have_not";
}

export function buildKeywordSentence(packSentencePattern: string, keyword: KidLessonKeyword) {
  if (keyword.possession === "have") {
    return `I've got ${keyword.word.trim()}.`;
  }

  if (keyword.possession === "have_not") {
    return `I haven't got ${keyword.word.trim()}.`;
  }

  return buildKidSentence(packSentencePattern, keyword.word);
}

export function getLessonArt(unitOrder: number, lessonOrder: number) {
  const artMap: Record<string, string> = {
    "1-1": "/images/lesson/toys/toys.png",
    "1-2": "/images/lesson/toys/ball.png",
    "1-3": "/images/lesson/toys/robot.png",
    "1-4": "/images/lesson/toys/trophy-3d.png",
    "2-1": "/images/lesson/toys/family.png",
    "2-2": "/images/kid/blocks-3d.png",
    "2-3": "/images/lesson/toys/castle.png",
    "2-4": "/images/lesson/toys/trophy-3d.png",
  };

  return artMap[`${unitOrder}-${lessonOrder}`] || "/images/kid/book-3d.png";
}

export function getUnitTheme(unitOrder: number) {
  if (unitOrder === 1) {
    return {
      tag: "bg-blue",
      badge: "text-blue bg-blue/10",
      action: "bg-yellow text-orange",
      lock: "text-deepBlue bg-lightBlue/15",
      ring: "ring-blue/18",
      progress: "from-blue to-lightBlue",
    };
  }

  return {
    tag: "bg-teal",
    badge: "text-teal bg-turquoise/15",
    action: "bg-turquoise text-teal",
    lock: "text-teal bg-turquoise/15",
    ring: "ring-teal/18",
    progress: "from-teal to-turquoise",
  };
}
