import React, { useEffect, useRef } from "react";
import { ArrowRight, BookOpen, Check, Sparkles, Trophy, X } from "lucide-react";
import { KidPromptAudioButton } from "../../KidPromptAudioButton";
import { isNegativeKeyword } from "../../kidActivityHelpers";
import { kidBlueButton3dClass } from "../../kidActivitySharedStyles";
import type { KidActivityScenarioProps } from "../types";

const NIGHT_SKY_BG = "/images/backgrounds/night-sky-bg.png";
const CORRECT_AUDIO = "/audio/correct.mp3";
const WRONG_AUDIO = "/audio/wrong.mp3";
const WIN_AUDIO = "/audio/win.mp3";

function playAudio(src: string) {
  const audio = new Audio(src);
  audio.play().catch((error) => {
    console.error("Failed to play exercise audio", error);
  });
}

function renderChoiceVisual(
  imageUrl: string | undefined,
  word: string,
  imageName: string,
) {
  const src = imageUrl || `/images/lesson/${imageName}`;

  return (
    <img
      src={src}
      alt={word}
      className="h-[78%] w-[78%] object-contain transition duration-300 group-hover:scale-105 md:h-[74%] md:w-[74%]"
    />
  );
}

type KidExerciseHeroChoiceProps = KidActivityScenarioProps & {
  promptAudioPrefix?: string;
  resolvePromptAudioSrc?: (
    currentKeyword: NonNullable<KidActivityScenarioProps["currentKeyword"]>,
  ) => string;
  resolvePromptPrefix?: (
    currentKeyword: NonNullable<KidActivityScenarioProps["currentKeyword"]>,
  ) => string;
};

function NotOwnedBadge() {
  return (
    <div className="absolute right-3 top-3 z-20 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white shadow-[0_12px_24px_rgba(220,38,38,0.22)]">
      <div className="relative h-9 w-9 rounded-full border-[5px] border-red-500">
        <div className="absolute left-1/2 top-1/2 h-[5px] w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-red-500" />
      </div>
    </div>
  );
}

