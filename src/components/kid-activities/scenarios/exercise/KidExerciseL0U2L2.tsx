import React, { useEffect, useRef } from "react";
import { ArrowRight, Check, Headphones, Sparkles, Volume2, X } from "lucide-react";
import type { KidLessonKeywordWithAsset } from "../../../../data/kidLessonActivities";
import { kidBlueButton3dClass } from "../../kidActivitySharedStyles";
import { renderKeywordVisual } from "../../sections/shared";
import type { KidActivityScenarioProps } from "../types";

const CORRECT_AUDIO = "/audio/feedback/correct.mp3";
const WRONG_AUDIO = "/audio/feedback/wrong.mp3";
const WIN_AUDIO = "/audio/feedback/win.mp3";

function playAudio(src: string) {
  const audio = new Audio(src);
  audio.play().catch(console.error);
}

function resolveKeywordAudioSrc(keyword: KidLessonKeywordWithAsset) {
  return `/audio/pronouns/${keyword.id}.mp3`;
}

function buildChoiceCardMeta(keyword: KidLessonKeywordWithAsset) {
  const idMap: Record<string, { title: string; mood?: string }> = {
    i: { title: "I" },
    you: { title: "You" },
    he: { title: "He" },
    she: { title: "She" },
    it: { title: "It" },
    "i-am-happy": { title: "I", mood: "Happy" },
    "you-are-sad": { title: "You", mood: "Sad" },
    "he-is-happy": { title: "He", mood: "Happy" },
    "she-is-sad": { title: "She", mood: "Sad" },
    "ive-got-a-sister": { title: "Sister" },
    "ive-got-a-brother": { title: "Brother" },
  };

  const meta = idMap[keyword.id] || { title: keyword.word };
  return {
    title: meta.title,
    mood: meta.mood || null,
  };
}

export const KidExerciseL0U2L2: React.FC<KidActivityScenarioProps> = ({
  answeredId,
  currentKeyword,
  exerciseChoices,
  exerciseFinished,
  exerciseScore,
  keywordsWithAssets,
  onChooseExercise,
  onNextExercise,
}) => {
  const total = keywordsWithAssets.length || 1;
  const progress = Math.max(8, Math.round((exerciseScore / total) * 100));
  const isCorrect = answeredId === currentKeyword?.id;
  const lastFeedbackKeyRef = useRef<string | null>(null);
  const lastWinKeyRef = useRef<string | null>(null);

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
    if (!answeredId) return;
    if (exerciseFinished) return;

    const timeoutId = window.setTimeout(() => {
      onNextExercise();
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [answeredId, exerciseFinished, onNextExercise]);

  const playPromptAudio = () => {
    if (!currentKeyword) return;
    playAudio(resolveKeywordAudioSrc(currentKeyword));
  };

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(330px,0.92fr)_minmax(0,1.58fr)]">
      <aside className="relative overflow-hidden rounded-[2.6rem] border-[3px] border-white bg-linear-to-br from-[#11224f] via-[#163161] to-[#0f1f45] p-5 text-white shadow-[0_22px_50px_rgba(18,25,68,0.28)] md:p-6">
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-white/20 bg-white/10 text-yellow">
              <Headphones className="h-6 w-6" />
            </div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-white/80">
              Who do you hear?
            </div>
          </div>

          <div className="mt-7 text-4xl font-black leading-[1.05] md:text-5xl">Listen and tap</div>

          <p className="mt-4 text-lg font-black text-white/85">
            Écoute le pronom puis choisis la bonne carte.
          </p>

          <div className="mt-6 flex items-center">
            <button
              type="button"
              onClick={playPromptAudio}
              disabled={!currentKeyword}
              className="inline-flex items-center justify-center gap-3 rounded-full border-[3px] border-white bg-linear-to-r from-yellow to-orange px-5 py-3 text-navy shadow-[0_10px_0_rgba(116,62,0,0.24)] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_5px_0_rgba(116,62,0,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-orange">
                <Volume2 className="h-5 w-5" />
              </span>
              <span className="text-lg font-black">Listen</span>
            </button>
          </div>

          <div className="mt-6 rounded-[1.8rem] border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-white/65">Score</div>
            <div className="mt-2 text-3xl font-black">
              {exerciseScore} / {total}
            </div>
            <div className="mt-3 h-3 rounded-full bg-white/12 p-1">
              <div
                className="h-full rounded-full bg-linear-to-r from-yellow to-orange transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {answeredId ? (
            <div
              className={[
                "mt-5 flex items-center gap-3 rounded-[1.4rem] px-4 py-3 text-base font-black",
                isCorrect ? "bg-[#eaffec] text-[#2B9348]" : "bg-[#fff0f4] text-[#D90429]",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-white",
                  isCorrect ? "bg-[#2B9348]" : "bg-[#D90429]",
                ].join(" ")}
              >
                {isCorrect ? <Check className="h-5 w-5 stroke-4" /> : <X className="h-5 w-5 stroke-4" />}
              </div>
              <span>{isCorrect ? "Bravo !" : `It was ${currentKeyword?.word || ""}.`}</span>
            </div>
          ) : null}

          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={onNextExercise}
              disabled={exerciseFinished}
              className={[
                "inline-flex items-center justify-center gap-3",
                kidBlueButton3dClass,
                "w-full px-7 py-4 text-xl",
                exerciseFinished ? "cursor-not-allowed opacity-60" : "",
              ].join(" ")}
            >
              <ArrowRight className="h-5 w-5" />
              {exerciseFinished ? "Finished" : "Next"}
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {exerciseChoices.map((keyword) => {
          const showCorrect = answeredId && keyword.id === currentKeyword?.id;
          const showWrong = answeredId === keyword.id && keyword.id !== currentKeyword?.id;
          const cardMeta = buildChoiceCardMeta(keyword);

          return (
            <button
              key={keyword.id}
              type="button"
              onClick={() => onChooseExercise(keyword)}
              disabled={exerciseFinished}
              className={[
                "group relative aspect-[1.08/1] overflow-hidden rounded-[2.4rem] border-[3px] border-white bg-white/92 p-4 shadow-[0_18px_42px_rgba(31,92,153,0.13)] transition duration-200",
                exerciseFinished ? "cursor-default" : "hover:-translate-y-1",
                showCorrect ? "ring-4 ring-[#62df33]" : "",
                showWrong ? "ring-4 ring-[#ff6f91]" : "",
              ].join(" ")}
            >
              <div
                className="absolute inset-4 rounded-[1.9rem] border-[3px] border-white/90"
                style={{
                  background: keyword.color,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.38), 0 18px 34px ${keyword.shadow}`,
                }}
              />

              <div className="relative z-10 flex h-[78%] items-center justify-center">
                {renderKeywordVisual(
                  keyword,
                  "text-4xl",
                  "h-full w-full object-contain p-4",
                )}
              </div>

              <div className="relative z-10 mt-3 text-center">
                <div className="text-2xl font-black text-navy">
                  {cardMeta.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
