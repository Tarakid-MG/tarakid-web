import React, { useState, useEffect, useMemo, useRef } from "react";
import { Check, Headphones, RotateCcw, Sparkles, Volume2, X } from "lucide-react";
import type { KidLessonKeywordWithAsset } from "../../../../../data/kidLessonActivities";
import { Button } from "../../../../ui/Button";
import { Card } from "../../../../ui/Card";
import type { SoundPrompt } from "../../../sections/shared";
import { renderKeywordVisual } from "../../../sections/shared";

interface KidLuckySpinGameProps {
  activeSoundId: string | null;
  keywordsWithAssets: KidLessonKeywordWithAsset[];
  matchedSoundIds: string[];
  resolveSoundAudioSrc?: (keyword: KidLessonKeywordWithAsset) => string;
  selectedToyId: string | null;
  soundGameToys: KidLessonKeywordWithAsset[];
  soundPrompts: SoundPrompt[];
  onReset: () => void;
  onSelectSound: (soundId: string) => void;
  onSelectToy: (toyId: string) => void;
}

const WHEEL_COLORS = [
  "#FF8FAB", // pink
  "#FFB703", // orange/yellow
  "#8ECAE6", // light blue
  "#219EBC", // blue
  "#90E0EF", // teal
  "#FFB5A7", // peach
  "#D6E2E9", // lavender gray
  "#B5E2FA", // baby blue
];

