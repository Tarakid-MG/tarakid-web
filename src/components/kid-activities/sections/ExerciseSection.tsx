import React from "react";
import type {
  KidLessonKeyword,
  KidLessonKeywordWithAsset,
} from "../../../data/kidLessonActivities";
import { Button } from "../../ui/Button";
import { buildKeywordSentence, isNegativeKeyword } from "../kidActivityHelpers";
import { KidPromptAudioButton } from "../KidPromptAudioButton";
import { kidCardClass } from "../kidActivitySharedStyles";
import { renderKeywordVisual } from "./shared";

interface ExerciseSectionProps {
  answeredId: string | null;
  currentKeyword: KidLessonKeywordWithAsset | null;
  exerciseChoices: KidLessonKeywordWithAsset[];
  exerciseFinished: boolean;
  exerciseScore: number;
  hideChoiceLabels?: boolean;
  largeChoiceVisuals?: boolean;
  promptAudioSrc?: string | null;
  isNegativeLesson: boolean;
  keywordsWithAssets: KidLessonKeywordWithAsset[];
  sentencePattern: string;
  onChoose: (keyword: KidLessonKeyword) => void;
  onNext: () => void;
}

export const ExerciseSection: React.FC<ExerciseSectionProps> = ({
  answeredId,
  currentKeyword,
  exerciseChoices,
  exerciseFinished,
  exerciseScore,
  hideChoiceLabels = false,
  largeChoiceVisuals = false,
  promptAudioSrc = null,
  isNegativeLesson,
  keywordsWithAssets,
  sentencePattern,
  onChoose,
  onNext,
}) => {
  const handlePlayPromptAudio = () => {
    if (!promptAudioSrc) return;

    const audio = new Audio(promptAudioSrc);
    audio.play().catch((error) => {
      console.error("Failed to play exercise prompt audio", error);
    });
  };

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <div className="rounded-[2.5rem] border-[3px] border-white bg-navy p-6 text-white shadow-[0_16px_36px_rgba(32,42,68,0.22)] xl:col-span-2">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
          Read and choose
        </div>
        {isNegativeLesson && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-400/20 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-rose-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-lg leading-none text-white">
              ×
            </span>
            Je n&apos;ai pas ce jouet
          </div>
        )}
        <div className="mt-5 text-4xl font-black leading-tight md:text-5xl">
          {currentKeyword
            ? buildKeywordSentence(sentencePattern, currentKeyword)
            : ""}
        </div>
        <p className="mt-4 text-lg font-bold text-white/80">
          {isNegativeLesson
            ? "Choisis le jouet que tu n'as pas."
            : "Tap the matching picture."}
        </p>

        {promptAudioSrc ? (
          <div className="mt-5">
            <KidPromptAudioButton onClick={handlePlayPromptAudio} />
          </div>
        ) : null}

        <div className="mt-8 rounded-[1.75rem] border-2 border-white/30 bg-white/12 px-4 py-4">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
            Score
          </div>
          <div className="mt-2 text-3xl font-black">
            {exerciseScore} / {keywordsWithAssets.length}
          </div>
        </div>

        {answeredId && (
          <div
            className={[
              "mt-5 rounded-[1.75rem] px-4 py-4 text-lg font-black",
              answeredId === currentKeyword?.id
                ? "bg-[#E9FFEF] text-[#2B9348]"
                : "bg-[#FFF0F4] text-[#D90429]",
            ].join(" ")}
          >
            {answeredId === currentKeyword?.id
              ? "Bravo !"
              : `C'était ${currentKeyword?.word || ""}.`}
          </div>
        )}

        <Button
          onClick={onNext}
          disabled={exerciseFinished}
          variant="kidYellow"
          className="mt-6 text-lg"
        >
          {exerciseFinished ? "Terminé" : "Image suivante"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:col-span-3">
        {exerciseChoices.map((keyword) => {
          const isCorrect = answeredId && keyword.id === currentKeyword?.id;
          const isChosen = answeredId === keyword.id;

          return (
            <button
              key={keyword.id}
              type="button"
              onClick={() => onChoose(keyword)}
              className={[
                `${largeChoiceVisuals ? "p-4 sm:p-5" : "p-5"} ${kidCardClass} text-left transition hover:-translate-y-1`,
                isCorrect ? "ring-4 ring-[#7AE582]" : "",
                isChosen && !isCorrect ? "ring-4 ring-[#FF8FAB]" : "",
              ].join(" ")}
            >
              <div
                className={[
                  "relative flex items-center justify-center overflow-hidden rounded-4xl border-4 border-white shadow-[0_12px_0_rgba(0,0,0,0.12)]",
                  largeChoiceVisuals
                    ? "mx-auto aspect-square h-auto w-full max-w-[260px]"
                    : "h-28 w-28",
                ].join(" ")}
                style={{
                  background: keyword.color,
                  boxShadow: `0 18px 30px ${keyword.shadow}`,
                }}
              >
                {isNegativeKeyword(keyword) && (
                  <div className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-2xl font-black text-white shadow-[0_8px_16px_rgba(244,63,94,0.3)]">
                    ×
                  </div>
                )}
                {renderKeywordVisual(
                  keyword,
                  largeChoiceVisuals ? "text-6xl" : "text-4xl",
                  largeChoiceVisuals
                    ? "w-full h-full object-contain p-4 sm:p-5"
                    : "w-full h-full object-contain p-3",
                )}
              </div>
              {hideChoiceLabels ? null : (
                <div className="mt-5 text-3xl font-black capitalize text-navy">
                  {keyword.word}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
