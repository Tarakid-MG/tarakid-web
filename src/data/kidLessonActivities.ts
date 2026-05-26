export type KidActivityType = "exercise" | "vocab" | "game";

export interface KidLessonKeyword {
  id: string;
  word: string;
  emoji: string;
  imageName: string;
  color: string;
  shadow: string;
  possession?: "have" | "have_not";
}

export interface KidLessonKeywordWithAsset extends KidLessonKeyword {
  imageUrl?: string;
}

export interface KidLessonActivityPack {
  level: string;
  unit: number;
  lesson: number;
  title: string;
  subtitle: string;
  sentencePattern: string;
  keywords: KidLessonKeyword[];
}

export const level0Unit1Lesson1Pack: KidLessonActivityPack = {
  level: "L0",
  unit: 1,
  lesson: 1,
  title: "My Favorite Toys",
  subtitle: "It’s a...",
  sentencePattern: "It's a {word}.",
  keywords: [
    {
      id: "ball",
      word: "ball",
      emoji: "⚽",
      imageName: "ball.png",
      color: "linear-gradient(135deg, #FFD84D 0%, #FFB703 100%)",
      shadow: "rgba(255, 183, 3, 0.35)",
    },
    {
      id: "bike",
      word: "bike",
      emoji: "🚲",
      imageName: "bike.png",
      color: "linear-gradient(135deg, #80EDFF 0%, #219EBC 100%)",
      shadow: "rgba(33, 158, 188, 0.28)",
    },
    {
      id: "car",
      word: "car",
      emoji: "🚗",
      imageName: "car.png",
      color: "linear-gradient(135deg, #FF9F7A 0%, #F77F00 100%)",
      shadow: "rgba(247, 127, 0, 0.28)",
    },
    {
      id: "doll",
      word: "doll",
      emoji: "🧸",
      imageName: "doll.png",
      color: "linear-gradient(135deg, #FFB5D8 0%, #FF7EB6 100%)",
      shadow: "rgba(255, 126, 182, 0.28)",
    },
    {
      id: "train",
      word: "train",
      emoji: "🚂",
      imageName: "train.png",
      color: "linear-gradient(135deg, #A4F28D 0%, #55A630 100%)",
      shadow: "rgba(85, 166, 48, 0.28)",
    },
    {
      id: "toy-truck",
      word: "truck",
      emoji: "🚚",
      imageName: "truck.png",
      color: "linear-gradient(135deg, #B392F0 0%, #6D28D9 100%)",
      shadow: "rgba(109, 40, 217, 0.28)",
    },
    {
      id: "toy-plane",
      word: "plane",
      emoji: "✈️",
      imageName: "plane.png",
      color: "linear-gradient(135deg, #7DD3FC 0%, #0EA5E9 100%)",
      shadow: "rgba(14, 165, 233, 0.28)",
    },
    {
      id: "toy-guitar",
      word: "guitar",
      emoji: "🎸",
      imageName: "guitar.png",
      color: "linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)",
      shadow: "rgba(239, 68, 68, 0.28)",
    },
    {
      id: "toy-piano",
      word: "piano",
      emoji: "🎹",
      imageName: "piano.png",
      color: "linear-gradient(135deg, #9CA3AF 0%, #111827 100%)",
      shadow: "rgba(17, 24, 39, 0.28)",
    },
  ],
};

export const level0Unit1Lesson2Pack: KidLessonActivityPack = {
  level: "L0",
  unit: 1,
  lesson: 2,
  title: "My Favorite Toys",
  subtitle: "I've got a...",
  sentencePattern: "I've got a {word}.",
  keywords: [
    {
      id: "robot",
      word: "robot",
      emoji: "🤖",
      imageName: "robot.png",
      color: "linear-gradient(135deg, #6FE7FF 0%, #219EBC 100%)",
      shadow: "rgba(33, 158, 188, 0.3)",
    },
    {
      id: "teddy-bear",
      word: "teddy bear",
      emoji: "🧸",
      imageName: "teddy-bear.png",
      color: "linear-gradient(135deg, #F6C177 0%, #D97706 100%)",
      shadow: "rgba(217, 119, 6, 0.3)",
    },
    {
      id: "puzzle",
      word: "puzzle",
      emoji: "🧩",
      imageName: "puzzle.png",
      color: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
      shadow: "rgba(124, 58, 237, 0.28)",
    },
    {
      id: "kite",
      word: "kite",
      emoji: "🪁",
      imageName: "kite.png",
      color: "linear-gradient(135deg, #FFB86C 0%, #F77F00 100%)",
      shadow: "rgba(247, 127, 0, 0.28)",
    },
    {
      id: "blocks",
      word: "blocks",
      emoji: "🧱",
      imageName: "blocks.png",
      color: "linear-gradient(135deg, #FFD166 0%, #FF9F1C 100%)",
      shadow: "rgba(255, 159, 28, 0.28)",
    },
    ...level0Unit1Lesson1Pack.keywords,
  ],
};

export const level0Unit1Lesson3Pack: KidLessonActivityPack = {
  level: "L0",
  unit: 1,
  lesson: 3,
  title: "Toys, I've / I haven't got",
  subtitle: "I haven't got a...",
  sentencePattern: "I haven't got a {word}.",
  keywords: [
    { ...level0Unit1Lesson2Pack.keywords[0], possession: "have_not" },
    { ...level0Unit1Lesson2Pack.keywords[1], possession: "have" },
    { ...level0Unit1Lesson2Pack.keywords[2], possession: "have_not" },
    { ...level0Unit1Lesson2Pack.keywords[3], possession: "have" },
    { ...level0Unit1Lesson2Pack.keywords[4], possession: "have_not" },
    { ...level0Unit1Lesson2Pack.keywords[5], possession: "have" },
    { ...level0Unit1Lesson2Pack.keywords[6], possession: "have_not" },
    { ...level0Unit1Lesson2Pack.keywords[7], possession: "have" },
    { ...level0Unit1Lesson2Pack.keywords[8], possession: "have_not" },
    { ...level0Unit1Lesson2Pack.keywords[9], possession: "have" },
  ],
};

export function getKidLessonPack(params: {
  level?: string;
  unit?: number;
  lesson?: number;
}): KidLessonActivityPack | null {
  if (params.level === "L0" && params.unit === 1 && params.lesson === 1) {
    return level0Unit1Lesson1Pack;
  }

  if (params.level === "L0" && params.unit === 1 && params.lesson === 2) {
    return level0Unit1Lesson2Pack;
  }

  if (params.level === "L0" && params.unit === 1 && params.lesson === 3) {
    return level0Unit1Lesson3Pack;
  }

  return null;
}

export function buildKidSentence(pattern: string, word: string) {
  return pattern.replace("{word}", word);
}
