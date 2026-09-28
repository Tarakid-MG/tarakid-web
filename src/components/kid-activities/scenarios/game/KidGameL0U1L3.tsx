import React from "react";
import { KidGameGotOrNot } from "./components/KidGameGotOrNot";
import type { KidActivityScenarioProps } from "../types";

export const KidGameL0U1L3: React.FC<KidActivityScenarioProps> = ({
  answeredId,
  binaryChoice,
  currentKeyword,
  exerciseFinished,
  exerciseScore,
  keywordsWithAssets,
  onChooseBinaryGame,
  onNextExercise,
  pack,
}) => (
  <KidGameGotOrNot
    answeredId={answeredId}
    binaryChoice={binaryChoice}
    currentKeyword={currentKeyword}
    exerciseFinished={exerciseFinished}
    exerciseScore={exerciseScore}
    keywordsWithAssets={keywordsWithAssets}
    sentencePattern={pack.sentencePattern}
    onChoose={onChooseBinaryGame}
    onNext={onNextExercise}
  />
);
