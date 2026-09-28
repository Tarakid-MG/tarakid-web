import React from "react";
import type { KidLessonKeywordWithAsset } from "../../../data/kidLessonActivities";
import { buildKeywordSentence } from "../kidActivityHelpers";
import {
  buildKeywordStatus,
  renderVocabVisual,
  VocabNotOwnedBadge,
} from "./shared";

interface VocabSectionProps {
  flippedVocabIds: string[];
  isNegativeLesson: boolean;
  keywordsWithAssets: KidLessonKeywordWithAsset[];
  sentencePattern: string;
  onToggleCard: (keywordId: string) => void;
  resolveVocabAudioSrc?: (keyword: KidLessonKeywordWithAsset) => string;
}

export const VocabSection: React.FC<VocabSectionProps> = ({
  flippedVocabIds,
  isNegativeLesson,
  keywordsWithAssets,
  sentencePattern,
  onToggleCard,
  resolveVocabAudioSrc,
}) => (
  <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
    {keywordsWithAssets.map((keyword) => {
      const flipped = flippedVocabIds.includes(keyword.id);
      const sentence = buildKeywordSentence(sentencePattern, keyword);
      const isNegative = buildKeywordStatus(isNegativeLesson, keyword);

      const playVocabAudio = () => {
        if (!resolveVocabAudioSrc) return;

        const audio = new Audio(resolveVocabAudioSrc(keyword));
        audio.play().catch(console.error);
      };

      const handleToggleCard = () => {
        onToggleCard(keyword.id);
        playVocabAudio();
      };

      return (
        <div
          key={keyword.id}
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
              <div
                className="absolute inset-4 rounded-[1.75rem] border-[3px] border-white/90"
                style={{
                  background: keyword.color,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.38), 0 18px 30px ${keyword.shadow}`,
                }}
              />

              {isNegative ? <VocabNotOwnedBadge /> : null}

              <div className="relative z-10 flex h-full items-center justify-center">
                {renderVocabVisual(keyword, isNegative)}
              </div>

              <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue shadow-[0_10px_20px_rgba(32,42,68,0.10)]">
                Tap
              </div>
            </div>

            <div
              className="absolute inset-0 overflow-hidden rounded-[2.2rem] border-4 border-white bg-blue p-5 text-white shadow-[0_18px_40px_rgba(33,158,188,0.24)] backface-hidden transform-[rotateY(180deg)]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 34%), linear-gradient(180deg, rgba(33,158,188,1) 0%, rgba(22,132,166,1) 100%)",
              }}
            >
              <div className="pointer-events-none absolute -bottom-10 left-0 h-24 w-40 rounded-full bg-white/12 blur-2xl" />
              <div className="pointer-events-none absolute right-6 top-7 h-16 w-16 rounded-full bg-yellow/10 blur-2xl" />

              {isNegative ? <VocabNotOwnedBadge /> : null}

              <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
                <div className="text-4xl font-black capitalize leading-none text-white drop-shadow-[0_5px_14px_rgba(8,15,40,0.25)] md:text-5xl">
                  {keyword.word}
                </div>

                <div className="mt-5 w-full rounded-3xl bg-white/16 px-4 py-4 text-xl font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm">
                  {sentence}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </section>
);
