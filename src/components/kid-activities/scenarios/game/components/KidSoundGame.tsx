import React, { useMemo } from "react";
import {
  Check,
  Headphones,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
  X,
} from "lucide-react";
import type { KidLessonKeywordWithAsset } from "../../../../../data/kidLessonActivities";
import { Button } from "../../../../ui/Button";
import { Card } from "../../../../ui/Card";
import type { SoundPrompt } from "../../../sections/shared";
import { renderKeywordVisual } from "../../../sections/shared";

interface KidSoundGameProps {
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

export const KidSoundGame: React.FC<KidSoundGameProps> = ({
  activeSoundId,
  keywordsWithAssets,
  matchedSoundIds,
  resolveSoundAudioSrc,
  selectedToyId,
  soundGameToys,
  soundPrompts,
  onReset,
  onSelectSound,
  onSelectToy,
}) => {
  const total = keywordsWithAssets.length || 1;
  const progress = Math.round((matchedSoundIds.length / total) * 100);

  const activeKeyword = activeSoundId
    ? keywordsWithAssets.find((item) => item.id === activeSoundId) || null
    : null;

  const visibleToyChoices = useMemo(() => {
    if (!activeSoundId) {
      return soundGameToys.slice(0, 4);
    }

    const correctToy = soundGameToys.find((toy) => toy.id === activeSoundId);
    const otherToys = soundGameToys.filter((toy) => toy.id !== activeSoundId);

    if (!correctToy) {
      return soundGameToys.slice(0, 4);
    }

    return [correctToy, ...otherToys].slice(0, 4);
  }, [activeSoundId, soundGameToys]);

  const handlePlaySound = (soundId: string) => {
    const keyword = keywordsWithAssets.find((item) => item.id === soundId);
    if (!keyword) return;

    onSelectSound(soundId);

    if (!resolveSoundAudioSrc) return;

    const audio = new Audio(resolveSoundAudioSrc(keyword));
    audio.play().catch(console.error);
  };

  return (
    <section className="space-y-6 pb-10">
      <Card
        variant="kidSection"
        className="relative overflow-hidden bg-linear-to-br from-[#e9f9ff] via-white to-[#fff5d8] p-5 md:p-6"
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-lightBlue/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 animate-pulse items-center justify-center rounded-[1.4rem] border-[3px] border-white bg-linear-to-br from-[#c9effb] via-lightBlue to-blue text-white shadow-[0_12px_24px_rgba(33,158,188,0.24)]">
              <Headphones className="h-8 w-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue shadow-sm">
                <Sparkles className="h-4 w-4" />
                Sound Mission
              </div>

              <h2 className="mt-3 text-3xl font-black leading-tight text-navy md:text-4xl">
                Listen and Find
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-navy/60 md:text-base">
                Écoute le son, puis touche le bon jouet.
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
              onClick={onReset}
              variant="kidOrange"
              className="px-4 py-3"
            >
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-stretch">
        <div className="relative flex min-h-[560px] max-h-[720px] overflow-hidden rounded-[2.8rem] border-[3px] border-white bg-linear-to-br from-[#11224f] via-[#172f6b] to-[#0d173f] p-5 text-white shadow-[0_22px_50px_rgba(18,25,68,0.20)] md:p-6 xl:h-full">
          <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-blue/35 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-gold/18 blur-3xl" />

          <div className="relative flex min-h-0 w-full flex-col">
            <div className="flex shrink-0 items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow">
                  Step 1
                </div>

                <h3 className="mt-1 text-3xl font-black">Tap a sound</h3>

                <p className="mt-2 text-sm font-bold leading-6 text-white/65">
                  Écoute d’abord le son.
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
                      "group flex w-full items-center justify-between gap-3 rounded-[1.8rem] border-[3px] px-4 py-4 text-left shadow-[0_12px_24px_rgba(0,0,0,0.14)] transition-all",
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
                          "flex h-13 w-13 items-center justify-center rounded-full border-[3px] shadow-[0_10px_18px_rgba(0,0,0,0.14)]",
                          isMatched
                            ? "border-white bg-[#62df33] text-white"
                            : isActive
                              ? "border-white bg-white text-orange"
                              : "border-white/20 bg-blue text-white",
                        ].join(" ")}
                      >
                        {isMatched ? (
                          <Check className="h-6 w-6 stroke-4" />
                        ) : (
                          <Volume2 className="h-6 w-6" />
                        )}
                      </span>

                      <span className="block text-lg font-black">
                        {isMatched
                          ? "Bravo!"
                          : isActive
                            ? "Listen again"
                            : "Listen"}
                      </span>
                    </span>

                    <span
                      className={[
                        "rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em]",
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
                ? `Now find: ${activeKeyword.word}`
                : "Tap a sound first."}
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[560px] max-h-[720px] overflow-hidden rounded-[2.8rem] border-[3px] border-white bg-linear-to-br from-white via-[#f5fcff] to-[#fff8df] p-5 shadow-[0_18px_42px_rgba(32,42,68,0.10)] md:p-6 xl:h-full">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-lightBlue/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-gold/18 blur-3xl" />

          <div className="relative flex min-h-0 w-full flex-col">
            <div className="flex shrink-0 items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-orange">
                  Step 2
                </div>

                <h3 className="mt-1 text-2xl font-black leading-tight text-navy md:text-3xl">
                  {activeSoundId ? "Pick the toy" : "Listen first"}
                </h3>

                <p className="mt-2 text-sm font-bold leading-6 text-navy/55">
                  {activeSoundId
                    ? "Tape sur le bon jouet."
                    : "Choisis un son pour débloquer les jouets."}
                </p>
              </div>

              <div
                className={[
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                  activeSoundId ? "bg-yellow text-orange" : "bg-blue/10 text-blue",
                ].join(" ")}
              >
                <Star className="h-6 w-6 fill-current" />
              </div>
            </div>

            <div className="relative z-10 mt-6 min-h-0 flex-1 overflow-y-auto p-2">
              <div className="grid grid-cols-2 gap-5">
                {visibleToyChoices.map((keyword) => {
                  const isMatched = matchedSoundIds.includes(keyword.id);

                  const isCorrectChoice =
                    selectedToyId === keyword.id && activeSoundId === keyword.id;

                  const isWrongChoice =
                    selectedToyId === keyword.id &&
                    activeSoundId !== null &&
                    activeSoundId !== keyword.id;

                  const isDisabled = !activeSoundId || isMatched;

                  return (
                    <button
                      key={keyword.id}
                      type="button"
                      onClick={() => onSelectToy(keyword.id)}
                      disabled={isDisabled}
                      className={[
                        "group relative min-h-[230px] rounded-[2.4rem] border-4 border-white bg-white p-4 text-center shadow-[0_16px_34px_rgba(32,42,68,0.10)] transition-all",
                        isDisabled
                          ? "cursor-not-allowed opacity-60"
                          : "hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(32,42,68,0.15)]",
                        isMatched
                          ? "ring-4 ring-[#7AE582] animate-[bounce_0.6s_ease]"
                          : isCorrectChoice
                            ? "ring-4 ring-[#7AE582] animate-[bounce_0.6s_ease]"
                            : isWrongChoice
                              ? "ring-4 ring-[#FF8FAB] animate-[shake_0.35s_ease]"
                              : "",
                      ].join(" ")}
                    >
                      {(isMatched || isCorrectChoice || isWrongChoice) && (
                        <div
                          className={[
                            "absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-white shadow-[0_10px_18px_rgba(32,42,68,0.18)]",
                            isMatched || isCorrectChoice
                              ? "bg-[#62df33]"
                              : "bg-[#ff4f73]",
                          ].join(" ")}
                        >
                          {isMatched || isCorrectChoice ? (
                            <Check className="h-6 w-6 stroke-4" />
                          ) : (
                            <X className="h-6 w-6 stroke-4" />
                          )}
                        </div>
                      )}

                      <div
                        className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-4xl border-4 border-white shadow-[0_8px_0_rgba(0,0,0,0.08)] transition group-hover:scale-105"
                        style={{
                          background: keyword.color,
                          boxShadow: `0 16px 26px ${keyword.shadow}`,
                        }}
                      >
                        {renderKeywordVisual(
                          keyword,
                          "text-4xl",
                          "h-full w-full object-contain p-3",
                        )}
                      </div>

                      <div className="mt-4 truncate text-xl font-black capitalize text-navy">
                        {keyword.word}
                      </div>

                      {isCorrectChoice ? (
                        <div className="pointer-events-none absolute -top-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-yellow px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-navy shadow-[0_10px_20px_rgba(255,183,3,0.24)]">
                          ⭐ Star!
                        </div>
                      ) : null}

                      {!activeSoundId && !isMatched ? (
                        <div className="pointer-events-none absolute inset-0 rounded-[2.4rem] bg-white/45" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedToyId && activeSoundId ? (
              <div
                className={[
                  "mt-5 shrink-0 rounded-[1.8rem] px-5 py-4 text-center text-lg font-black shadow-[0_12px_24px_rgba(32,42,68,0.12)]",
                  selectedToyId === activeSoundId
                    ? "bg-[#eaffec] text-[#2B9348]"
                    : "bg-[#fff0f4] text-[#D90429]",
                ].join(" ")}
              >
                {selectedToyId === activeSoundId ? "✅ Bravo!" : "🚫 Try again!"}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};