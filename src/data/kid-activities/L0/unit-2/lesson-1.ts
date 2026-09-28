import type { KidLessonActivityPack } from "../../../kidLessonActivities";

export const level0Unit2Lesson1Pack: KidLessonActivityPack = {
  level: "L0",
  unit: 2,
  lesson: 1,
  title: "My happy family",
  subtitle: "dad, mom, brother, sister, happy, sad",
  sentencePattern: "{word}",
  keywords: [
    {
      id: "dad",
      word: "dad",
      imageName: "family/dad.png",
      color: "linear-gradient(135deg, #6FE7FF 0%, #219EBC 100%)",
      shadow: "rgba(33, 158, 188, 0.30)",
    },
    {
      id: "mom",
      word: "mom",
      imageName: "family/mom.png",
      color: "linear-gradient(135deg, #FFB6D9 0%, #FF6FAE 100%)",
      shadow: "rgba(255, 111, 174, 0.28)",
    },
    {
      id: "brother",
      word: "brother",
      imageName: "family/brother.png",
      color: "linear-gradient(135deg, #FFD166 0%, #F77F00 100%)",
      shadow: "rgba(247, 127, 0, 0.28)",
    },
    {
      id: "sister",
      word: "sister",
      imageName: "family/sister.png",
      color: "linear-gradient(135deg, #F9A8D4 0%, #EC4899 100%)",
      shadow: "rgba(236, 72, 153, 0.28)",
    },
    {
      id: "happy",
      word: "happy",
      imageName: "feelings/happy.png",
      color: "linear-gradient(135deg, #FFE066 0%, #FFB703 100%)",
      shadow: "rgba(255, 183, 3, 0.28)",
    },
    {
      id: "sad",
      word: "sad",
      imageName: "feelings/sad.png",
      color: "linear-gradient(135deg, #A0D8FF 0%, #3A86FF 100%)",
      shadow: "rgba(58, 134, 255, 0.28)",
    },
  ],
};
