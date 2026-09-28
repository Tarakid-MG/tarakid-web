import React from "react";
import { Volume2 } from "lucide-react";
import type { KidLessonKeywordWithAsset } from "../../../../data/kidLessonActivities";
import { VocabSection } from "../../KidActivityExperienceSections";
import { renderKeywordVisual } from "../../sections/shared";
import type { KidActivityScenarioProps } from "../types";

function playAudio(src: string) {
  const audio = new Audio(src);
  audio.play().catch(console.error);
}

function resolvePronounAudioSrc(keyword: KidLessonKeywordWithAsset) {
  return `/audio/pronouns/${keyword.id}.mp3`;
}

const feelingSentences = [
  { id: "i-am-happy", subjectId: "i", mood: "happy", sentence: "I am happy." },
  { id: "you-are-sad", subjectId: "you", mood: "sad", sentence: "You are sad." },
  { id: "he-is-happy", subjectId: "he", mood: "happy", sentence: "He is happy." },
  { id: "she-is-sad", subjectId: "she", mood: "sad", sentence: "She is sad." },
  { id: "it-is-happy", subjectId: "it", mood: "happy", sentence: "It is happy." },
] as const;

const familySentences = [
  { id: "ive-got-a-sister", sentence: "I've got a sister." },
  { id: "ive-got-a-brother", sentence: "I've got a brother." },
  { id: "i-havent-got-a-sister", sentence: "I haven't got a sister." },
  { id: "i-havent-got-a-brother", sentence: "I haven't got a brother." },
] as const;

export const KidVocabL0U2L2: React.FC<KidActivityScenarioProps> = ({
  flippedVocabIds,
  keywordsWithAssets,
  onToggleVocabCard,
}) => (
  <section className="space-y-8">
    <div>
      <div className="mb-4 rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-blue shadow-sm">
        Pronouns
      </div>

      <VocabSection
        flippedVocabIds={flippedVocabIds}
        isNegativeLesson={false}
        keywordsWithAssets={keywordsWithAssets}
        sentencePattern="{word}"
        onToggleCard={onToggleVocabCard}
        resolveVocabAudioSrc={resolvePronounAudioSrc}
      />
    </div>

    <div>
      <div className="mb-4 rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-orange shadow-sm">
        Feelings Sentences
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {feelingSentences.map((example) => {
          const keyword = keywordsWithAssets.find((item) => item.id === example.subjectId);
          if (!keyword) return null;

          return (
            <button
              key={example.id}
              type="button"
              onClick={() => playAudio(`/audio/pronouns/${example.id}.mp3`)}
              className="group overflow-hidden rounded-[2.1rem] border-[4px] border-white bg-white p-5 text-left shadow-[0_18px_40px_rgba(32,42,68,0.10)] transition hover:-translate-y-1"
            >
              <div
                className="flex h-32 items-center justify-center rounded-[1.6rem] border-[4px] border-white"
                style={{
                  background: keyword.color,
                  boxShadow: `0 16px 26px ${keyword.shadow}`,
                }}
              >
                {renderKeywordVisual(keyword, "text-5xl", "h-full w-full object-contain p-5")}
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="text-xl font-black text-navy">{example.sentence}</div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue text-white shadow-sm">
                  <Volume2 className="h-5 w-5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>

    <div>
      <div className="mb-4 rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-pink-500 shadow-sm">
        Family Sentences
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {familySentences.map((example) => (
          <button
            key={example.id}
            type="button"
            onClick={() => playAudio(`/audio/pronouns/${example.id}.mp3`)}
            className="flex items-center justify-between gap-3 rounded-[1.8rem] border-[4px] border-white bg-white px-5 py-4 text-left shadow-[0_14px_30px_rgba(32,42,68,0.08)] transition hover:-translate-y-0.5"
          >
            <span className="text-lg font-black text-navy">{example.sentence}</span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange text-white shadow-sm">
              <Volume2 className="h-5 w-5" />
            </span>
          </button>
        ))}
      </div>
    </div>
  </section>
);
