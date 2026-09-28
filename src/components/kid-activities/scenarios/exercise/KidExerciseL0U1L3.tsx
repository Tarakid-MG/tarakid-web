import React from "react";
import { KidExerciseHeroChoice } from "../common/KidExerciseHeroChoice";
import type { KidActivityScenarioProps } from "../types";

export const KidExerciseL0U1L3: React.FC<KidActivityScenarioProps> = (
  props,
) => (
  <KidExerciseHeroChoice
    {...props}
    resolvePromptAudioSrc={(keyword) => {
      const audioName = keyword.imageName.replace(/\.[^.]+$/, "");
      const hasItem = keyword.possession !== "have_not";
      const folder = hasItem ? "got" : "have-not";
      const prefix = hasItem ? "got-" : "have-not-";
      return `/audio/${folder}/${prefix}${audioName}.mp3`;
    }}
    resolvePromptPrefix={(keyword) =>
      keyword.possession === "have_not" ? "I haven't got" : "I've got"
    }
  />
);
