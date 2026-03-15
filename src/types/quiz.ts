export type EnglishLevel = "NONE" | "WORDS" | "SENTENCES" | "FLUENT";
export type MotherTongueLevel = "NONE" | "SOME" | "FLUENT";
export type Gender = "BOY" | "GIRL" | "OTHER";
export type KidLevel = "L0" | "L1" | "L2" | "L3" | "L4" | "L5";

export interface QuizData {
  id: string;
  age: number;
  childName: string;
  gender: Gender;
  motherTongueSpeakingLevel: MotherTongueLevel;
  motherTongueReadingLevel: MotherTongueLevel;
  englishReadingLevel: EnglishLevel;
  englishSpeakingLevel: EnglishLevel;
  learningDuration: string;
  hobbies: string[];
  level?: KidLevel;
}

export interface QuizStepProps {
  data: QuizData;
  updateData: (updates: Partial<QuizData>) => void;
  onNext: () => void;
}
