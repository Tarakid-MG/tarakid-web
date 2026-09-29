import React from "react";
import { VocabSection } from "../../KidActivityExperienceSections";
import type { KidActivityScenarioProps } from "../types";

export const KidVocabL0U1Review: React.FC<KidActivityScenarioProps> = ({
  flippedVocabIds,
  keywordsWithAssets,
  onToggleVocabCard,
  pack,
}) => (
  <VocabSection
    flippedVocabIds={flippedVocabIds}
    isNegativeLesson={false}
    keywordsWithAssets={keywordsWithAssets}
    sentencePattern={pack.sentencePattern}
    onToggleCard={onToggleVocabCard}
    resolveVocabAudioSrc={(keyword) => {
      const audioName = keyword.imageName.replace(/\.[^.]+$/, "");
      return `/audio/toy/${audioName}.mp3`;
    }}
  />
);
