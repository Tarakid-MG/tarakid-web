import React from "react";
import { ToyMissionReview } from "./components/ToyMissionReview";
import type { KidActivityScenarioProps } from "../types";

export const KidGameL0U1Review: React.FC<KidActivityScenarioProps> = ({
  answeredId,
  currentKeyword,
  exerciseChoices,
  exerciseFinished,
  exerciseScore,
  keywordsWithAssets,
  onChooseExercise,
  onNextExercise,
}) => (
  <ToyMissionReview
    answeredId={answeredId}
    currentKeyword={currentKeyword}
    exerciseChoices={exerciseChoices}
    exerciseFinished={exerciseFinished}
    exerciseScore={exerciseScore}
    keywordsWithAssets={keywordsWithAssets}
    onChoose={onChooseExercise}
    onNext={onNextExercise}
  />
);
