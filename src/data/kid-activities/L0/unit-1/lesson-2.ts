import type { KidLessonActivityPack } from "../../../kidLessonActivities";
import { level0Unit1Lesson1Pack } from "./lesson-1";

export const level0Unit1Lesson2Pack: KidLessonActivityPack = {
  level: "L0",
  unit: 1,
  lesson: 2,
  title: "My Favorite Toys",
  subtitle: "I've got a...",
  sentencePattern: "I've got {word}.",
  keywords: [
    {
      id: "robot",
      word: " a robot",
      imageName: "toys/robot.png",
      color: "linear-gradient(135deg, #6FE7FF 0%, #219EBC 100%)",
      shadow: "rgba(33, 158, 188, 0.3)",
    },
    {
      id: "teddy-bear",
      word: "a teddy bear",
      imageName: "toys/teddy-bear.png",
      color: "linear-gradient(135deg, #F6C177 0%, #D97706 100%)",
      shadow: "rgba(217, 119, 6, 0.3)",
    },
    {
      id: "puzzle",
      word: "a puzzle",
      imageName: "toys/puzzle.png",
      color: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
      shadow: "rgba(124, 58, 237, 0.28)",
    },
    {
      id: "kite",
      word: "a kite",
      imageName: "toys/kite.png",
      color: "linear-gradient(135deg, #FFB86C 0%, #F77F00 100%)",
      shadow: "rgba(247, 127, 0, 0.28)",
    },
    {
      id: "blocks",
      word: "blocks",
      imageName: "toys/blocks.png",
      color: "linear-gradient(135deg, #FFD166 0%, #FF9F1C 100%)",
      shadow: "rgba(255, 159, 28, 0.28)",
    },
    ...level0Unit1Lesson1Pack.keywords,
  ],
};