export const KidExerciseHeroChoice: React.FC<KidExerciseHeroChoiceProps> = ({
  answeredId,
  currentKeyword,
  exerciseChoices,
  exerciseFinished,
  exerciseScore,
  keywordsWithAssets,
  onChooseExercise,
  onNextExercise,
  pack,
  promptAudioPrefix = "",
  resolvePromptAudioSrc,
  resolvePromptPrefix,
}) => {
  const total = keywordsWithAssets.length || 1;
  const progress = Math.max(8, Math.round((exerciseScore / total) * 100));
  const hasAnswered = Boolean(answeredId);
  const isAnswerCorrect = answeredId === currentKeyword?.id;
  const promptPrefix = currentKeyword && resolvePromptPrefix
    ? resolvePromptPrefix(currentKeyword)
    : pack.sentencePattern
        .replace("{word}", "")
        .replace(/\s+\.$/, "")
        .trim();
  const lastFeedbackKeyRef = useRef<string | null>(null);
  const lastWinKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!answeredId || !currentKeyword) return;

    const feedbackKey = `${currentKeyword.id}:${answeredId}`;
    if (lastFeedbackKeyRef.current === feedbackKey) return;

    lastFeedbackKeyRef.current = feedbackKey;
    playAudio(answeredId === currentKeyword.id ? CORRECT_AUDIO : WRONG_AUDIO);
  }, [answeredId, currentKeyword]);

  useEffect(() => {
    if (!exerciseFinished || !answeredId || !currentKeyword) return;
    if (answeredId !== currentKeyword.id) return;

    const winKey = `${currentKeyword.id}:${exerciseScore}:${total}`;
    if (lastWinKeyRef.current === winKey) return;

    lastWinKeyRef.current = winKey;
    playAudio(WIN_AUDIO);
  }, [answeredId, currentKeyword, exerciseFinished, exerciseScore, total]);

  useEffect(() => {
    if (!answeredId || exerciseFinished) return;

    const timeoutId = window.setTimeout(() => {
      onNextExercise();
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [answeredId, exerciseFinished, onNextExercise]);

  const playPromptAudio = () => {
    if (!currentKeyword) return;

    const audioName = currentKeyword.imageName.replace(/\.[^.]+$/, "");
    const src = resolvePromptAudioSrc
      ? resolvePromptAudioSrc(currentKeyword)
      : `/audio/${promptAudioPrefix}${audioName}.mp3`;
    playAudio(src);
  };

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(330px,0.9fr)_minmax(0,1.6fr)]">
      <aside
        className="relative overflow-hidden rounded-[2.4rem] border-[3px] border-white p-5 text-white shadow-[0_22px_50px_rgba(18,25,68,0.26)] md:p-6"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(8,15,40,0.42) 0%, rgba(8,15,40,0.58) 100%), url('${NIGHT_SKY_BG}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-13 w-13 items-center justify-center rounded-full border-[3px] border-white/75 bg-navy/25 shadow-[0_10px_22px_rgba(15,143,234,0.16)] backdrop-blur-[2px]">
              <BookOpen className="h-6 w-6 text-white" />
            </div>

            <div className="text-xs font-black uppercase tracking-[0.22em] text-white drop-shadow-[0_3px_10px_rgba(8,15,40,0.55)] md:text-sm">
              Read/Listen and choose
            </div>
          </div>

          <div className="mt-7 text-4xl font-black leading-[1.05] drop-shadow-[0_6px_20px_rgba(8,15,40,0.62)] md:text-5xl">
            {currentKeyword ? (
              <>
                <span className="text-white">{promptPrefix} </span>
                <span className="text-yellow drop-shadow-[0_4px_14px_rgba(255,214,0,0.22)]">
                  {currentKeyword.word}
                </span>
                <span className="text-white">.</span>
              </>
            ) : null}
          </div>

          <p className="mt-4 text-lg font-black leading-snug text-white drop-shadow-[0_4px_16px_rgba(8,15,40,0.62)] md:text-xl">
            Tap the matching picture.
          </p>

          <div className="mt-2 h-1.5 w-14 rounded-full bg-yellow" />

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <div className="flex items-center">
              <KidPromptAudioButton
                onClick={playPromptAudio}
                disabled={!currentKeyword}
              />
            </div>

            <div className="rounded-[1.6rem] border border-white/28 bg-navy/24 p-4 shadow-[0_14px_28px_rgba(8,15,40,0.16)] backdrop-blur-[2px]">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-linear-to-br from-[#6550d8] to-[#332d70]">
                  <Trophy className="h-7 w-7 fill-yellow text-yellow" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-white/65">
                    Score
                  </div>

                  <div className="mt-1 text-3xl font-black leading-none text-white">
                    {exerciseScore} / {total}
                  </div>

                  <div className="mt-3 h-3 rounded-full bg-white/12 p-1">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-yellow to-orange transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {hasAnswered ? (
            <div
              className={[
                "mt-5 flex items-center gap-3 rounded-[1.4rem] px-4 py-3 text-base font-black shadow-[0_12px_24px_rgba(0,0,0,0.12)]",
                isAnswerCorrect
                  ? "bg-[#eaffec] text-[#2B9348]"
                  : "bg-[#fff0f4] text-[#D90429]",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-white",
                  isAnswerCorrect ? "bg-[#2B9348]" : "bg-[#D90429]",
                ].join(" ")}
              >
                {isAnswerCorrect ? (
                  <Check className="h-5 w-5 stroke-4" />
                ) : (
                  <X className="h-5 w-5 stroke-4" />
                )}
              </div>

              <span>
                {isAnswerCorrect
                  ? "Bravo !"
                  : `C'était ${currentKeyword?.word || ""}.`}
              </span>
            </div>
          ) : null}

          <div className="mt-auto flex justify-center pt-6">
            <button
              type="button"
              onClick={onNextExercise}
              disabled={exerciseFinished}
              className={[
                "inline-flex items-center justify-center gap-3",
                kidBlueButton3dClass,
                "px-7 py-3.5 text-lg md:text-xl",
                exerciseFinished ? "cursor-not-allowed opacity-60" : "",
              ].join(" ")}
            >
              <ArrowRight className="h-5 w-5" />
              {exerciseFinished ? "Terminé" : "Next Image"}
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="relative overflow-hidden p-3">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,214,102,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(76,201,240,0.16),transparent_34%)]" />

        <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {exerciseChoices.map((keyword) => {
            const isCorrect = answeredId && keyword.id === currentKeyword?.id;
            const isChosen = answeredId === keyword.id;
            const showWrong = isChosen && !isCorrect;
            const showNotOwnedMask =
              isNegativeKeyword(keyword) && !showWrong && !isCorrect;

            return (
              <button
                key={keyword.id}
                type="button"
                onClick={() => onChooseExercise(keyword)}
                disabled={exerciseFinished}
                className={[
                  "group relative aspect-[1.08/1] overflow-hidden rounded-[2.4rem] border-[3px] border-white bg-white/92 p-4 shadow-[0_18px_42px_rgba(31,92,153,0.13)] transition duration-200",
                  "hover:-translate-y-1 hover:shadow-[0_26px_58px_rgba(31,92,153,0.18)]",
                  isCorrect
                    ? "ring-4 ring-[#62df33] shadow-[0_0_0_10px_rgba(98,223,51,0.18),0_26px_58px_rgba(31,92,153,0.18)]"
                    : "",
                  showWrong
                    ? "ring-4 ring-[#ff6f91] shadow-[0_0_0_10px_rgba(255,111,145,0.16),0_26px_58px_rgba(31,92,153,0.18)]"
                    : "",
                ].join(" ")}
              >
                <div
                  className="absolute inset-4 rounded-[1.9rem] border-[3px] border-white/90"
                  style={{
                    background: keyword.color,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.38), 0 18px 34px ${keyword.shadow}`,
                  }}
                >
                  {showNotOwnedMask ? (
                    <div className="absolute inset-0 z-10 rounded-[1.7rem] bg-white/14" />
                  ) : null}

                  {isNegativeKeyword(keyword) && !showWrong ? (
                    <NotOwnedBadge />
                  ) : null}
                </div>

                {isCorrect ? (
                  <div className="absolute right-4 top-4 z-20 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#62df33] text-white shadow-[0_16px_28px_rgba(98,223,51,0.35)]">
                    <Check className="h-8 w-8 stroke-4" />
                  </div>
                ) : null}

                {showWrong ? (
                  <div className="absolute right-4 top-4 z-20 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#ff4f73] text-white shadow-[0_16px_28px_rgba(255,79,115,0.28)]">
                    <X className="h-8 w-8 stroke-4" />
                  </div>
                ) : null}

                <div
                  className={[
                    "relative z-1 flex h-full items-center justify-center transition duration-200",
                    showNotOwnedMask
                      ? "opacity-80 grayscale contrast-110 saturate-0"
                      : "",
                  ].join(" ")}
                >
                  {renderChoiceVisual(
                    keyword.imageUrl,
                    keyword.word,
                    keyword.imageName,
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
