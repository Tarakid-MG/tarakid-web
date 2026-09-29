import React from "react";
import { RotateCcw } from "lucide-react";
import type {
  KidLessonActivityPack,
  KidLessonKeywordWithAsset,
} from "../../../data/kidLessonActivities";
import { buildKeywordSentence, isNegativeKeyword } from "../kidActivityHelpers";
import {
  kidOrangeButton3dClass,
  kidSectionPanelClass,
} from "../kidActivitySharedStyles";
import type { MemoryCard } from "./shared";

interface MemoryGameSectionProps {
  keywordsWithAssets: KidLessonKeywordWithAsset[];
  matchedPairs: string[];
  memoryDeck: MemoryCard[];
  openCards: string[];
  pack: KidLessonActivityPack;
  onCardClick: (cardId: string, pairId: string) => void;
  onReset: () => void;
}

export const MemoryGameSection: React.FC<MemoryGameSectionProps> = ({
  keywordsWithAssets,
  matchedPairs,
  memoryDeck,
  openCards,
  pack,
  onCardClick,
  onReset,
}) => (
  <section className={`${kidSectionPanelClass} p-5 md:p-6`}>
    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-orange">
          Find the pairs
        </div>
        <div className="mt-1 text-3xl font-black text-navy">Memory Match</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-full border-2 border-slate-100 bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-blue shadow-sm">
          {matchedPairs.length} / {keywordsWithAssets.length} pairs
        </div>
        <button
          type="button"
          onClick={onReset}
          className={`${kidOrangeButton3dClass} flex items-center gap-2 px-4 py-3`}
        >
          <RotateCcw className="h-4 w-4" />
          Restart
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {memoryDeck.map((card) => {
        const keyword = keywordsWithAssets.find((item) => item.id === card.pairId);
        const isOpen =
          openCards.includes(card.id) || matchedPairs.includes(card.pairId);
        if (!keyword) return null;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onCardClick(card.id, card.pairId)}
            className="group aspect-square perspective-distant"
          >
            <div
              className={[
                "relative h-full w-full rounded-4xl transition-transform duration-500 transform-3d",
                isOpen ? "transform-[rotateY(180deg)]" : "",
              ].join(" ")}
            >
              <div className="absolute inset-0 flex items-center justify-center rounded-4xl border-[3px] border-white bg-blue text-5xl font-black text-white shadow-[0_14px_30px_rgba(33,158,188,0.22)] backface-hidden">
                ★
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-4xl border-[3px] border-white bg-white p-4 text-navy shadow-[0_14px_30px_rgba(32,42,68,0.12)] backface-hidden transform-[rotateY(180deg)]">
                <div
                  className="relative flex h-18 w-18 items-center justify-center overflow-hidden rounded-[1.4rem] border-4 border-white shadow-[0_10px_0_rgba(0,0,0,0.10)]"
                  style={{
                    background: keyword.color,
                    boxShadow: `0 16px 24px ${keyword.shadow}`,
                  }}
                >
                  {isNegativeKeyword(keyword) && card.kind === "emoji" && (
                    <div className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-xl font-black text-white shadow-[0_8px_16px_rgba(244,63,94,0.28)]">
                      ×
                    </div>
                  )}
                  {card.kind === "emoji" ? (
                    keyword.imageUrl ? (
                      <img
                        src={keyword.imageUrl}
                        alt={keyword.word}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-2xl font-black uppercase text-white/92">
                        {keyword.word.slice(0, 2)}
                      </span>
                    )
                  ) : (
                    "🔤"
                  )}
                </div>
                <div className="text-2xl font-black capitalize">
                  {pack.lesson === 3 && card.kind === "word"
                    ? buildKeywordSentence(pack.sentencePattern, keyword)
                    : keyword.word}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </section>
);
