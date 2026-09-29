import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, PackageOpen, Sparkles, Star, Volume2, X } from "lucide-react";
import type {
  KidLessonActivityPack,
  KidLessonKeywordWithAsset,
} from "../../../../../data/kidLessonActivities";
import { shuffle } from "../../../kidActivityHelpers";
import { renderKeywordVisual } from "../../../sections/shared";

const BOX_IMAGE_SRC = "/images/kid/box-3d.png";

interface KidGameProps {
  answeredId: string | null;
  boxChoices: KidLessonKeywordWithAsset[];
  boxOpened: boolean;
  currentKeyword: KidLessonKeywordWithAsset;
  exerciseIndex: number;
  keywordsWithAssets: KidLessonKeywordWithAsset[];
  pack: KidLessonActivityPack;
  onChoose: (keyword: KidLessonKeywordWithAsset) => void;
  onOpenBox: () => void;
}

export const KidBoxGame: React.FC<KidGameProps> = ({
  answeredId,
  boxOpened,
  currentKeyword,
  exerciseIndex,
  keywordsWithAssets,
  onChoose,
  onOpenBox,
}) => {
  const [draggedToyId, setDraggedToyId] = useState<string | null>(null);
  const [isDropActive, setIsDropActive] = useState(false);
  const [showDragHint, setShowDragHint] = useState(true);
  const [prevKeywordId, setPrevKeywordId] = useState(currentKeyword.id);

  if (currentKeyword.id !== prevKeywordId) {
    setPrevKeywordId(currentKeyword.id);
    setShowDragHint(true);
    setDraggedToyId(null);
    setIsDropActive(false);
  }

  const isCorrectDrop = answeredId === currentKeyword.id;

  const visibleToyChoices = useMemo(() => {
    const correctToy = keywordsWithAssets.find(
      (keyword) => keyword.id === currentKeyword.id,
    );

    const otherToys = shuffle(
      keywordsWithAssets.filter((keyword) => keyword.id !== currentKeyword.id),
    ).slice(0, 3);

    if (!correctToy) {
      return shuffle(keywordsWithAssets).slice(0, 4);
    }

    return shuffle([correctToy, ...otherToys]).slice(0, 4);
  }, [currentKeyword.id, keywordsWithAssets]);

  const droppedKeyword = answeredId
    ? keywordsWithAssets.find((keyword) => keyword.id === answeredId) || null
    : null;

  useEffect(() => {
    if (!boxOpened) {
      onOpenBox();
    }
  }, [boxOpened, onOpenBox]);

  const playPromptAudio = useCallback(() => {
    const audioName = currentKeyword.imageName.replace(/\.[^.]+$/, "");
    const audio = new Audio(`/audio/toy/${audioName}.mp3`);

    audio.play().catch(console.error);
    return audio;
  }, [currentKeyword.imageName]);

  useEffect(() => {
    const audio = playPromptAudio();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [playPromptAudio]);


  useEffect(() => {
    if (!answeredId) return;

    const audio = new Audio(
      answeredId === currentKeyword.id
        ? "/audio/correct.mp3"
        : "/audio/wrong.mp3",
    );

    audio.play().catch(console.error);
  }, [answeredId, currentKeyword.id]);

  const handleToyChoice = (keyword: KidLessonKeywordWithAsset) => {
    if (answeredId) return;

    setShowDragHint(false);
    setDraggedToyId(null);
    setIsDropActive(false);
    onChoose(keyword);
  };

  return (
    <section className="space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-[2.8rem] border-[3px] border-white bg-linear-to-br from-[#e9f9ff] via-white to-[#fff5d8] p-5 shadow-[0_18px_42px_rgba(32,42,68,0.10)] md:p-6">
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-lightBlue/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 animate-pulse items-center justify-center rounded-[1.4rem] border-[3px] border-white bg-linear-to-br from-yellow via-gold to-orange text-navy shadow-[0_12px_24px_rgba(239,191,4,0.24)]">
              <PackageOpen className="h-8 w-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange shadow-sm">
                <Sparkles className="h-4 w-4" />
                Toy Mission
              </div>

              <h2 className="mt-3 text-3xl font-black leading-tight text-navy md:text-4xl">
                Listen and Pack
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-navy/60 md:text-base">
                Écoute le son, puis mets le bon jouet dans la boîte.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={playPromptAudio}
              className="inline-flex items-center justify-center gap-3 rounded-full border-[3px] border-white bg-linear-to-r from-yellow to-orange px-5 py-3 text-navy shadow-[0_10px_0_rgba(116,62,0,0.24)] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_5px_0_rgba(116,62,0,0.24)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-orange">
                <Volume2 className="h-5 w-5" />
              </span>

              <span className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-navy/55">
                  First step
                </span>
                <span className="block text-lg font-black leading-none">
                  Listen
                </span>
              </span>
            </button>

            <div className="rounded-[1.6rem] border-[3px] border-white bg-white px-5 py-3 shadow-[0_10px_22px_rgba(32,42,68,0.08)]">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-navy/45">
                Progression
              </div>
              <div className="mt-1 text-2xl font-black text-navy">
                {exerciseIndex + 1} / {keywordsWithAssets.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] xl:items-stretch">
        <div
          className={[
            "relative flex min-h-[620px] overflow-hidden rounded-[3rem] border-4 border-white bg-linear-to-br from-[#fff9dc] via-[#fff4c7] to-[#ffe7a1] p-4 shadow-[0_22px_50px_rgba(32,42,68,0.16)] transition-all md:p-5",
            isDropActive ? "scale-[1.015] ring-4 ring-yellow/70" : "",
            isCorrectDrop ? "ring-4 ring-[#7AE582]" : "",
            answeredId && !isCorrectDrop ? "ring-4 ring-[#FF8FAB]" : "",
          ].join(" ")}
          onDragOver={(event) => {
            if (answeredId) return;
            event.preventDefault();
            setIsDropActive(true);
          }}
          onDragLeave={() => {
            setIsDropActive(false);
          }}
          onDrop={(event) => {
            event.preventDefault();

            if (answeredId) return;

            const toyId = event.dataTransfer.getData("text/plain");
            const keyword = visibleToyChoices.find((item) => item.id === toyId);

            if (keyword) {
              handleToyChoice(keyword);
            }
          }}
        >
          <div className="pointer-events-none absolute -left-16 -top-12 h-44 w-44 rounded-full bg-white/45 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-4 h-48 w-48 rounded-full bg-orange/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-10 bottom-8 h-24 rounded-full bg-[rgba(130,75,19,0.18)] blur-2xl" />

          {showDragHint && !answeredId ? (
            <div className="pointer-events-none absolute right-6 top-6 z-30 flex animate-pulse items-center gap-2 rounded-full border border-white/70 bg-white/50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-navy shadow-[0_12px_24px_rgba(32,42,68,0.16)] backdrop-blur-sm">
              <span>✨</span>
              Drop here
            </div>
          ) : null}

          {isCorrectDrop ? (
            <div className="pointer-events-none absolute left-1/2 top-8 z-40 -translate-x-1/2 animate-bounce rounded-full bg-yellow px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-navy shadow-[0_14px_28px_rgba(255,183,3,0.28)]">
              ⭐ Star won!
            </div>
          ) : null}

          <div className="relative z-10 flex min-h-[590px] w-full flex-col items-center justify-center text-center">
            <div className="relative flex w-full max-w-[760px] items-center justify-center">
              <img
                src={BOX_IMAGE_SRC}
                alt="Magic box"
                className={[
                  "pointer-events-none w-full max-w-[760px] object-contain drop-shadow-[0_30px_44px_rgba(102,63,18,0.30)] transition-all duration-300",
                  isDropActive ? "scale-[1.05]" : "",
                  isCorrectDrop ? "animate-pulse" : "",
                ].join(" ")}
              />

              <div
                className={[
                  "absolute left-1/2 top-[35%] flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[5px] border-dashed text-center transition-all md:h-44 md:w-44",
                  isDropActive
                    ? "scale-110 border-yellow bg-yellow/25 text-white shadow-[0_0_42px_rgba(255,214,0,0.40)]"
                    : isCorrectDrop
                      ? "border-[#7AE582] bg-[#7AE582]/20 text-white shadow-[0_0_44px_rgba(122,229,130,0.35)]"
                      : "border-white/80 bg-white/12 text-white",
                ].join(" ")}
              >
                {droppedKeyword ? (
                  <div className="relative">
                    <div
                      className={[
                        "flex h-32 w-32 items-center justify-center rounded-full border-[5px] border-white/90 bg-white/24 shadow-[0_20px_36px_rgba(32,42,68,0.22)] md:h-36 md:w-36",
                        isCorrectDrop ? "animate-bounce" : "",
                      ].join(" ")}
                    >
                      {droppedKeyword.imageUrl ? (
                        <img
                          src={droppedKeyword.imageUrl}
                          alt={droppedKeyword.word}
                          className="h-28 w-28 object-contain drop-shadow-[0_14px_20px_rgba(32,42,68,0.18)] md:h-32 md:w-32"
                        />
                      ) : (
                        <span className="text-5xl font-black uppercase text-white/92">
                          {droppedKeyword.word.slice(0, 2)}
                        </span>
                      )}
                    </div>

                    <div
                      className={[
                        "absolute -right-3 -top-3 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white text-white shadow-[0_14px_26px_rgba(32,42,68,0.22)]",
                        isCorrectDrop ? "bg-[#62df33]" : "bg-[#ff4f73]",
                      ].join(" ")}
                    >
                      {isCorrectDrop ? (
                        <Check className="h-8 w-8 stroke-4" />
                      ) : (
                        <X className="h-8 w-8 stroke-4" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-4">
                    <div className="text-4xl">📦</div>
                    <div className="mt-2 text-base font-black leading-tight md:text-lg">
                      Drop the toy here
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-20 -mt-8 rounded-4xl border-[3px] border-white bg-white/82 px-5 py-3 shadow-[0_16px_30px_rgba(32,42,68,0.12)] backdrop-blur-sm">
              <p className="text-base font-black text-navy">
                Listen:{" "}
                <span className="text-orange">
                  It&apos;s {currentKeyword.word}.
                </span>
              </p>
            </div>

            {answeredId ? (
              <div
                className={[
                  "relative z-30 mt-5 rounded-[1.6rem] px-5 py-3 text-lg font-black shadow-[0_12px_22px_rgba(32,42,68,0.16)]",
                  isCorrectDrop
                    ? "bg-[#eaffec] text-[#2B9348]"
                    : "bg-[#fff0f4] text-[#D90429]",
                ].join(" ")}
              >
                {isCorrectDrop ? "✅ Bravo!" : "🚫 Try again!"}
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative flex min-h-[620px] overflow-hidden rounded-[2.8rem] border-[3px] border-white bg-linear-to-br from-white via-[#f5fcff] to-[#fff8df] p-5 shadow-[0_18px_42px_rgba(32,42,68,0.10)] md:p-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-lightBlue/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-gold/18 blur-3xl" />

          <div className="relative flex min-h-0 w-full flex-col">
            <div className="flex shrink-0 items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-blue">
                  Choose
                </div>
                <div className="mt-1 text-2xl font-black leading-tight text-navy">
                  Pick the toy
                </div>
                <p className="mt-2 text-sm font-bold leading-6 text-navy/55">
                  Maximum 4 choix. Écoute d’abord, puis choisis.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow text-orange">
                <Star className="h-6 w-6 fill-current" />
              </div>
            </div>

            <div className="relative z-20 mt-4 rounded-3xl border-2 border-white bg-yellow px-4 py-3 text-center text-navy shadow-[0_14px_26px_rgba(255,183,3,0.20)]">
              <div className="text-sm font-black">
                Find: {currentKeyword.word}
              </div>
            </div>

            <div className="relative z-10 mt-6 grid flex-1 grid-cols-2 gap-5 overflow-y-auto p-2">
              {visibleToyChoices.map((keyword) => {
                const isCurrentWrongChoice =
                  answeredId === keyword.id && keyword.id !== currentKeyword.id;

                const isCurrentCorrectChoice =
                  answeredId === currentKeyword.id &&
                  keyword.id === currentKeyword.id;

                const isDisabled = answeredId !== null;

                return (
                  <button
                    key={keyword.id}
                    type="button"
                    draggable={!isDisabled}
                    onDragStart={(event) => {
                      if (isDisabled) return;
                      setShowDragHint(false);
                      event.dataTransfer.setData("text/plain", keyword.id);
                      setDraggedToyId(keyword.id);
                    }}
                    onDragEnd={() => {
                      setDraggedToyId(null);
                      setIsDropActive(false);
                    }}
                    onClick={() => handleToyChoice(keyword)}
                    disabled={isDisabled}
                    className={[
                      "group relative min-h-[230px] rounded-[2.4rem] border-4 border-white bg-white p-4 text-center shadow-[0_16px_34px_rgba(32,42,68,0.10)] transition-all",
                      draggedToyId === keyword.id
                        ? "scale-95 opacity-75"
                        : !isDisabled
                          ? "hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(32,42,68,0.15)]"
                          : "cursor-not-allowed opacity-60",
                      isCurrentCorrectChoice
                        ? "ring-4 ring-[#7AE582] animate-bounce"
                        : "",
                      isCurrentWrongChoice ? "ring-4 ring-[#FF8FAB]" : "",
                    ].join(" ")}
                  >
                    {(isCurrentCorrectChoice || isCurrentWrongChoice) && (
                      <div
                        className={[
                          "absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-white shadow-[0_10px_18px_rgba(32,42,68,0.18)]",
                          isCurrentCorrectChoice
                            ? "bg-[#62df33]"
                            : "bg-[#ff4f73]",
                        ].join(" ")}
                      >
                        {isCurrentCorrectChoice ? (
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

                    {isCurrentCorrectChoice ? (
                      <div className="pointer-events-none absolute -top-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-yellow px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-navy shadow-[0_10px_20px_rgba(255,183,3,0.24)]">
                        ⭐ Star!
                      </div>
                    ) : null}


                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
