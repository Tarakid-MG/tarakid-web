import React from "react";
import { KidExerciseHeroChoice } from "../common/KidExerciseHeroChoice";
import type { KidActivityScenarioProps } from "../types";

export const KidExerciseL0U1L2: React.FC<KidActivityScenarioProps> = (
  props,
) => (
  <KidExerciseHeroChoice
    {...props}
    resolvePromptAudioSrc={(keyword) => {
      const audioName = keyword.imageName.replace(/\.[^.]+$/, "");
      return `/audio/got/got-${audioName}.mp3`;
    }}
    resolvePromptPrefix={() => "I've got"}
  />
);
