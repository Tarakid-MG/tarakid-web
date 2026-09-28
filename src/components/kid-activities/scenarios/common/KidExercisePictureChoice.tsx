import React from "react";
import { ExerciseSection } from "../../KidActivityExperienceSections";
import type { KidActivityScenarioProps } from "../types";

type KidExercisePictureChoiceProps = KidActivityScenarioProps & {
  hideChoiceLabels?: boolean;
  largeChoiceVisuals?: boolean;
  promptAudioPrefix?: string;
};

export const KidExercisePictureChoice: React.FC<KidExercisePictureChoiceProps> = ({
  answeredId,
  currentKeyword,
  exerciseChoices,
  exerciseFinished,
  exerciseScore,
  hideChoiceLabels = false,
  largeChoiceVisuals = false,
  promptAudioPrefix,
  isNegativeLesson,
  keywordsWithAssets,
  onChooseExercise,
  onNextExercise,
  pack,
}) => {
  const promptAudioSrc =
    promptAudioPrefix && currentKeyword
      ? `/audio/${promptAudioPrefix}${currentKeyword.imageName.replace(/\.[^.]+$/, "")}.mp3`
      : null;

  return (
    <ExerciseSection
      answeredId={answeredId}
      currentKeyword={currentKeyword}
      exerciseChoices={exerciseChoices}
      exerciseFinished={exerciseFinished}
      exerciseScore={exerciseScore}
      hideChoiceLabels={hideChoiceLabels}
      largeChoiceVisuals={largeChoiceVisuals}
      promptAudioSrc={promptAudioSrc}
      isNegativeLesson={isNegativeLesson}
      keywordsWithAssets={keywordsWithAssets}
      sentencePattern={pack.sentencePattern}
      onChoose={onChooseExercise}
      onNext={onNextExercise}
    />
  );
};
