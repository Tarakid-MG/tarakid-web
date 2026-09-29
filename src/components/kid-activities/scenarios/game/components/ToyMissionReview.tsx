import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  HelpCircle,
  PackageOpen,
  Sparkles,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import type { KidLessonKeywordWithAsset } from "../../../../../data/kidLessonActivities";
import { shuffle } from "../../../kidActivityHelpers";
import { kidYellowButton3dClass } from "../../../kidActivitySharedStyles";
import { renderKeywordVisual } from "../../../../../components/kid-activities/sections/shared";

type ReviewMissionType = "what_is_it" | "ive_got" | "havent_got";

interface ToyMissionReviewProps {
  answeredId: string | null;
  currentKeyword: KidLessonKeywordWithAsset | null;
  exerciseChoices: KidLessonKeywordWithAsset[];
  exerciseFinished: boolean;
  exerciseScore: number;
  keywordsWithAssets: KidLessonKeywordWithAsset[];
  onChoose: (keyword: KidLessonKeywordWithAsset) => void;
  onNext: () => void;
}

const CORRECT_AUDIO = "/audio/feedback/correct.mp3";
const WRONG_AUDIO = "/audio/feedback/wrong.mp3";
const WIN_AUDIO = "/audio/feedback/win.mp3";

const missionConfig: Record<
  ReviewMissionType,
  {
    label: string;
    title: string;
    question: string;
    instruction: string;
    pattern: string;
    accent: string;
  }
> = {
  what_is_it: {
    label: "Mission 1",
    title: "What is it?",
    question: "What is it?",
    instruction: "Listen and choose the right sentence.",
    pattern: "It's a {word}.",
    accent: "text-blue",
  },
  ive_got: {
    label: "Mission 2",
    title: "What have you got?",
    question: "What have you got?",
    instruction: "Listen and choose what you have got.",
    pattern: "I've got a {word}.",
    accent: "text-orange",
  },
  havent_got: {
    label: "Mission 3",
    title: "Find the missing toy",
    question: "I haven't got...",
    instruction: "Listen and find the missing toy.",
    pattern: "I haven't got a {word}.",
    accent: "text-[#D90429]",
  },
};

function buildSentence(pattern: string, word: string) {
  return pattern.replace("{word}", word);
}

function isMissionOneEligible(keyword: KidLessonKeywordWithAsset) {
  return keyword.id !== "blocks";
}

function playAudio(src: string) {
  const audio = new Audio(src);
  audio.play().catch(console.error);
  return audio;
}

function playAudioSequence(sources: string[]) {
  if (!sources.length) return;

  const [first, ...rest] = sources;
  const audio = playAudio(first);

  if (!rest.length) return;

  audio.addEventListener(
    "ended",
    () => {
      playAudioSequence(rest);
    },
    { once: true },
  );
}

function getKeywordAudioName(keyword: KidLessonKeywordWithAsset) {
  return keyword.imageName.replace(/\.[^.]+$/, "");
}

function renderBigToy(keyword: KidLessonKeywordWithAsset) {
  return (
    <div
      className="mx-auto flex h-52 w-52 items-center justify-center overflow-hidden rounded-[2.4rem] border-[5px] border-white shadow-[0_12px_0_rgba(0,0,0,0.08)] md:h-60 md:w-60"
      style={{
        background: keyword.color,
        boxShadow: `0 22px 34px ${keyword.shadow}`,
      }}
    >
      {renderKeywordVisual(
        keyword,
        "text-5xl",
        "h-full w-full object-contain p-5",
      )}
    </div>
  );
}

