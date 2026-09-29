import React, { useMemo, useState } from "react";
import { Check, Headphones, RotateCcw, Sparkles, Volume2, X } from "lucide-react";
import type { KidLessonKeywordWithAsset } from "../../../../../data/kidLessonActivities";
import { Button } from "../../../../ui/Button";
import { Card } from "../../../../ui/Card";
import type { SoundPrompt } from "../../../sections/shared";
import { renderKeywordVisual } from "../../../sections/shared";

interface KidHideAndSeekGameProps {
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

interface HidingSpot {
  id: number;
  label: string;
  icon: string;
  bgClass: string;
}

const HIDING_SPOTS: HidingSpot[] = [
  { id: 0, label: "Bush", icon: "🌳", bgClass: "from-emerald-400 to-green-500" },
  { id: 1, label: "Tent", icon: "🎪", bgClass: "from-pink-400 to-rose-500" },
  { id: 2, label: "Chest", icon: "📦", bgClass: "from-amber-500 to-amber-700" },
  { id: 3, label: "Cloud", icon: "☁️", bgClass: "from-sky-300 to-blue-400" },
];

export const KidHideAndSeekGame: React.FC<KidHideAndSeekGameProps> = ({
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

  // Track currently revealed/wrong choices temporarily so kids see what they tapped
  const [revealedSpots, setRevealedSpots] = useState<Record<number, boolean>>({});
  const [wrongSpotId, setWrongSpotId] = useState<number | null>(null);
  const [prevActiveSoundId, setPrevActiveSoundId] = useState<string | null>(null);

  if (activeSoundId !== prevActiveSoundId) {
    setPrevActiveSoundId(activeSoundId);
    setRevealedSpots({});
    setWrongSpotId(null);
  }

  // We assign each of the 4 visible choices to one of the 4 hiding spots
  const visibleToyChoices = useMemo(() => {
    if (!activeSoundId) {
      return soundGameToys.slice(0, 4);
    }

    const correctToy = soundGameToys.find((toy) => toy.id === activeSoundId);
    const otherToys = soundGameToys.filter((toy) => toy.id !== activeSoundId);

    if (!correctToy) {
      return soundGameToys.slice(0, 4);
    }

    // Always put correct toy first, then shuffle so its position in the 4 spots is randomized but stable per activeSoundId
    const choices = [correctToy, ...otherToys].slice(0, 4);
    // Simple deterministic sort/shuffle based on activeSoundId length/charCodes so it doesn't jump around during rendering
    const seed = activeSoundId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return choices.sort((a, b) => {
      const valA = (a.id.length * seed) % 10;
      const valB = (b.id.length * seed) % 10;
      return valA - valB;
    });
  }, [activeSoundId, soundGameToys]);

  const handlePlaySound = (soundId: string) => {
    const keyword = keywordsWithAssets.find((item) => item.id === soundId);
    if (!keyword) return;

    onSelectSound(soundId);

    if (!resolveSoundAudioSrc) return;
    const audio = new Audio(resolveSoundAudioSrc(keyword));
    audio.play().catch(console.error);
  };

  const handleSpotClick = (spotIndex: number, keywordId: string) => {
    if (matchedSoundIds.includes(keywordId)) return;

    const isCurrentlyRevealed = revealedSpots[spotIndex];

    if (!isCurrentlyRevealed) {
      // First click: just reveal/open it!
      setRevealedSpots((prev) => ({ ...prev, [spotIndex]: true }));
    } else {
      // Second click: submit guess if there is an active sound
      if (!activeSoundId) return;

      onSelectToy(keywordId);

      if (keywordId === activeSoundId) {
        // Correct guess (parent adds to matchedSoundIds, which stays open)
      } else {
        // Mismatch
        setWrongSpotId(spotIndex);
        // Hide the spot again after 1.5 seconds so they can guess again
        setTimeout(() => {
          setRevealedSpots((prev) => ({ ...prev, [spotIndex]: false }));
          setWrongSpotId((curr) => (curr === spotIndex ? null : curr));
        }, 1500);
      }
    }
  };

  const handleRestart = () => {
    setRevealedSpots({});
    setWrongSpotId(null);
    onReset();
  };

  const activeKeyword = activeSoundId
    ? keywordsWithAssets.find((item) => item.id === activeSoundId) || null
    : null;

  return (
    <section className="space-y-6 pb-10">
      {/* Header Panel */}
      <Card
        variant="kidSection"
        className="relative overflow-hidden bg-linear-to-br from-[#e2f7fc] via-white to-[#fff2db] p-5 md:p-6"
      >
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 animate-pulse items-center justify-center rounded-[1.4rem] border-[3px] border-white bg-linear-to-br from-[#c9effb] via-lightBlue to-blue text-white shadow-[0_12px_24px_rgba(33,158,188,0.24)]">
              <Headphones className="h-8 w-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue shadow-sm">
                <Sparkles className="h-4 w-4" />
                Hide & Seek Game
              </div>

              <h2 className="mt-3 text-3xl font-black leading-tight text-navy md:text-4xl">
                Cache-Cache Audio
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-navy/65 md:text-base">
                Écoute la phrase audio, puis cherche et trouve où se cache le personnage !
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

      {/* Main Game Interface */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.9fr] xl:items-stretch">
        
        {/* Step 1: Sound List */}
        <div className="relative flex min-h-[480px] max-h-[640px] overflow-hidden rounded-[2.8rem] border-[3px] border-white bg-linear-to-br from-[#11224f] via-[#172f6b] to-[#0d173f] p-5 text-white shadow-[0_22px_50px_rgba(18,25,68,0.20)] md:p-6 xl:h-full">
          <div className="relative flex min-h-0 w-full flex-col">
            <div className="flex shrink-0 items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow">
                  Step 1
                </div>
                <h3 className="mt-1 text-3xl font-black">Tap a sound</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-white/65">
                  Écoute d'abord la phrase secrète.
                </p>
              </div>
              <div className="flex h-13 w-13 items-center justify-center rounded-full border-[3px] border-white/20 bg-white/10 text-yellow shadow-[0_12px_24px_rgba(0,0,0,0.16)]">
                <Volume2 className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
              {soundPrompts.map((soundPrompt) => {
                const isMatched = matchedSoundIds.includes(soundPrompt.id);
                const isActive = activeSoundId === soundPrompt.id;

                return (
                  <button
                    key={soundPrompt.id}
                    type="button"
                    onClick={() => handlePlaySound(soundPrompt.id)}
                    disabled={isMatched}
                    className={[
                      "group flex w-full items-center justify-between gap-3 rounded-[1.8rem] border-[3px] px-4 py-3.5 text-left shadow-[0_12px_24px_rgba(0,0,0,0.14)] transition-all",
                      isMatched
                        ? "border-[#7AE582]/60 bg-[#eaffec] text-[#2B9348]"
                        : isActive
                          ? "border-yellow bg-yellow text-navy shadow-[0_14px_28px_rgba(255,183,3,0.24)]"
                          : "border-white/12 bg-white/10 text-white hover:-translate-y-0.5 hover:bg-white/16",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={[
                          "flex h-11 w-11 items-center justify-center rounded-full border-[3px] shadow-[0_10px_18px_rgba(0,0,0,0.14)]",
                          isMatched
                            ? "border-white bg-[#62df33] text-white"
                            : isActive
                              ? "border-white bg-white text-orange"
                              : "border-white/20 bg-blue text-white",
                        ].join(" ")}
                      >
                        {isMatched ? (
                          <Check className="h-5 w-5 stroke-4" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </span>

                      <span className="block text-base font-black">
                        {isMatched ? "Found!" : isActive ? "Listen again" : "Listen"}
                      </span>
                    </span>

                    <span
                      className={[
                        "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em]",
                        isMatched
                          ? "bg-white/70 text-[#2B9348]"
                          : isActive
                            ? "bg-white/70 text-orange"
                            : "bg-white/10 text-white/70",
                      ].join(" ")}
                    >
                      {isMatched ? "OK" : "Tap"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 shrink-0 rounded-[1.6rem] border border-white/12 bg-white/10 px-4 py-3 text-sm font-bold text-white/70">
              {activeKeyword
                ? `Who is hiding? Listen and find!`
                : "Choose a sound first."}
            </div>
          </div>
        </div>

        {/* Step 2: Hiding Spots Grid */}
        <div className="relative flex min-h-[480px] max-h-[640px] overflow-hidden rounded-[2.8rem] border-[3px] border-white bg-linear-to-br from-[#f2fafd] via-white to-[#fffbe6] p-5 shadow-[0_18px_42px_rgba(32,42,68,0.10)] md:p-6 xl:h-full">
          <div className="relative flex min-h-0 w-full flex-col">
            <div className="flex shrink-0 items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-orange">
                  Step 2
                </div>
                <h3 className="mt-1 text-2xl font-black leading-tight text-navy md:text-3xl">
                  {activeSoundId ? "Tap the hiding spots" : "Listen first"}
                </h3>
                <p className="mt-2 text-sm font-bold leading-6 text-navy/55">
                  {activeSoundId
                    ? "Cherche sous les décors pour voir qui s'y cache."
                    : "Choisis une bulle sonore à gauche pour commencer à chercher."}
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-6 min-h-0 flex-1 overflow-y-auto p-2">
              <div className="grid grid-cols-2 gap-5 h-full">
                {visibleToyChoices.map((keyword, index) => {
                  const spot = HIDING_SPOTS[index];
                  const isMatched = matchedSoundIds.includes(keyword.id);
                  const isRevealed = revealedSpots[index] || isMatched;
                  const isWrong = wrongSpotId === index;

                  return (
                    <div key={keyword.id} className="relative aspect-[1.1/1] w-full">
                      {/* Spot Container */}
                      <button
                        type="button"
                        onClick={() => handleSpotClick(index, keyword.id)}
                        disabled={isMatched}
                        className="group relative w-full h-full rounded-[2.4rem] perspective-distant"
                      >
                        <div
                          className={[
                            "relative h-full w-full rounded-[2.4rem] border-4 border-white transition-transform duration-500 transform-3d shadow-[0_12px_28px_rgba(32,42,68,0.08)]",
                            isRevealed ? "transform-[rotateY(180deg)]" : "",
                            isMatched
                              ? "ring-4 ring-[#7AE582] scale-[1.02]"
                              : isWrong
                                ? "ring-4 ring-[#FF8FAB] animate-pulse"
                                : "hover:-translate-y-1 hover:shadow-lg",
                          ].join(" ")}
                        >
                          {/* Back: Hiding Spot Cover (Visible when NOT revealed) */}
                          <div
                            className={[
                              "absolute inset-0 rounded-[2.1rem] bg-gradient-to-br flex flex-col items-center justify-center p-4 backface-hidden",
                              spot.bgClass,
                            ].join(" ")}
                          >
                            <span className="text-6xl md:text-7xl animate-bounce duration-1000 select-none">
                              {spot.icon}
                            </span>
                            <span className="mt-3 rounded-full bg-white/20 px-4 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
                              {spot.label}
                            </span>
                          </div>

                          {/* Front: Hidden Content (Revealed Card) */}
                          <div
                            className="absolute inset-0 rounded-[2.1rem] flex flex-col items-center justify-center p-3 backface-hidden transform-[rotateY(180deg)]"
                            style={{
                              background: keyword.color,
                              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 20px ${keyword.shadow}`,
                            }}
                          >
                            <div className="flex h-[62%] w-full items-center justify-center">
                              {renderKeywordVisual(
                                keyword,
                                "text-4xl",
                                "h-full w-full object-contain p-2",
                              )}
                            </div>
                            <div className="mt-2 text-base md:text-lg font-black text-white truncate max-w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                              {keyword.word}
                            </div>
                          </div>
                        </div>

                        {/* Status overlays */}
                        {isMatched && (
                          <div className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#62df33] text-white shadow-md">
                            <Check className="h-5 w-5 stroke-4" />
                          </div>
                        )}

                        {isWrong && (
                          <div className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#ff4f73] text-white shadow-md">
                            <X className="h-5 w-5 stroke-4" />
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
