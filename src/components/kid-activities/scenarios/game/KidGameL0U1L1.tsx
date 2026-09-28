import React from "react";
import { KidBoxGame } from "./components/KidBoxGame";
import type { KidActivityScenarioProps } from "../types";

export const KidGameL0U1L1: React.FC<KidActivityScenarioProps> = ({
  answeredId,
  boxChoices,
  boxOpened,
  currentKeyword,
  exerciseIndex,
  keywordsWithAssets,
  onBoxChoose,
  onOpenBox,
  pack,
}) => {
  if (!currentKeyword) return null;

  return (
    <KidBoxGame
      answeredId={answeredId}
      boxChoices={boxChoices}
      boxOpened={boxOpened}
      currentKeyword={currentKeyword}
      exerciseIndex={exerciseIndex}
      keywordsWithAssets={keywordsWithAssets}
      pack={pack}
      onChoose={onBoxChoose}
      onOpenBox={onOpenBox}
    />
  );
};
