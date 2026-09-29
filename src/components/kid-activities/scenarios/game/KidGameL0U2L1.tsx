import React from "react";
import { KidHideAndSeekGame } from "./components/KidHideAndSeekGame";
import type { KidActivityScenarioProps } from "../types";

export const KidGameL0U2L1: React.FC<KidActivityScenarioProps> = ({
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
  <KidHideAndSeekGame
    activeSoundId={activeSoundId}
    keywordsWithAssets={keywordsWithAssets}
    matchedSoundIds={matchedSoundIds}
    resolveSoundAudioSrc={(keyword) => {
      if (keyword.id.includes("-")) {
        return `/audio/feelings/${keyword.id}.mp3`;
      }

      return `/audio/family/${keyword.id}.mp3`;
    }}
    selectedToyId={selectedToyId}
    soundGameToys={soundGameToys}
    soundPrompts={soundPrompts}
    onReset={onResetGame}
    onSelectSound={onSelectSound}
    onSelectToy={onSelectToy}
  />
);
