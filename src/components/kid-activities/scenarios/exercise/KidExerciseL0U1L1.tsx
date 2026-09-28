import React from "react";
import { KidExerciseHeroChoice } from "../common/KidExerciseHeroChoice";
import type { KidActivityScenarioProps } from "../types";

export const KidExerciseL0U1L1: React.FC<KidActivityScenarioProps> = (
  props,
) => (
  <KidExerciseHeroChoice
    {...props}
    resolvePromptAudioSrc={(keyword) => {
      const audioName = keyword.imageName.replace(/\.[^.]+$/, "");
      return `/audio/toy/${audioName}.mp3`;
    }}
    resolvePromptPrefix={() => "It's"}
  />
);
