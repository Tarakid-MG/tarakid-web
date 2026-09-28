import {
  level0Unit1Lesson1Pack,
  level0Unit1Lesson2Pack,
  level0Unit1Lesson3Pack,
  level0Unit1Lesson4Pack,
  level0Unit2Lesson1Pack,
  level0Unit2Lesson2Pack,
} from "./kid-activities";

export type KidActivityType = "exercise" | "vocab" | "game";

export interface KidLessonKeyword {
  id: string;
  word: string;
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

  if (params.level === "L0" && params.unit === 1 && params.lesson === 4) {
    return level0Unit1Lesson4Pack;
  }

  if (params.level === "L0" && params.unit === 2 && params.lesson === 1) {
    return level0Unit2Lesson1Pack;
  }

  if (params.level === "L0" && params.unit === 2 && params.lesson === 2) {
    return level0Unit2Lesson2Pack;
  }

  return null;
}

export function buildKidSentence(pattern: string, word: string) {
  return pattern.replace("{word}", word);
}
