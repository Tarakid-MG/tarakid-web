import React from "react";
import { KidLuckySpinGame } from "./components/KidLuckySpinGame";
import type { KidActivityScenarioProps } from "../types";

export const KidGameL0U2L2: React.FC<KidActivityScenarioProps> = ({
  activeSoundId,
  keywordsWithAssets,
  matchedSoundIds,
  onResetGame,
  onSelectSound,
  onSelectToy,
  selectedToyId,
  soundGameToys,
  soundPrompts,
}) => (
  <KidLuckySpinGame
    activeSoundId={activeSoundId}
    keywordsWithAssets={keywordsWithAssets}
    matchedSoundIds={matchedSoundIds}
    resolveSoundAudioSrc={(keyword) => {
      return `/audio/pronouns/${keyword.id}.mp3`;
    }}
    selectedToyId={selectedToyId}
    soundGameToys={soundGameToys}
    soundPrompts={soundPrompts}
    onReset={onResetGame}
    onSelectSound={onSelectSound}
    onSelectToy={onSelectToy}
  />
);
