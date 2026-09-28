import type {
  KidLessonKeyword,
  KidLessonKeywordWithAsset,
} from "../../../data/kidLessonActivities";
import { isNegativeKeyword } from "../kidActivityHelpers";

export interface MemoryCard {
  id: string;
  pairId: string;
  kind: "emoji" | "word";
}

export interface SoundPrompt {
  id: string;
  order: number;
}

export function renderKeywordVisual(
  keyword: KidLessonKeywordWithAsset,
  className: string,
  imageClassName = "w-full h-full object-contain p-3",
) {
  if (keyword.imageUrl) {
    return (
      <img
        src={keyword.imageUrl}
        alt={keyword.word}
        className={imageClassName}
      />
    );
  }

  return (
    <span className={`${className} font-black uppercase text-white/92`}>
      {keyword.word.slice(0, 2)}
    </span>
  );
}

export function VocabNotOwnedBadge() {
  return (
    <div className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-white shadow-[0_12px_24px_rgba(220,38,38,0.22)]">
      <div className="relative h-8 w-8 rounded-full border-[5px] border-red-500">
        <div className="absolute left-1/2 top-1/2 h-[5px] w-9 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-red-500" />
      </div>
    </div>
  );
}

export function renderVocabVisual(
  keyword: KidLessonKeywordWithAsset,
  desaturate = false,
) {
  if (keyword.imageUrl) {
    return (
      <img
        src={keyword.imageUrl}
        alt={keyword.word}
        className={[
          "h-[78%] w-[78%] object-contain drop-shadow-[0_16px_22px_rgba(32,42,68,0.16)] transition duration-300 group-hover:scale-105",
          desaturate ? "grayscale contrast-110 saturate-0" : "",
        ].join(" ")}
      />
    );
  }

  return (
    <span className="text-5xl font-black uppercase text-white/92">
      {keyword.word.slice(0, 2)}
    </span>
  );
}

export function buildKeywordStatus(
  isNegativeLesson: boolean,
  keyword: KidLessonKeyword,
) {
  return isNegativeLesson || isNegativeKeyword(keyword);
}
