import React, { useEffect, useMemo, useRef } from "react";
import {
  ArrowRight,
  Check,
  Sparkles,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import type { KidLessonKeywordWithAsset } from "../../../../../data/kidLessonActivities";
import { buildKeywordSentence, shuffle } from "../../../kidActivityHelpers";
import { kidYellowButton3dClass } from "../../../kidActivitySharedStyles";
import { renderKeywordVisual } from "../../../sections/shared";

const CORRECT_AUDIO = "/audio/feedback/correct.mp3";
const WRONG_AUDIO = "/audio/feedback/wrong.mp3";
const WIN_AUDIO = "/audio/feedback/win.mp3";

interface KidGameGotOrNotProps {
  answeredId: string | null;
  binaryChoice: "have" | "have_not" | null;
  currentKeyword: KidLessonKeywordWithAsset | null;
  exerciseFinished: boolean;
  exerciseScore: number;
  keywordsWithAssets: KidLessonKeywordWithAsset[];
  sentencePattern: string;
  onChoose: (
    keyword: KidLessonKeywordWithAsset,
    choice: "have" | "have_not",
  ) => void;
  onNext: () => void;
}

function playAudio(src: string) {
  const audio = new Audio(src);
  audio.play().catch((error) => {
    console.error("Failed to play game audio", error);
  });
}

export const KidGameGotOrNot: React.FC<KidGameGotOrNotProps> = ({
  answeredId,
  binaryChoice,
  currentKeyword,
  exerciseFinished,
  exerciseScore,
  keywordsWithAssets,
  sentencePattern,
  onChoose,
  onNext,
}) => {
  const total = keywordsWithAssets.length || 1;
  const progress = Math.max(8, Math.round((exerciseScore / total) * 100));
  const currentPossession =
    currentKeyword?.possession === "have_not" ? "have_not" : "have";
  const isCorrect = Boolean(
    answeredId &&
      currentKeyword &&
      answeredId === currentKeyword.id &&
      binaryChoice === currentPossession,
  );
  const lastFeedbackKeyRef = useRef<string | null>(null);
  const lastWinKeyRef = useRef<string | null>(null);

  const visibleChoices = useMemo(() => {
    if (!currentKeyword) return [];

    const distractors = shuffle(
      keywordsWithAssets.filter((keyword) => keyword.id !== currentKeyword.id),
    ).slice(0, 5);

    return shuffle([currentKeyword, ...distractors]).slice(0, 6);
  }, [currentKeyword, keywordsWithAssets]);

  const sentence = currentKeyword
    ? buildKeywordSentence(sentencePattern, currentKeyword)
    : "";

  useEffect(() => {
    if (!answeredId || !binaryChoice || !currentKeyword) return;

    const feedbackKey = `${currentKeyword.id}:${answeredId}:${binaryChoice}`;
    if (lastFeedbackKeyRef.current === feedbackKey) return;

    lastFeedbackKeyRef.current = feedbackKey;
    playAudio(isCorrect ? CORRECT_AUDIO : WRONG_AUDIO);
  }, [answeredId, binaryChoice, currentKeyword, isCorrect]);

  useEffect(() => {
    if (!exerciseFinished || !isCorrect || !currentKeyword) return;

    const winKey = `${currentKeyword.id}:${exerciseScore}:${total}`;
    if (lastWinKeyRef.current === winKey) return;

    lastWinKeyRef.current = winKey;
    playAudio(WIN_AUDIO);
  }, [currentKeyword, exerciseFinished, exerciseScore, isCorrect, total]);

  useEffect(() => {
    if (!answeredId || exerciseFinished) return;

    const timeoutId = window.setTimeout(() => {
      onNext();
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [answeredId, exerciseFinished, onNext]);

  const playPromptAudio = () => {
    if (!currentKeyword) return;

    const audioName = currentKeyword.imageName.replace(/\.[^.]+$/, "");
    const folder = currentPossession === "have_not" ? "have-not" : "got";
    const prefix = currentPossession === "have_not" ? "have-not-" : "got-";
    playAudio(`/audio/${folder}/${prefix}${audioName}.mp3`);
  };

  return (
    <section className="space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-[2.8rem] border-[3px] border-white bg-linear-to-br from-[#e8f8ff] via-white to-[#fff7dc] p-5 shadow-[0_18px_42px_rgba(32,42,68,0.10)] md:p-6">
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-lightBlue/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange shadow-sm">
              <Sparkles className="h-4 w-4" />
              Got Or Not
            </div>

            <h2 className="mt-3 text-3xl font-black leading-tight text-navy md:text-4xl">
              Listen and choose the right button
            </h2>

            <p className="mt-2 text-sm font-bold leading-6 text-navy/60 md:text-base">
              Écoute l&apos;audio, puis sur la bonne image touche
              {" "}
              <span className="text-[#2B9348]">✅</span>
              {" "}
              pour
              {" "}
              <span className="font-black">I&apos;ve got</span>
              {" "}
              ou
              {" "}
              <span className="text-[#D90429]">🚫</span>
              {" "}
              pour
              {" "}
              <span className="font-black">I haven&apos;t got</span>
              .
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={playPromptAudio}
              disabled={!currentKeyword}
              className="inline-flex items-center justify-center gap-3 rounded-full border-[3px] border-white bg-linear-to-r from-yellow to-orange px-5 py-3 text-navy shadow-[0_10px_0_rgba(116,62,0,0.24)] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_5px_0_rgba(116,62,0,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-orange">
                <Volume2 className="h-5 w-5" />
              </span>

              <span className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-navy/55">
                  Tap here
                </span>
                <span className="block text-lg font-black leading-none">
                  Listen
                </span>
              </span>
            </button>

            <div className="rounded-[1.6rem] border-[3px] border-white bg-white px-5 py-3 shadow-[0_10px_22px_rgba(32,42,68,0.08)]">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-navy/45">
                Score
              </div>

              <div className="mt-1 flex items-center gap-3">
                <div className="text-2xl font-black text-navy">
                  {exerciseScore} / {total}
                </div>

                <div className="h-3 w-28 rounded-full bg-slate-100 p-1">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-yellow to-orange transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2.6rem] border-4 border-white bg-linear-to-br from-[#fafdff] via-[#eefaff] to-[#fff7d7] p-5 shadow-[0_22px_50px_rgba(32,42,68,0.10)] md:p-6">
        <div className="mx-auto max-w-2xl rounded-[2rem] border-[3px] border-white bg-white/92 px-6 py-4 text-center shadow-[0_16px_30px_rgba(32,42,68,0.10)]">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <p className="text-2xl font-black text-navy md:text-3xl">{sentence}</p>
            <button
              type="button"
              onClick={playPromptAudio}
              disabled={!currentKeyword}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white bg-linear-to-r from-yellow to-orange text-navy shadow-[0_10px_0_rgba(116,62,0,0.24)] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_5px_0_rgba(116,62,0,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Listen to the sentence"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-sm font-bold text-navy/55">
            Choose the correct image and the correct button.
          </p>
        </div>

        {answeredId ? (
          <div
            className={[
              "mx-auto mt-5 flex max-w-2xl items-center justify-center gap-3 rounded-[1.8rem] px-5 py-4 text-lg font-black shadow-[0_12px_22px_rgba(32,42,68,0.12)]",
              isCorrect
                ? "bg-[#eaffec] text-[#2B9348]"
                : "bg-[#fff0f4] text-[#D90429]",
            ].join(" ")}
          >
            <div
              className={[
                "flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-white",
                isCorrect ? "bg-[#62df33]" : "bg-[#ff4f73]",
              ].join(" ")}
            >
              {isCorrect ? (
                <Check className="h-5 w-5 stroke-4" />
              ) : (
                <X className="h-5 w-5 stroke-4" />
              )}
            </div>

            <span>
              {isCorrect
                ? "Bravo !"
                : `Essaie encore au prochain. The right answer was ${currentKeyword?.word.trim() || ""}.`}
            </span>
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleChoices.map((keyword) => {
            const isChosen = answeredId === keyword.id;
            const chosenCorrectly =
              isChosen &&
              currentKeyword &&
              keyword.id === currentKeyword.id &&
              binaryChoice === currentPossession;
            const chosenWrong = isChosen && !chosenCorrectly;
            const isDisabled = Boolean(answeredId) || exerciseFinished;
            const canShowSuccess =
              answeredId &&
              currentKeyword &&
              keyword.id === currentKeyword.id &&
              isCorrect;

            return (
              <article
                key={keyword.id}
                className={[
                  "rounded-[2.2rem] border-[3px] border-white bg-white p-4 shadow-[0_16px_34px_rgba(32,42,68,0.09)] transition",
                  chosenCorrectly || canShowSuccess ? "ring-4 ring-[#7AE582]" : "",
                  chosenWrong ? "ring-4 ring-[#FF8FAB]" : "",
                ].join(" ")}
              >
                <div
                  className="flex h-40 items-center justify-center overflow-hidden rounded-[1.8rem] border-4 border-white shadow-[0_10px_0_rgba(0,0,0,0.08)]"
                  style={{
                    background: keyword.color,
                    boxShadow: `0 14px 22px ${keyword.shadow}`,
                  }}
                >
                  {renderKeywordVisual(
                    keyword,
                    "text-3xl",
                    "h-full w-full object-contain p-4",
                  )}
                </div>

                <div className="mt-3 text-center text-base font-black capitalize text-navy">
                  {keyword.word.trim()}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onChoose(keyword, "have_not")}
                    disabled={isDisabled}
                    className={[
                      "inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-white px-4 py-3 text-lg font-black shadow-[0_10px_18px_rgba(32,42,68,0.10)] transition",
                      isDisabled ? "cursor-default opacity-70" : "hover:-translate-y-0.5",
                      isChosen && binaryChoice === "have_not"
                        ? chosenCorrectly
                          ? "bg-[#eaffec] text-[#2B9348]"
                          : "bg-[#fff0f4] text-[#D90429]"
                        : "bg-[#fff6f7] text-[#D90429]",
                    ].join(" ")}
                  >
                    <span aria-hidden="true">🚫</span>
                    No
                  </button>

                  <button
                    type="button"
                    onClick={() => onChoose(keyword, "have")}
                    disabled={isDisabled}
                    className={[
                      "inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-white px-4 py-3 text-lg font-black shadow-[0_10px_18px_rgba(32,42,68,0.10)] transition",
                      isDisabled ? "cursor-default opacity-70" : "hover:-translate-y-0.5",
                      isChosen && binaryChoice === "have"
                        ? chosenCorrectly
                          ? "bg-[#eaffec] text-[#2B9348]"
                          : "bg-[#fff0f4] text-[#D90429]"
                        : "bg-[#effcf3] text-[#2B9348]",
                    ].join(" ")}
                  >
                    <span aria-hidden="true">✅</span>
                    Yes
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onNext}
            disabled={exerciseFinished}
            className={[
              "inline-flex items-center justify-center gap-3",
              kidYellowButton3dClass,
              "px-7 py-4 text-xl",
              exerciseFinished ? "cursor-not-allowed opacity-60" : "",
            ].join(" ")}
          >
            <Trophy className="h-5 w-5" />
            {exerciseFinished ? "Terminé" : "Next"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
