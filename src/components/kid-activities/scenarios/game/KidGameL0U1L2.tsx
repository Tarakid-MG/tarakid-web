import React from "react";
import { KidSoundGame } from "./components/KidSoundGame";
import type { KidActivityScenarioProps } from "../types";

export const KidGameL0U1L2: React.FC<KidActivityScenarioProps> = ({
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
  <KidSoundGame
    activeSoundId={activeSoundId}
    keywordsWithAssets={keywordsWithAssets}
    matchedSoundIds={matchedSoundIds}
    resolveSoundAudioSrc={(keyword) => {
      const audioName = keyword.imageName.replace(/\.[^.]+$/, "");
      return `/audio/got/got-${audioName}.mp3`;
    }}
    selectedToyId={selectedToyId}
    soundGameToys={soundGameToys}
    soundPrompts={soundPrompts}
    onReset={onResetGame}
    onSelectSound={onSelectSound}
    onSelectToy={onSelectToy}
  />
);
