import type {
  KidActivityType,
  KidLessonActivityPack,
  KidLessonKeyword,
  KidLessonKeywordWithAsset,
} from "../../../data/kidLessonActivities";

export interface MemoryCard {
  id: string;
  pairId: string;
  kind: "emoji" | "word";
}

export interface SoundPrompt {
  id: string;
  order: number;
}

export interface KidActivityScenarioProps {
  activityType: KidActivityType;
  answeredId: string | null;
  activeSoundId: string | null;
  binaryChoice: "have" | "have_not" | null;
  boxChoices: KidLessonKeywordWithAsset[];
  boxOpened: boolean;
  currentKeyword: KidLessonKeywordWithAsset | null;
  exerciseChoices: KidLessonKeywordWithAsset[];
  exerciseFinished: boolean;
  exerciseIndex: number;
  exerciseScore: number;
  flippedVocabIds: string[];
  isNegativeLesson: boolean;
  keywordsWithAssets: KidLessonKeywordWithAsset[];
  matchedPairs: string[];
  matchedSoundIds: string[];
  memoryDeck: MemoryCard[];
  openCards: string[];
  pack: KidLessonActivityPack;
  selectedToyId: string | null;
  soundGameToys: KidLessonKeywordWithAsset[];
  soundPrompts: SoundPrompt[];
  onBoxChoose: (keyword: KidLessonKeywordWithAsset) => void;
  onChooseBinaryGame: (
    keyword: KidLessonKeywordWithAsset,
    choice: "have" | "have_not",
  ) => void;
  onCardClick: (cardId: string, pairId: string) => void;
  onChooseExercise: (keyword: KidLessonKeyword) => void;
  onNextExercise: () => void;
  onOpenBox: () => void;
  onResetGame: () => void;
  onSelectSound: (soundId: string) => void;
  onSelectToy: (toyId: string) => void;
  onToggleVocabCard: (keywordId: string) => void;
}
