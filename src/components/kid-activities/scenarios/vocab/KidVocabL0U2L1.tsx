import React from "react";
import type { KidLessonKeywordWithAsset } from "../../../../data/kidLessonActivities";
import { VocabSection } from "../../KidActivityExperienceSections";
import type { KidActivityScenarioProps } from "../types";

function resolveKeywordAudioSrc(keyword: KidLessonKeywordWithAsset) {
  if (keyword.id === "happy" || keyword.id === "sad") {
    return `/audio/feelings/${keyword.id}.mp3`;
  }

  return `/audio/family/${keyword.id}.mp3`;
}

const familyIds = new Set(["dad", "mom", "brother", "sister"]);
const feelingsIds = new Set(["happy", "sad"]);

const sentenceExamples = [
  {
    id: "dad-happy",
    sentence: "Dad is happy.",
  },
  {
    id: "dad-sad",
    sentence: "Dad is sad.",
  },
  {
    id: "mom-happy",
    sentence: "Mom is happy.",
  },
  {
    id: "mom-sad",
    sentence: "Mom is sad.",
  },
  {
    id: "brother-happy",
    sentence: "My brother is happy.",
  },
  {
    id: "brother-sad",
    sentence: "My brother is sad.",
  },
  {
    id: "sister-happy",
    sentence: "My sister is happy.",
  },
  {
    id: "sister-sad",
    sentence: "My sister is sad.",
  },
] as const;

function playAudio(src: string) {
  const audio = new Audio(src);
  audio.play().catch(console.error);
}

export const KidVocabL0U2L1: React.FC<KidActivityScenarioProps> = ({
  flippedVocabIds,
  keywordsWithAssets,
  onToggleVocabCard,
}) => {
  const familyKeywords = keywordsWithAssets.filter((keyword) =>
    familyIds.has(keyword.id),
  );
  const feelingKeywords = keywordsWithAssets.filter((keyword) =>
    feelingsIds.has(keyword.id),
  );

  return (
    <section className="space-y-8">
      <div>
        <div className="mb-4 rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-blue shadow-sm">
          Family
        </div>

        <VocabSection
          flippedVocabIds={flippedVocabIds}
          isNegativeLesson={false}
          keywordsWithAssets={familyKeywords}
          sentencePattern="{word}"
          onToggleCard={onToggleVocabCard}
          resolveVocabAudioSrc={resolveKeywordAudioSrc}
        />
      </div>

      <div>
        <div className="mb-4 rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-orange shadow-sm">
          Feelings
        </div>

        <VocabSection
          flippedVocabIds={flippedVocabIds}
          isNegativeLesson={false}
          keywordsWithAssets={feelingKeywords}
          sentencePattern="{word}"
          onToggleCard={onToggleVocabCard}
          resolveVocabAudioSrc={resolveKeywordAudioSrc}
        />
      </div>

      <div>
        <div className="mb-4 rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-pink-500 shadow-sm">
          Sentences
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sentenceExamples.map((example) => {
            const flipped = flippedVocabIds.includes(example.id);
            const imageSrc = `/images/lesson/feelings/${example.id}.png`;
            const handleToggleCard = () => {
              onToggleVocabCard(example.id);
              playAudio(`/audio/feelings/${example.id}.mp3`);
            };

            return (
              <div
                key={example.id}
                role="button"
                tabIndex={0}
                onClick={handleToggleCard}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleToggleCard();
                  }
                }}
                className="group cursor-pointer text-left perspective-distant"
              >
                <div
                  className={[
                    "relative h-[250px] rounded-[2.2rem] transition-transform duration-500 transform-3d md:h-[270px]",
                    flipped ? "transform-[rotateY(180deg)]" : "",
                  ].join(" ")}
                >
                  <div className="absolute inset-0 overflow-hidden rounded-[2.2rem] border-4 border-white bg-white shadow-[0_18px_40px_rgba(31,92,153,0.13)] backface-hidden">
                    <div className="absolute inset-4 rounded-[1.75rem] border-[3px] border-white/90 bg-linear-to-br from-[#fff4fb] via-white to-[#eef6ff]" />

                    <div className="relative z-10 flex h-full items-center justify-center">
                      <img
                        src={imageSrc}
                        alt={example.sentence}
                        className="h-[82%] w-[82%] object-contain drop-shadow-[0_16px_22px_rgba(32,42,68,0.16)] transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-pink-500 shadow-[0_10px_20px_rgba(32,42,68,0.10)]">
                      Tap
                    </div>
                  </div>

                  <div
                    className="absolute inset-0 overflow-hidden rounded-[2.2rem] border-4 border-white bg-pink-500 p-5 text-white shadow-[0_18px_40px_rgba(236,72,153,0.24)] backface-hidden transform-[rotateY(180deg)]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 34%), linear-gradient(180deg, rgba(236,72,153,1) 0%, rgba(190,24,93,1) 100%)",
                    }}
                  >
                    <div className="pointer-events-none absolute -bottom-10 left-0 h-24 w-40 rounded-full bg-white/12 blur-2xl" />
                    <div className="pointer-events-none absolute right-6 top-7 h-16 w-16 rounded-full bg-yellow/10 blur-2xl" />

                    <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
                      <div className="w-full rounded-3xl bg-white/16 px-4 py-5 text-2xl font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm">
                        {example.sentence}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