export const KidLuckySpinGame: React.FC<KidLuckySpinGameProps> = ({
  activeSoundId,
  keywordsWithAssets,
  matchedSoundIds,
  resolveSoundAudioSrc,
  soundGameToys,
  soundPrompts,
  onReset,
  onSelectSound,
  onSelectToy,
}) => {
  const total = keywordsWithAssets.length || 1;
  const progress = Math.round((matchedSoundIds.length / total) * 100);

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [spinError, setSpinError] = useState<string | null>(null);
  const [wrongAnswerId, setWrongAnswerId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Wheel slices representing the items
  const slices = useMemo(() => {
    return soundPrompts.map((prompt, index) => {
      const keyword = keywordsWithAssets.find((k) => k.id === prompt.id);
      return {
        id: prompt.id,
        label: keyword?.word || prompt.id,
        color: WHEEL_COLORS[index % WHEEL_COLORS.length],
        keyword,
      };
    });
  }, [soundPrompts, keywordsWithAssets]);

  // Card choices options (shuffled keywords)
  const choices = useMemo(() => {
    return soundGameToys;
  }, [soundGameToys]);

  // Clean audio ref on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Play target sound helper
  const playTargetSound = (soundId: string) => {
    const keyword = keywordsWithAssets.find((item) => item.id === soundId);
    if (!keyword || !resolveSoundAudioSrc) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(resolveSoundAudioSrc(keyword));
    audioRef.current.play().catch(console.error);
  };

  const handleSpin = () => {
    if (isSpinning) return;

    // Pick a random prompt that has not been matched yet
    const remainingPrompts = soundPrompts.filter((p) => !matchedSoundIds.includes(p.id));
    if (remainingPrompts.length === 0) {
      setSpinError("All matched!");
      return;
    }

    setSpinError(null);
    setWrongAnswerId(null);
    setIsSpinning(true);

    const randomPrompt = remainingPrompts[Math.floor(Math.random() * remainingPrompts.length)];
    const sliceIndex = slices.findIndex((s) => s.id === randomPrompt.id);

    // Calculate rotation angle
    // Each slice is 360 / slices.length degrees
    const sliceAngle = 360 / slices.length;
    
    // We want the slice to land at the top pointer (90 degrees or 270 degrees depending on pointer placement)
    // Let's assume pointer is at 90 degrees (right side) or 270 degrees (top).
    // Let's place the pointer at the top (270 degrees).
    // The center of slice index `i` is at `(i * sliceAngle) + (sliceAngle / 2)` degrees.
    // To land slice index `i` at the top pointer (270 degrees):
    // targetRotation = 270 - sliceCenter
    const sliceCenter = (sliceIndex * sliceAngle) + (sliceAngle / 2);
    const landingAngle = 270 - sliceCenter;

    // Spin at least 4 full rotations
    const extraSpins = 360 * 4;
    const finalAngle = rotationAngle + extraSpins + (landingAngle - (rotationAngle % 360));
    setRotationAngle(finalAngle);

    // After animation ends (3s)
    setTimeout(() => {
      setIsSpinning(false);
      onSelectSound(randomPrompt.id);
      playTargetSound(randomPrompt.id);
    }, 3000);
  };

  const handleChoiceClick = (choiceId: string) => {
    if (!activeSoundId || isSpinning || matchedSoundIds.includes(choiceId)) return;

    onSelectToy(choiceId);

    if (choiceId === activeSoundId) {
      setWrongAnswerId(null);
    } else {
      setWrongAnswerId(choiceId);
      setTimeout(() => {
        setWrongAnswerId(null);
      }, 1200);
    }
  };

  const handleRestart = () => {
    setRotationAngle(0);
    setIsSpinning(false);
    setSpinError(null);
    setWrongAnswerId(null);
    onReset();
  };

  const sliceAngle = 360 / slices.length;

  return (
    <section className="space-y-6 pb-10">
      {/* Header Panel */}
      <Card
        variant="kidSection"
        className="relative overflow-hidden bg-linear-to-br from-[#eaf6ff] via-white to-[#fff7db] p-5 md:p-6"
      >
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 animate-pulse items-center justify-center rounded-[1.4rem] border-[3px] border-white bg-linear-to-br from-[#d4f3ff] via-lightBlue to-blue text-white shadow-[0_12px_24px_rgba(33,158,188,0.24)]">
              <Headphones className="h-8 w-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue shadow-sm">
                <Sparkles className="h-4 w-4" />
                Lucky Spin Game
              </div>

              <h2 className="mt-3 text-3xl font-black leading-tight text-navy md:text-4xl">
                La Roue de la Fortune
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-navy/65 md:text-base">
                Fais tourner la roue colorée, écoute le mot prononcé, puis touche la bonne carte correspondante !
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-[1.6rem] border-[3px] border-white bg-white px-5 py-3 shadow-[0_10px_22px_rgba(32,42,68,0.08)]">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-navy/45">
                Progression
              </div>

              <div className="mt-1 flex items-center gap-3">
                <div className="text-2xl font-black text-navy">
                  {matchedSoundIds.length} / {total}
                </div>

                <div className="h-3 w-28 rounded-full bg-slate-100 p-1">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-yellow to-orange transition-all duration-500"
                    style={{ width: `${Math.max(8, progress)}%` }}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleRestart}
              variant="kidOrange"
              className="px-4 py-3"
            >
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Wheel & Choices Board */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
        
        {/* Left: The Spin Wheel */}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-[2.8rem] border-[3px] border-white shadow-[0_18px_42px_rgba(32,42,68,0.08)]">
          
          <div className="relative h-[320px] w-[320px] sm:h-[380px] sm:w-[380px]">
            {/* The Pointer at the top */}
            <div className="absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-4">
              <div className="h-0 w-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-orange drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)]" />
            </div>

            {/* The Wheel SVG */}
            <div
              className="h-full w-full rounded-full border-8 border-navy/10 shadow-2xl"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transition: isSpinning ? "transform 3s cubic-bezier(0.15, 0.85, 0.35, 1)" : "none",
              }}
            >
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <g transform="translate(50,50)">
                  {slices.map((slice, i) => {
                    const startAngle = i * sliceAngle;
                    const endAngle = (i + 1) * sliceAngle;
                    
                    // Arc math
                    const rad1 = ((startAngle - 90) * Math.PI) / 180;
                    const rad2 = ((endAngle - 90) * Math.PI) / 180;
                    
                    const x1 = 50 * Math.cos(rad1);
                    const y1 = 50 * Math.sin(rad1);
                    const x2 = 50 * Math.cos(rad2);
                    const y2 = 50 * Math.sin(rad2);

                    const isMatched = matchedSoundIds.includes(slice.id);
                    
                    // Text position
                    const textAngle = startAngle + sliceAngle / 2;
                    const textRad = ((textAngle - 90) * Math.PI) / 180;
                    const tx = 30 * Math.cos(textRad);
                    const ty = 30 * Math.sin(textRad);

                    return (
                      <g key={slice.id}>
                        {/* Slice Segment */}
                        <path
                          d={`M 0,0 L ${x1},${y1} A 50,50 0 0,1 ${x2},${y2} Z`}
                          fill={isMatched ? "#c2f0c7" : slice.color}
                          stroke="#ffffff"
                          strokeWidth="0.8"
                          className="transition-colors duration-300"
                        />
                        {/* Text */}
                        <text
                          x={tx}
                          y={ty}
                          transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                          fontSize="6"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="select-none"
                        >
                          {isMatched ? "✅" : "🔊"}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Inner Center Circle / Spin Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={[
                "absolute top-1/2 left-1/2 z-10 h-22 w-22 -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-white text-lg font-black uppercase tracking-wider shadow-lg flex flex-col items-center justify-center transition-all active:scale-95",
                isSpinning
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-orange text-white hover:bg-orange-500 hover:shadow-orange/20 hover:shadow-xl",
              ].join(" ")}
            >
              <span>{isSpinning ? "🌀" : "SPIN"}</span>
            </button>
          </div>

          {spinError && (
            <div className="mt-4 text-sm font-bold text-red-500">
              {spinError}
            </div>
          )}

          {activeSoundId && !isSpinning && (
            <Button
              onClick={() => playTargetSound(activeSoundId)}
              variant="kidTeal"
              className="mt-6 gap-2"
            >
              <Volume2 className="h-5 w-5" />
              Réécouter
            </Button>
          )}
        </div>

        {/* Right: Card Choices Panel */}
        <div className="relative flex flex-col h-full min-h-[420px] p-6 bg-linear-to-br from-[#122452] to-[#0c1638] rounded-[2.8rem] border-[3px] border-white text-white shadow-[0_18px_42px_rgba(32,42,68,0.12)]">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow">
                Step 3
              </div>
              <h3 className="mt-1 text-2xl font-black">Trouve la bonne carte</h3>
              <p className="mt-1 text-xs text-white/60 font-bold">
                Touche la carte qui correspond au mot écouté.
              </p>
            </div>
          </div>

          {/* Cards list */}
          <div className="grid grid-cols-2 gap-4 mt-6 overflow-y-auto max-h-[360px] p-1">
            {choices.map((keyword) => {
              const isMatched = matchedSoundIds.includes(keyword.id);
              const isWrong = wrongAnswerId === keyword.id;
              const isDisabled = !activeSoundId || isSpinning || isMatched;

              return (
                <button
                  key={keyword.id}
                  type="button"
                  onClick={() => handleChoiceClick(keyword.id)}
                  disabled={isDisabled}
                  className={[
                    "group relative min-h-[140px] rounded-[2rem] border-4 border-white bg-white p-3 text-center shadow-[0_10px_20px_rgba(0,0,0,0.15)] transition-all",
                    isDisabled
                      ? "cursor-not-allowed opacity-60"
                      : "hover:-translate-y-1 hover:shadow-xl",
                    isMatched
                      ? "ring-4 ring-[#7AE582] animate-[bounce_0.6s_ease]"
                      : isWrong
                        ? "ring-4 ring-[#FF8FAB] animate-[shake_0.35s_ease]"
                        : "",
                  ].join(" ")}
                >
                  {/* Status Badges */}
                  {isMatched && (
                    <div className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#62df33] text-white">
                      <Check className="h-4 w-4 stroke-4" />
                    </div>
                  )}

                  {isWrong && (
                    <div className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff4f73] text-white">
                      <X className="h-4 w-4 stroke-4" />
                    </div>
                  )}

                  <div
                    className="mx-auto flex h-18 w-18 items-center justify-center overflow-hidden rounded-2xl border-2 border-white shadow-sm transition group-hover:scale-105"
                    style={{
                      background: keyword.color,
                    }}
                  >
                    {renderKeywordVisual(
                      keyword,
                      "text-2xl",
                      "h-full w-full object-contain p-1.5",
                    )}
                  </div>

                  <div className="mt-3 truncate text-base font-black capitalize text-navy">
                    {keyword.word}
                  </div>
                </button>
              );
            })}
          </div>

          {!activeSoundId && !isSpinning && (
            <div className="absolute inset-0 bg-navy/60 backdrop-blur-xs flex items-center justify-center rounded-[2.8rem]">
              <div className="text-center p-5 bg-white rounded-[2rem] shadow-xl max-w-xs text-navy border-2 border-orange/20">
                <span className="text-4xl animate-bounce block">🎉</span>
                <h4 className="mt-2 text-lg font-black">Tourne la roue !</h4>
                <p className="mt-1 text-xs text-navy/60 font-bold">
                  Clique sur le bouton SPIN au centre de la roue pour écouter un mot !
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