export const ToyMissionReview: React.FC<ToyMissionReviewProps> = ({
  answeredId,
  currentKeyword,
  exerciseChoices,
  exerciseFinished,
  exerciseScore,
  keywordsWithAssets,
  onChoose,
  onNext,
}) => {
  const [listenedKeywordId, setListenedKeywordId] = useState<string | null>(null);
  const lastFeedbackKeyRef = useRef<string | null>(null);
  const lastWinKeyRef = useRef<string | null>(null);
  const missionByKeywordId = useMemo(() => {
    const eligibleForMissionOne = shuffle(
      keywordsWithAssets.filter(isMissionOneEligible).map((keyword) => keyword.id),
    );
    const excludedFromMissionOne = shuffle(
      keywordsWithAssets
        .filter((keyword) => !isMissionOneEligible(keyword))
        .map((keyword) => keyword.id),
    );
    const missionOneCount = Math.max(
      1,
      Math.floor(keywordsWithAssets.length / 3),
    );
    const missionOneIds = new Set(
      eligibleForMissionOne.slice(0, missionOneCount),
    );
    const remainingIds = shuffle([
      ...eligibleForMissionOne.slice(missionOneCount),
      ...excludedFromMissionOne,
    ]);
    const missions: Record<string, ReviewMissionType> = {};

    missionOneIds.forEach((keywordId) => {
      missions[keywordId] = "what_is_it";
    });

    remainingIds.forEach((keywordId, index) => {
      missions[keywordId] = index % 2 === 0 ? "ive_got" : "havent_got";
    });

    return missions;
  }, [keywordsWithAssets]);

  const missionType = currentKeyword
    ? missionByKeywordId[currentKeyword.id] || "what_is_it"
    : "what_is_it";
  const config = missionConfig[missionType];
  const hasListened = listenedKeywordId === currentKeyword?.id;

  const total = keywordsWithAssets.length || 1;
  const progress = Math.round((exerciseScore / total) * 100);

  const correctSentence = currentKeyword
    ? buildSentence(config.pattern, currentKeyword.word)
    : "";

  const isCorrect = Boolean(
    answeredId && currentKeyword && answeredId === currentKeyword.id,
  );

  const visibleShelfToys = useMemo(() => {
    if (!currentKeyword) return [];

    return shuffle(
      keywordsWithAssets.filter((keyword) => keyword.id !== currentKeyword.id),
    ).slice(0, 5);
  }, [currentKeyword, keywordsWithAssets]);

  const visibleChoices = useMemo(() => {
    if (!currentKeyword) return exerciseChoices.slice(0, 3);

    const missionPool =
      missionType === "what_is_it"
        ? exerciseChoices.filter(isMissionOneEligible)
        : exerciseChoices;

    const otherChoices = shuffle(
      missionPool.filter((keyword) => keyword.id !== currentKeyword.id),
    ).slice(0, 2);

    const currentChoice =
      missionType === "what_is_it" && !isMissionOneEligible(currentKeyword)
        ? []
        : [currentKeyword];

    return shuffle([...currentChoice, ...otherChoices]).slice(0, 3);
  }, [currentKeyword, exerciseChoices, missionType]);

  useEffect(() => {
    if (!answeredId || !currentKeyword) return;

    const feedbackKey = `${currentKeyword.id}:${answeredId}`;
    if (lastFeedbackKeyRef.current === feedbackKey) return;

    lastFeedbackKeyRef.current = feedbackKey;
    playAudio(isCorrect ? CORRECT_AUDIO : WRONG_AUDIO);
  }, [answeredId, currentKeyword, isCorrect]);

  useEffect(() => {
    if (!exerciseFinished || !answeredId || !currentKeyword || !isCorrect) return;

    const winKey = `${currentKeyword.id}:${exerciseScore}:${total}`;
    if (lastWinKeyRef.current === winKey) return;

    lastWinKeyRef.current = winKey;
    playAudio(WIN_AUDIO);
  }, [answeredId, currentKeyword, exerciseFinished, exerciseScore, isCorrect, total]);

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

    setListenedKeywordId(currentKeyword.id);

    const audioName = getKeywordAudioName(currentKeyword);
    const sources =
      missionType === "what_is_it"
        ? ["/audio/question/what-is-it.mp3"]
        : missionType === "ive_got"
          ? ["/audio/question/what-have-you-got.mp3"]
          : [`/audio/have-not/have-not-${audioName}.mp3`];

    playAudioSequence(sources);
  };

  const playChoiceAudio = (keyword: KidLessonKeywordWithAsset) => {
    const audioName = getKeywordAudioName(keyword);

    if (missionType === "what_is_it") {
      playAudio(`/audio/toy/${audioName}.mp3`);
      return;
    }

    if (missionType === "ive_got") {
      playAudio(`/audio/got/got-${audioName}.mp3`);
      return;
    }

    playAudio(`/audio/have-not/have-not-${audioName}.mp3`);
  };
  const handleChoose = (keyword: KidLessonKeywordWithAsset) => {
    if (answeredId || exerciseFinished) return;

    if (!hasListened) {
      playPromptAudio();
      return;
    }

    onChoose(keyword);
  };

  return (
    <section className="space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-[2.8rem] border-[3px] border-white bg-linear-to-br from-[#e9f9ff] via-white to-[#fff5d8] p-5 shadow-[0_18px_42px_rgba(32,42,68,0.10)] md:p-6">
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-lightBlue/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 animate-pulse items-center justify-center rounded-[1.4rem] border-[3px] border-white bg-linear-to-br from-yellow via-gold to-orange text-navy shadow-[0_12px_24px_rgba(239,191,4,0.24)]">
              <PackageOpen className="h-8 w-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange shadow-sm">
                <Sparkles className="h-4 w-4" />
                Toy Mission Review
              </div>

              <h2 className="mt-3 text-3xl font-black leading-tight text-navy md:text-4xl">
                Listen and Choose
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-navy/60 md:text-base">
                Révise les jouets avec : It&apos;s a..., I&apos;ve got..., et I
                haven&apos;t got...
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                    style={{ width: `${Math.max(8, progress)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] xl:items-stretch">
        <div className="relative flex min-h-[580px] overflow-hidden rounded-[3rem] border-4 border-white bg-linear-to-br from-[#e8f8ff] via-white to-[#fff2c8] p-5 shadow-[0_22px_50px_rgba(32,42,68,0.12)] md:p-6">
          <div className="pointer-events-none absolute -left-16 -top-12 h-44 w-44 rounded-full bg-lightBlue/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 bottom-0 h-44 w-44 rounded-full bg-gold/20 blur-3xl" />

          <div className="relative flex w-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={`text-[11px] font-black uppercase tracking-[0.18em] ${config.accent}`}>
                  {config.label}
                </div>

                <h3 className="mt-1 text-3xl font-black leading-tight text-navy">
                  {config.title}
                </h3>

                <p className="mt-2 text-sm font-bold leading-6 text-navy/55">
                  {config.instruction}
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue">
                <HelpCircle className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 flex flex-1 items-center justify-center rounded-[2.6rem] border-4 border-white bg-white/65 p-5 shadow-[0_16px_30px_rgba(32,42,68,0.08)]">
              {currentKeyword ? (
                missionType === "havent_got" ? (
                  <div className="w-full">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {visibleShelfToys.map((keyword) => (
                        <div
                          key={keyword.id}
                          className="relative flex min-h-[135px] items-center justify-center rounded-4xl border-[3px] border-white bg-white shadow-[0_12px_26px_rgba(32,42,68,0.08)]"
                        >
                          <div
                            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.6rem] border-4 border-white shadow-[0_8px_0_rgba(0,0,0,0.08)]"
                            style={{
                              background: keyword.color,
                              boxShadow: `0 14px 22px ${keyword.shadow}`,
                            }}
                          >
                            {renderKeywordVisual(
                              keyword,
                              "text-3xl",
                              "h-full w-full object-contain p-3",
                            )}
                          </div>

                          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#62df33] text-white shadow-[0_8px_16px_rgba(32,42,68,0.12)]">
                            <Check className="h-4 w-4 stroke-4" />
                          </div>
                        </div>
                      ))}

                      <div className="relative flex min-h-[135px] items-center justify-center rounded-4xl border-4 border-dashed border-orange/45 bg-orange/10">
                        <div className="text-center">
                          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/85 text-4xl font-black text-orange shadow-[0_12px_24px_rgba(32,42,68,0.10)]">
                            ?
                          </div>
                          <div className="mt-3 rounded-full bg-white/85 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-orange shadow-sm">
                            Missing
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mx-auto mt-5 max-w-xl rounded-4xl border-[3px] border-white bg-white/90 px-6 py-4 text-center shadow-[0_16px_30px_rgba(32,42,68,0.10)]">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <p className="text-2xl font-black text-navy md:text-3xl">
                          {correctSentence}
                        </p>
                        <button
                          type="button"
                          onClick={playPromptAudio}
                          disabled={!currentKeyword}
                          className="inline-flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white bg-linear-to-r from-yellow to-orange text-navy shadow-[0_10px_0_rgba(116,62,0,0.24)] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_5px_0_rgba(116,62,0,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Listen to ${correctSentence}`}
                        >
                          <Volume2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    {renderBigToy(currentKeyword)}

                    <div className="mx-auto mt-6 max-w-xl rounded-4xl border-[3px] border-white bg-white/90 px-6 py-4 text-center shadow-[0_16px_30px_rgba(32,42,68,0.10)]">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <p className="text-2xl font-black text-navy md:text-3xl">
                          {config.question}
                        </p>
                        {(missionType === "what_is_it" ||
                          missionType === "ive_got" ||
                          missionType === "havent_got") && (
                          <button
                            type="button"
                            onClick={playPromptAudio}
                            disabled={!currentKeyword}
                            className="inline-flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white bg-linear-to-r from-yellow to-orange text-navy shadow-[0_10px_0_rgba(116,62,0,0.24)] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_5px_0_rgba(116,62,0,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={`Listen to ${config.question}`}
                          >
                            <Volume2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ) : null}
            </div>

            {!hasListened && !answeredId ? (
              <div className="mt-5 rounded-[1.6rem] border-2 border-white bg-yellow px-5 py-3 text-center text-base font-black text-navy shadow-[0_14px_26px_rgba(255,183,3,0.24)]">
                🔊 Listen first
              </div>
            ) : null}

            {answeredId ? (
              <div
                className={[
                  "mt-5 flex items-center justify-center gap-3 rounded-[1.8rem] px-5 py-4 text-lg font-black shadow-[0_12px_22px_rgba(32,42,68,0.12)]",
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

                <span>{isCorrect ? "✅ Bravo!" : "🚫 Try again!"}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative flex min-h-[580px] overflow-hidden rounded-[3rem] border-4 border-white bg-linear-to-br from-white via-[#f5fcff] to-[#fff8df] p-5 shadow-[0_18px_42px_rgba(32,42,68,0.10)] md:p-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-lightBlue/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-gold/18 blur-3xl" />

          <div className="relative flex w-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-orange">
                  Choose
                </div>

                <h3 className="mt-1 text-2xl font-black leading-tight text-navy md:text-3xl">
                  {missionType === "havent_got"
                    ? "Find the missing toy"
                    : "Choose the right answer"}
                </h3>

                <p className="mt-2 text-sm font-bold leading-6 text-navy/55">
                  Maximum 3 choix. Écoute d’abord, puis réponds.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow text-orange">
                <Trophy className="h-6 w-6 fill-current" />
              </div>
            </div>

            <div className="relative z-10 mt-6 grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-2">
              {visibleChoices.map((keyword) => {
                const isChosen = answeredId === keyword.id;
                const isCurrentCorrect =
                  currentKeyword && keyword.id === currentKeyword.id;
                const showCorrect = answeredId && isCurrentCorrect;
                const showWrong = isChosen && !isCurrentCorrect;
                const isDisabled = Boolean(answeredId) || exerciseFinished;

                const choiceText =
                  missionType === "havent_got"
                    ? keyword.word
                    : buildSentence(config.pattern, keyword.word);

                return (
                  <button
                    key={keyword.id}
                    type="button"
                    onClick={() => handleChoose(keyword)}
                    disabled={isDisabled}
                    className={[
                      "group relative rounded-[2.2rem] border-4 border-white bg-white p-4 text-left shadow-[0_16px_34px_rgba(32,42,68,0.10)] transition-all",
                      isDisabled
                        ? "cursor-default"
                        : "hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(32,42,68,0.15)]",
                      showCorrect ? "ring-4 ring-[#7AE582] animate-bounce" : "",
                      showWrong ? "ring-4 ring-[#FF8FAB] animate-pulse" : "",
                      !hasListened && !answeredId ? "opacity-70" : "",
                    ].join(" ")}
                  >
                    {(showCorrect || showWrong) && (
                      <div
                        className={[
                          "absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-white shadow-[0_10px_18px_rgba(32,42,68,0.18)]",
                          showCorrect ? "bg-[#62df33]" : "bg-[#ff4f73]",
                        ].join(" ")}
                      >
                        {showCorrect ? (
                          <Check className="h-6 w-6 stroke-4" />
                        ) : (
                          <X className="h-6 w-6 stroke-4" />
                        )}
                      </div>
                    )}

                    {missionType === "what_is_it" || missionType === "ive_got" ? (
                      <div className="flex items-center gap-4 pr-12">
                        <div className="min-w-0 flex-1">
                          <div className="text-2xl font-black leading-tight text-navy">
                            {choiceText}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            playChoiceAudio(keyword);
                          }}
                          disabled={isDisabled}
                          className="relative z-20 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-linear-to-r from-[#c9effb] to-lightBlue text-blue shadow-[0_10px_18px_rgba(32,42,68,0.10)] transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-70"
                          aria-label={`Listen to ${choiceText}`}
                        >
                          <Volume2 className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 pr-12">
                        <div
                          className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1.8rem] border-4 border-white shadow-[0_8px_0_rgba(0,0,0,0.08)] transition group-hover:scale-105"
                          style={{
                            background: keyword.color,
                            boxShadow: `0 16px 26px ${keyword.shadow}`,
                          }}
                        >
                          {renderKeywordVisual(
                            keyword,
                            "text-4xl",
                            "h-full w-full object-contain p-3",
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-2xl font-black leading-tight text-navy">
                            {choiceText}
                          </div>
                        </div>

                      </div>
                    )}

                    {showCorrect ? (
                      <div className="pointer-events-none absolute -top-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-yellow px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-navy shadow-[0_10px_20px_rgba(255,183,3,0.24)]">
                        ⭐ Star!
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={onNext}
                disabled={exerciseFinished}
                className={[
                  "inline-flex w-full items-center justify-center gap-3",
                  kidYellowButton3dClass,
                  "px-7 py-4 text-xl",
                  exerciseFinished ? "cursor-not-allowed opacity-60" : "",
                ].join(" ")}
              >
                <ArrowRight className="h-5 w-5" />
                {exerciseFinished ? "Terminé" : "Next Mission"}
                <Sparkles className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
