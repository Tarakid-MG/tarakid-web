import React, { useMemo } from "react";
import {
  ArrowRight,
  Check,
  HelpCircle,
  Search,
  Sparkles,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import type { KidLessonKeywordWithAsset } from "../../../../../data/kidLessonActivities";
import { buildKeywordSentence, shuffle } from "../../../kidActivityHelpers";
import { kidYellowButton3dClass } from "../../../kidActivitySharedStyles";
import { renderKeywordVisual } from "../../../sections/shared";

interface KidGameMissingToyProps {
  answeredId: string | null;
  currentKeyword: KidLessonKeywordWithAsset | null;
  exerciseChoices: KidLessonKeywordWithAsset[];
  exerciseFinished: boolean;
  exerciseScore: number;
  keywordsWithAssets: KidLessonKeywordWithAsset[];
  sentencePattern: string;
  resolvePromptAudioSrc?: (keyword: KidLessonKeywordWithAsset) => string;
  onChoose: (keyword: KidLessonKeywordWithAsset) => void;
  onNext: () => void;
}

function playAudio(src: string) {
  const audio = new Audio(src);
  audio.play().catch(console.error);
}


export const KidGameMissingToy: React.FC<KidGameMissingToyProps> = ({
  answeredId,
  currentKeyword,
  exerciseChoices,
  exerciseFinished,
  exerciseScore,
  keywordsWithAssets,
  sentencePattern,
  resolvePromptAudioSrc,
  onChoose,
  onNext,
}) => {
  const total = keywordsWithAssets.length || 1;
  const progress = Math.round((exerciseScore / total) * 100);
  const isCorrect = Boolean(
    answeredId && currentKeyword && answeredId === currentKeyword.id,
  );

  const visibleShelfToys = useMemo(() => {
    if (!currentKeyword) return [];

    return shuffle(
      keywordsWithAssets.filter((keyword) => keyword.id !== currentKeyword.id),
    ).slice(0, 5);
  }, [currentKeyword, keywordsWithAssets]);

  const choices = useMemo(() => {
    if (!currentKeyword) return exerciseChoices.slice(0, 4);

    const merged = [
      currentKeyword,
      ...exerciseChoices.filter((keyword) => keyword.id !== currentKeyword.id),
    ];

    return shuffle(merged).slice(0, 4);
  }, [currentKeyword, exerciseChoices]);

  const sentence = currentKeyword
    ? buildKeywordSentence(sentencePattern, currentKeyword)
    : "";

  const playPromptAudio = () => {
    if (!currentKeyword) return;

    if (resolvePromptAudioSrc) {
      playAudio(resolvePromptAudioSrc(currentKeyword));
      return;
    }

    const audioName = currentKeyword.imageName.replace(/\.[^.]+$/, "");
    playAudio(`/audio/have-not-${audioName}.mp3`);
  };

  return (
    <section className="space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-[2.8rem] border-[3px] border-white bg-linear-to-br from-[#e9f9ff] via-white to-[#fff5d8] p-5 shadow-[0_18px_42px_rgba(32,42,68,0.10)] md:p-6">
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-lightBlue/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] border-[3px] border-white bg-linear-to-br from-yellow via-gold to-orange text-navy shadow-[0_12px_24px_rgba(239,191,4,0.24)]">
              <Search className="h-8 w-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange shadow-sm">
                <Sparkles className="h-4 w-4" />
                Missing Toy Hunt
              </div>

              <h2 className="mt-3 text-3xl font-black leading-tight text-navy md:text-4xl">
                Find the Missing Toy
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-navy/60 md:text-base">
                Écoute la phrase, regarde les jouets sur l’étagère, puis trouve
                le jouet que Mizy n’a pas.
              </p>
            </div>
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
                    style={{ width: `${Math.max(8, progress)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] xl:items-stretch">
        <div className="relative flex min-h-[560px] overflow-hidden rounded-[3rem] border-4 border-white bg-linear-to-br from-[#e8f8ff] via-white to-[#fff2c8] p-5 shadow-[0_22px_50px_rgba(32,42,68,0.12)] md:p-6">
          <div className="pointer-events-none absolute -left-16 -top-12 h-44 w-44 rounded-full bg-lightBlue/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 bottom-0 h-44 w-44 rounded-full bg-gold/20 blur-3xl" />

          <div className="relative flex w-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-blue">
                  Toy shelf
                </div>

                <h3 className="mt-1 text-3xl font-black leading-tight text-navy">
                  Which toy is missing?
                </h3>

                <p className="mt-2 text-sm font-bold leading-6 text-navy/55">
                  Les jouets visibles sont sur l’étagère. Trouve celui qui
                  manque.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue">
                <HelpCircle className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 rounded-[2.6rem] border-4 border-white bg-linear-to-br from-[#c9effb] via-[#dff8ff] to-[#fff7d1] p-5 shadow-[inset_0_2px_0_rgba(255,255,255,0.7),0_18px_34px_rgba(32,42,68,0.10)]">
              <div className="rounded-[2.2rem] border-4 border-white bg-white/72 p-5 shadow-[0_16px_30px_rgba(32,42,68,0.08)]">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {visibleShelfToys.map((keyword) => (
                    <div
                      key={keyword.id}
                      className="relative flex min-h-[145px] items-center justify-center rounded-4xl border-[3px] border-white bg-white shadow-[0_12px_26px_rgba(32,42,68,0.08)]"
                    >
                      <div
                        className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.7rem] border-4 border-white shadow-[0_8px_0_rgba(0,0,0,0.08)]"
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

                  <div className="relative flex min-h-[145px] items-center justify-center rounded-4xl border-4 border-dashed border-orange/45 bg-orange/10 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.3)]">
                    <div className="text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/80 text-4xl font-black text-orange shadow-[0_12px_24px_rgba(32,42,68,0.10)]">
                        ?
                      </div>
                      <div className="mt-3 rounded-full bg-white/85 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-orange shadow-sm">
                        Missing
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-20 mx-auto mt-5 max-w-xl rounded-4xl border-[3px] border-white bg-white/88 px-6 py-4 text-center shadow-[0_16px_30px_rgba(32,42,68,0.10)] backdrop-blur-sm">
                <p className="text-2xl font-black text-navy md:text-3xl">
                  {sentence}
                </p>

                <p className="mt-1 text-sm font-bold text-navy/55">
                  Tap the missing toy!
                </p>
              </div>
            </div>

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

                <span>
                  {isCorrect
                    ? "Bravo ! You found the missing toy!"
                    : `Try again next time. It was ${currentKeyword?.word || ""}.`}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative flex min-h-[560px] overflow-hidden rounded-[3rem] border-4 border-white bg-linear-to-br from-white via-[#f5fcff] to-[#fff8df] p-5 shadow-[0_18px_42px_rgba(32,42,68,0.10)] md:p-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-lightBlue/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-gold/18 blur-3xl" />

          <div className="relative flex w-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-orange">
                  Choose
                </div>

                <h3 className="mt-1 text-2xl font-black leading-tight text-navy md:text-3xl">
                  Find the missing toy
                </h3>

                <p className="mt-2 text-sm font-bold leading-6 text-navy/55">
                  Tape sur le jouet que Mizy n’a pas.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow text-orange">
                <Trophy className="h-6 w-6 fill-current" />
              </div>
            </div>

            <div className="relative z-10 mt-6 grid grid-cols-2 gap-4 md:grid-cols-2">
              {choices.map((keyword) => {
                const isChosen = answeredId === keyword.id;
                const isCurrentCorrect =
                  currentKeyword && keyword.id === currentKeyword.id;
                const showCorrect = answeredId && isCurrentCorrect;
                const showWrong = isChosen && !isCurrentCorrect;

                return (
                  <button
                    key={keyword.id}
                    type="button"
                    onClick={() => onChoose(keyword)}
                    disabled={Boolean(answeredId) || exerciseFinished}
                    className={[
                      "group relative rounded-4xl border-[3px] border-white bg-white p-3 text-center shadow-[0_14px_30px_rgba(32,42,68,0.09)] transition-all",
                      answeredId || exerciseFinished
                        ? "cursor-default"
                        : "hover:-translate-y-1 hover:shadow-[0_20px_38px_rgba(32,42,68,0.13)]",
                      showCorrect ? "ring-4 ring-[#7AE582]" : "",
                      showWrong ? "ring-4 ring-[#FF8FAB]" : "",
                    ].join(" ")}
                  >
                    {(showCorrect || showWrong) && (
                      <div
                        className={[
                          "absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-white shadow-[0_8px_16px_rgba(32,42,68,0.18)]",
                          showCorrect ? "bg-[#62df33]" : "bg-[#ff4f73]",
                        ].join(" ")}
                      >
                        {showCorrect ? (
                          <Check className="h-5 w-5 stroke-4" />
                        ) : (
                          <X className="h-5 w-5 stroke-4" />
                        )}
                      </div>
                    )}

                    <div
                      className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-[1.8rem] border-4 border-white shadow-[0_8px_0_rgba(0,0,0,0.08)] transition group-hover:scale-105"
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

                    <div className="mt-3 truncate text-base font-black capitalize text-navy">
                      {keyword.word}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-6">
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
                {exerciseFinished ? "Terminé" : "Next Toy"}
                <Sparkles className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
