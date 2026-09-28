import type { KidLessonActivityPack } from "../../../kidLessonActivities";
import { level0Unit1Lesson2Pack } from "./lesson-2";

export const level0Unit1Lesson3Pack: KidLessonActivityPack = {
  level: "L0",
  unit: 1,
  lesson: 3,
  title: "Toys, I've / I haven't got",
  subtitle: "I haven't got a...",
  sentencePattern: "I haven't got {word}.",
  keywords: level0Unit1Lesson2Pack.keywords.map((keyword, index) => ({
    ...keyword,
    possession: index % 2 === 0 ? "have_not" : "have",
  })),
};
