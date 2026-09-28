import React from "react";
import { VocabSection } from "../../KidActivityExperienceSections";
import type { KidActivityScenarioProps } from "../types";

export const KidVocabL0U1L3: React.FC<KidActivityScenarioProps> = ({
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
      const folder = keyword.possession === "have_not" ? "have-not" : "got";
      const prefix = keyword.possession === "have_not" ? "have-not-" : "got-";
      return `/audio/${folder}/${prefix}${audioName}.mp3`;
    }}
  />
);
