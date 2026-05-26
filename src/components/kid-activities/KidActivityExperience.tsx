import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
} from "lucide-react";
import { useKidMode } from "../../hooks/useKidMode";
import lessonService, {
  type Lesson,
  type RevisionAsset,
} from "../../services/lesson.service";
import {
  buildKidSentence,
  getKidLessonPack,
  type KidActivityType,
  type KidLessonKeyword,
  type KidLessonKeywordWithAsset,
} from "../../data/kidLessonActivities";
import { kidActivityConfig } from "./activityConfig";

function shuffle<T>(items: T[]) {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function isNegativeKeyword(keyword: KidLessonKeyword) {
  return keyword.possession === "have_not";
}

function buildKeywordSentence(
  packSentencePattern: string,
  keyword: KidLessonKeyword,
) {
  if (keyword.possession === "have") {
    return `I've got a ${keyword.word}.`;
  }

  if (keyword.possession === "have_not") {
    return `I haven't got a ${keyword.word}.`;
  }

  return buildKidSentence(packSentencePattern, keyword.word);
}

interface KidActivityExperienceProps {
  activityType: KidActivityType;
}

export const KidActivityExperience: React.FC<KidActivityExperienceProps> = ({
  activityType,
}) => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { isKidMode, selectedKid } = useKidMode();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedUnitOrder, setSelectedUnitOrder] = useState<number | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(true);
  const config = kidActivityConfig[activityType];
  const pack = getKidLessonPack({
    level: selectedKid?.level,
    unit: selectedUnitOrder ?? undefined,
    lesson: selectedLesson?.order,
  });
  const [revisionAssets, setRevisionAssets] = useState<RevisionAsset[]>([]);

  useEffect(() => {
    if (!isKidMode || !selectedKid?.id || !selectedKid.level || !lessonId) {
      return;
    }

    let cancelled = false;
    setLoadingLesson(true);

    lessonService
      .getLessonsByKidAndLevel(selectedKid.id, selectedKid.level)
      .then((data) => {
        if (cancelled) return;

        for (const unit of data.units) {
          const lesson = unit.lessons.find((item) => item.id === lessonId);
          if (lesson) {
            setSelectedLesson(lesson);
            setSelectedUnitOrder(unit.order);
            setLoadingLesson(false);
            return;
          }
        }

        setSelectedLesson(null);
        setSelectedUnitOrder(null);
        setLoadingLesson(false);
      })
      .catch((error) => {
        console.error("Failed to load kid lesson for activities", error);
        if (!cancelled) {
          setSelectedLesson(null);
          setSelectedUnitOrder(null);
          setLoadingLesson(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isKidMode, lessonId, selectedKid?.id, selectedKid?.level]);

  useEffect(() => {
    if (!pack) return;

    let cancelled = false;
    lessonService
      .getRevisionAssets("level0")
      .then((assets) => {
        if (!cancelled) {
          setRevisionAssets(assets);
        }
      })
      .catch((error) => {
        console.error("Failed to load kid activity assets", error);
      });

    return () => {
      cancelled = true;
    };
  }, [pack]);

  const keywordsWithAssets = useMemo<KidLessonKeywordWithAsset[]>(() => {
    if (!pack) return [];

    return pack.keywords.map((keyword) => {
      const asset = revisionAssets.find(
        (item) => item.name.toLowerCase() === keyword.imageName.toLowerCase(),
      );

      return {
        ...keyword,
        imageUrl: asset?.url,
      };
    });
  }, [pack, revisionAssets]);

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [exerciseScore, setExerciseScore] = useState(0);
  const [answeredId, setAnsweredId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [openCards, setOpenCards] = useState<string[]>([]);
  const [flippedVocabIds, setFlippedVocabIds] = useState<string[]>([]);
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [matchedSoundIds, setMatchedSoundIds] = useState<string[]>([]);
  const [selectedToyId, setSelectedToyId] = useState<string | null>(null);
  const [boxOpened, setBoxOpened] = useState(false);
  const [rewardBurst, setRewardBurst] = useState<{
    id: number;
    text: string;
  } | null>(null);
  const currentKeyword =
    keywordsWithAssets.length > 0
      ? keywordsWithAssets[exerciseIndex % keywordsWithAssets.length]
      : null;
  const isLesson2SoundGame =
    activityType === "game" &&
    pack?.level === "L0" &&
    pack.unit === 1 &&
    pack.lesson === 2;
  const isLesson1BoxGame =
    activityType === "game" &&
    pack?.level === "L0" &&
    pack.unit === 1 &&
    pack.lesson === 1;
  const isNegativeLesson = pack?.sentencePattern.includes("haven't") ?? false;

  const memoryDeck = useMemo(() => {
    if (!keywordsWithAssets.length) return [];
    return shuffle(
      keywordsWithAssets.flatMap((keyword) => [
        { id: `${keyword.id}-emoji`, pairId: keyword.id, kind: "emoji" as const },
        { id: `${keyword.id}-word`, pairId: keyword.id, kind: "word" as const },
      ]),
    );
  }, [keywordsWithAssets]);

  const exerciseChoices = useMemo(() => {
    if (!currentKeyword) return [];

    const distractors = shuffle(
      keywordsWithAssets.filter((keyword) => keyword.id !== currentKeyword.id),
    ).slice(0, Math.min(3, Math.max(0, keywordsWithAssets.length - 1)));

    return shuffle([currentKeyword, ...distractors]);
  }, [currentKeyword, keywordsWithAssets]);

  const soundPrompts = useMemo(
    () =>
      shuffle(
        keywordsWithAssets.map((keyword, index) => ({
          id: keyword.id,
          order: index + 1,
        })),
      ),
    [keywordsWithAssets],
  );

  const soundGameToys = useMemo(
    () => shuffle(keywordsWithAssets),
    [keywordsWithAssets],
  );

  const boxChoices = useMemo(() => {
    if (!isLesson1BoxGame || !currentKeyword) return [];

    const distractors = shuffle(
      keywordsWithAssets.filter((keyword) => keyword.id !== currentKeyword.id),
    ).slice(0, Math.min(2, Math.max(0, keywordsWithAssets.length - 1)));

    return shuffle([currentKeyword, ...distractors]);
  }, [currentKeyword, isLesson1BoxGame, keywordsWithAssets]);

  const exerciseFinished =
    activityType === "exercise" &&
    keywordsWithAssets.length > 0 &&
    answeredId !== null &&
    exerciseIndex === keywordsWithAssets.length - 1;
  const vocabFinished =
    activityType === "vocab" &&
    keywordsWithAssets.length > 0 &&
    flippedVocabIds.length === keywordsWithAssets.length;
  const soundGameFinished =
    isLesson2SoundGame &&
    keywordsWithAssets.length > 0 &&
    matchedSoundIds.length === keywordsWithAssets.length;
  const boxGameFinished =
    isLesson1BoxGame &&
    keywordsWithAssets.length > 0 &&
    answeredId !== null &&
    exerciseIndex === keywordsWithAssets.length - 1;
  const memoryGameFinished =
    activityType === "game" &&
    !isLesson1BoxGame &&
    !isLesson2SoundGame &&
    keywordsWithAssets.length > 0 &&
    matchedPairs.length === keywordsWithAssets.length;
  const activityFinished =
    exerciseFinished ||
    vocabFinished ||
    soundGameFinished ||
    boxGameFinished ||
    memoryGameFinished;

  useEffect(() => {
    setExerciseIndex(0);
    setExerciseScore(0);
    setAnsweredId(null);
    setMatchedPairs([]);
    setOpenCards([]);
    setFlippedVocabIds([]);
    setActiveSoundId(null);
    setMatchedSoundIds([]);
    setSelectedToyId(null);
    setBoxOpened(false);
    setRewardBurst(null);
  }, [lessonId, activityType]);

  if (!isKidMode || !selectedKid) {
    navigate("/kid-dashboard", { replace: true });
    return null;
  }

  if (loadingLesson) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#dff6ff_0%,#fff7d8_100%)] p-6 flex items-center justify-center">
        <div className="max-w-xl w-full rounded-[2.5rem] border-4 border-white bg-white/90 p-8 text-center shadow-[0_22px_50px_rgba(32,42,68,0.15)]">
          <div className="mx-auto h-20 w-20 rounded-full bg-blue/10 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-blue animate-pulse" />
          </div>
          <h1 className="mt-6 text-3xl font-black text-navy">
            Préparation de ta leçon
          </h1>
          <p className="mt-3 text-navy/60 font-bold">
            Nous retrouvons l'activité choisie...
          </p>
        </div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#dff6ff_0%,#fff7d8_100%)] p-6 flex items-center justify-center">
        <div className="max-w-xl w-full rounded-[2.5rem] border-4 border-white bg-white/90 p-8 text-center shadow-[0_22px_50px_rgba(32,42,68,0.15)]">
          <div className="mx-auto h-20 w-20 rounded-full bg-blue/10 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-blue" />
          </div>
          <h1 className="mt-6 text-3xl font-black text-navy">
            Activité bientôt prête
          </h1>
          <p className="mt-3 text-navy/60 font-bold">
            Nous préparons encore cette activité pour la leçon choisie.
          </p>
          <button
            type="button"
            onClick={() => navigate(config.routeBase)}
            className="mt-6 rounded-full bg-blue px-6 py-3 text-white font-black shadow-[0_10px_0_rgba(29,111,163,0.35)]"
          >
            Retour aux leçons
          </button>
        </div>
      </div>
    );
  }

  if (!currentKeyword && activityType === "exercise") {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#dff6ff_0%,#fff7d8_100%)] p-6 flex items-center justify-center">
        <div className="max-w-xl w-full rounded-[2.5rem] border-4 border-white bg-white/90 p-8 text-center shadow-[0_22px_50px_rgba(32,42,68,0.15)]">
          <div className="mx-auto h-20 w-20 rounded-full bg-blue/10 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-blue animate-pulse" />
          </div>
          <h1 className="mt-6 text-3xl font-black text-navy">
            Préparation des images
          </h1>
          <p className="mt-3 text-navy/60 font-bold">
            Nous chargeons les images du cours...
          </p>
        </div>
      </div>
    );
  }

  const toggleVocabCard = (keywordId: string) => {
    const shouldCelebrate = !flippedVocabIds.includes(keywordId);
    setFlippedVocabIds((prev) =>
      prev.includes(keywordId)
        ? prev.filter((id) => id !== keywordId)
        : [...prev, keywordId],
    );
    if (shouldCelebrate) {
      setRewardBurst({ id: Date.now(), text: "Super !" });
    }
  };

  const handleExerciseChoice = (keyword: KidLessonKeyword) => {
    if (answeredId || !currentKeyword) return;
    setAnsweredId(keyword.id);
    if (keyword.id === currentKeyword.id) {
      setExerciseScore((prev) => prev + 1);
      setRewardBurst({ id: Date.now(), text: "Bravo !" });
    }
  };

  const handleNextExercise = () => {
    setExerciseIndex((prev) =>
      keywordsWithAssets.length > 0
        ? (prev + 1) % keywordsWithAssets.length
        : 0,
    );
    setAnsweredId(null);
  };

  const resetGame = () => {
    setMatchedPairs([]);
    setOpenCards([]);
    setActiveSoundId(null);
    setMatchedSoundIds([]);
    setSelectedToyId(null);
    setBoxOpened(false);
  };

  const resetActivity = () => {
    setExerciseIndex(0);
    setExerciseScore(0);
    setAnsweredId(null);
    setMatchedPairs([]);
    setOpenCards([]);
    setFlippedVocabIds([]);
    setActiveSoundId(null);
    setMatchedSoundIds([]);
    setSelectedToyId(null);
    setBoxOpened(false);
    setRewardBurst(null);
  };

  const handleBoxChoice = (keyword: KidLessonKeywordWithAsset) => {
    if (answeredId || !currentKeyword) return;

    setAnsweredId(keyword.id);

    if (keyword.id === currentKeyword.id) {
      setExerciseScore((prev) => prev + 1);
      setRewardBurst({ id: Date.now(), text: "Bravo !" });
    }

    window.setTimeout(() => {
      if (exerciseIndex < keywordsWithAssets.length - 1) {
        setExerciseIndex((prev) => prev + 1);
        setAnsweredId(null);
        setBoxOpened(false);
      }
    }, 1100);
  };

  const handleMemoryCard = (cardId: string, pairId: string) => {
    if (openCards.includes(cardId) || matchedPairs.includes(pairId)) return;
    if (openCards.length === 2) return;

    const nextOpen = [...openCards, cardId];
    setOpenCards(nextOpen);

    if (nextOpen.length === 2) {
      const [firstId, secondId] = nextOpen;
      const firstCard = memoryDeck.find((card) => card.id === firstId);
      const secondCard = memoryDeck.find((card) => card.id === secondId);

      if (
        firstCard &&
        secondCard &&
        firstCard.pairId === secondCard.pairId &&
        firstCard.kind !== secondCard.kind
      ) {
        window.setTimeout(() => {
          setMatchedPairs((prev) => [...prev, pairId]);
          setOpenCards([]);
          setRewardBurst({ id: Date.now(), text: "Bien joué !" });
        }, 350);
      } else {
        window.setTimeout(() => {
          setOpenCards([]);
        }, 850);
      }
    }
  };

  const handleSelectSound = (soundId: string) => {
    if (matchedSoundIds.includes(soundId)) return;
    setActiveSoundId(soundId);
    setSelectedToyId(null);
  };

  const handleSelectSoundToy = (toyId: string) => {
    if (!activeSoundId || matchedSoundIds.includes(toyId)) return;

    setSelectedToyId(toyId);

    if (toyId === activeSoundId) {
      window.setTimeout(() => {
        setMatchedSoundIds((prev) => [...prev, toyId]);
        setActiveSoundId(null);
        setSelectedToyId(null);
        setRewardBurst({ id: Date.now(), text: "Oui !" });
      }, 250);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[linear-gradient(180deg,#dff6ff_0%,#fff7d8_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,210,63,0.24),transparent_24%),radial-gradient(circle_at_top_right,rgba(76,201,240,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(247,127,0,0.16),transparent_24%)]" />
      {rewardBurst && (
        <div
          key={rewardBurst.id}
          className="pointer-events-none absolute left-1/2 top-28 z-40 -translate-x-1/2 kid-success-burst"
        >
          <div className="relative rounded-full border-4 border-white bg-yellow px-6 py-3 text-lg font-black text-navy shadow-[0_16px_34px_rgba(32,42,68,0.18)]">
            <span className="inline-flex items-center gap-2">
              <Star className="h-5 w-5 fill-current" />
              {rewardBurst.text}
              <Star className="h-5 w-5 fill-current" />
            </span>
            <span className="classroom-star-float classroom-star-float-a">⭐</span>
            <span className="classroom-star-float classroom-star-float-b">✨</span>
            <span className="classroom-star-float classroom-star-float-c">⭐</span>
          </div>
        </div>
      )}
      <div className="relative max-w-6xl mx-auto px-4 py-5 md:px-6 md:py-8">
        <header className="rounded-[2.5rem] border-4 border-white/80 bg-white/88 p-5 md:p-6 shadow-[0_18px_48px_rgba(32,42,68,0.14)] backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => navigate(config.routeBase)}
                className="h-14 w-14 rounded-[1.35rem] bg-white text-navy shadow-[0_8px_0_rgba(32,42,68,0.08)] flex items-center justify-center"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-navy/75 bg-navy/5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {config.badge}
                </div>
                <h1 className="mt-3 text-3xl md:text-5xl font-black text-navy leading-none">
                  {config.title}
                </h1>
                <p className="mt-2 text-navy/65 font-bold text-base md:text-lg">
                  {pack.title} · Unit {pack.unit} · Lesson {pack.lesson}
                </p>
                <p className="mt-1 text-blue font-black uppercase tracking-[0.18em] text-xs">
                  {config.subtitle}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border-4 border-white bg-white/90 px-5 py-4 shadow-[0_12px_30px_rgba(32,42,68,0.08)]">
              <div className="flex items-center gap-4">
                <div
                  className="h-16 w-16 rounded-[1.5rem] border-4 border-white shadow-[0_10px_0_rgba(0,0,0,0.12)] flex items-center justify-center"
                  style={{ background: config.accent }}
                >
                  {config.icon}
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-navy/45">
                    Phrase magique
                  </div>
                  <div className="mt-1 text-xl font-black text-navy">
                    {pack.subtitle}
                  </div>
                  <div className="text-sm font-bold text-blue">
                    {selectedKid.name} · {selectedLesson?.title}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-6">
          {activityFinished && (
            <section className="mb-6 kid-complete-pop">
              <div className="rounded-[2.5rem] border-4 border-white bg-[linear-gradient(135deg,#fff4bf_0%,#ffffff_52%,#dff6ff_100%)] p-6 md:p-7 text-center shadow-[0_22px_50px_rgba(32,42,68,0.14)]">
                <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full border-4 border-white bg-yellow text-navy shadow-[0_10px_0_rgba(239,191,4,0.35)]">
                  <Sparkles className="h-9 w-9" />
                </div>
                <h2 className="mt-4 text-3xl font-black text-navy">
                  Activité terminée !
                </h2>
                <p className="mt-2 text-base font-bold text-navy/60">
                  {activityType === "exercise"
                    ? `Tu as trouvé ${exerciseScore} bonne${exerciseScore > 1 ? "s" : ""} réponse${exerciseScore > 1 ? "s" : ""}.`
                    : activityType === "vocab"
                      ? "Tu as découvert toutes les cartes."
                      : isLesson1BoxGame
                        ? "Tu as trouvé tous les jouets cachés."
                        : isLesson2SoundGame
                        ? "Tu as retrouvé tous les jouets avec les sons."
                        : "Tu as trouvé toutes les paires."}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetActivity}
                    className="rounded-full bg-orange px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_10px_0_rgba(247,127,0,0.35)]"
                  >
                    Rejouer
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(config.routeBase)}
                    className="rounded-full bg-blue px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_10px_0_rgba(29,111,163,0.35)]"
                  >
                    Autre leçon
                  </button>
                </div>
              </div>
            </section>
          )}

          {activityType === "vocab" && (
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {keywordsWithAssets.map((keyword) => {
                const flipped = flippedVocabIds.includes(keyword.id);
                return (
                  <button
                    key={keyword.id}
                    type="button"
                    onClick={() => toggleVocabCard(keyword.id)}
                    className="group text-left [perspective:1200px]"
                  >
                    <div
                      className={[
                        "relative min-h-[300px] rounded-[2.25rem] transition-transform duration-500 [transform-style:preserve-3d]",
                        flipped ? "[transform:rotateY(180deg)]" : "",
                      ].join(" ")}
                    >
                      <div className="absolute inset-0 rounded-[2.25rem] border-4 border-white bg-white p-6 shadow-[0_18px_36px_rgba(32,42,68,0.12)] [backface-visibility:hidden]">
                        {isNegativeLesson && (
                          <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-3xl font-black text-white shadow-[0_10px_20px_rgba(244,63,94,0.28)]">
                            ×
                          </div>
                        )}
                        <div
                          className="h-24 w-24 rounded-[2rem] border-4 border-white shadow-[0_12px_0_rgba(0,0,0,0.12)] flex items-center justify-center overflow-hidden"
                          style={{
                            background: keyword.color,
                            boxShadow: `0 18px 28px ${keyword.shadow}`,
                          }}
                        >
                          {keyword.imageUrl ? (
                            <img
                              src={keyword.imageUrl}
                              alt={keyword.word}
                              className="w-full h-full object-contain p-3"
                            />
                          ) : (
                            <span className="text-5xl">{keyword.emoji}</span>
                          )}
                        </div>
                        <div className="mt-8 text-[11px] uppercase tracking-[0.2em] font-black text-blue">
                          Tap to flip
                        </div>
                        <div className="mt-3 text-4xl font-black text-navy">
                          {keyword.word}
                        </div>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow/20 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange">
                          <Volume2 className="w-4 h-4" />
                          Say the word
                        </div>
                      </div>

                      <div className="absolute inset-0 rounded-[2.25rem] border-4 border-white bg-linear-to-br from-blue via-lightBlue to-turquoise p-6 text-white shadow-[0_18px_36px_rgba(33,158,188,0.2)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <div className="text-[11px] uppercase tracking-[0.2em] font-black text-white/80">
                          Great job
                        </div>
                        {isNegativeLesson && (
                          <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-3xl font-black text-white shadow-[0_10px_20px_rgba(244,63,94,0.28)]">
                            ×
                          </div>
                        )}
                        <div className="mt-5 h-28 w-28 rounded-[2rem] border-4 border-white/70 bg-white/15 flex items-center justify-center overflow-hidden">
                          {keyword.imageUrl ? (
                            <img
                              src={keyword.imageUrl}
                              alt={keyword.word}
                              className="w-full h-full object-contain p-3"
                            />
                          ) : (
                            <span className="text-6xl">{keyword.emoji}</span>
                          )}
                        </div>
                <div className="mt-5 text-4xl font-black">
                          {keyword.word}
                        </div>
                        <div className="mt-4 rounded-[1.6rem] bg-white/15 px-4 py-4 text-xl font-black">
                          {buildKeywordSentence(pack.sentencePattern, keyword)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {activityType === "exercise" && (
            <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="xl:col-span-2 rounded-[2.5rem] border-4 border-white bg-linear-to-br from-navy to-deepBlue p-6 text-white shadow-[0_22px_50px_rgba(32,42,68,0.22)]">
                <div className="text-[11px] uppercase tracking-[0.2em] font-black text-white/70">
                  Read and choose
                </div>
                {isNegativeLesson && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-400/20 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-rose-100">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-lg leading-none text-white">
                      ×
                    </span>
                    Je n'ai pas ce jouet
                  </div>
                )}
                <div className="mt-5 text-4xl md:text-5xl font-black leading-tight">
                  {currentKeyword
                    ? buildKeywordSentence(pack.sentencePattern, currentKeyword)
                    : ""}
                </div>
                <p className="mt-4 text-white/80 font-bold text-lg">
                  {isNegativeLesson
                    ? "Choisis le jouet que tu n'as pas."
                    : "Tap the matching picture."}
                </p>

                <div className="mt-8 rounded-[1.75rem] bg-white/10 px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] font-black text-white/70">
                    Score
                  </div>
                  <div className="mt-2 text-3xl font-black">
                    {exerciseScore} / {keywordsWithAssets.length}
                  </div>
                </div>

                {answeredId && (
                  <div
                    className={[
                      "mt-5 rounded-[1.75rem] px-4 py-4 text-lg font-black",
                      answeredId === currentKeyword?.id
                        ? "bg-[#E9FFEF] text-[#2B9348]"
                        : "bg-[#FFF0F4] text-[#D90429]",
                    ].join(" ")}
                  >
                    {answeredId === currentKeyword?.id
                      ? "Bravo !"
                      : `C'était ${currentKeyword?.word || ""}.`}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNextExercise}
                  disabled={exerciseFinished}
                  className="mt-6 rounded-full bg-yellow px-6 py-4 text-navy text-lg font-black shadow-[0_10px_0_rgba(0,0,0,0.14)]"
                >
                  {exerciseFinished ? "Terminé" : "Image suivante"}
                </button>
              </div>

              <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {exerciseChoices.map((keyword) => {
                  const isCorrect = answeredId && keyword.id === currentKeyword?.id;
                  const isChosen = answeredId === keyword.id;
                  return (
                    <button
                      key={keyword.id}
                      type="button"
                      onClick={() => handleExerciseChoice(keyword)}
                      className={[
                        "rounded-[2.25rem] border-4 border-white bg-white p-5 text-left shadow-[0_18px_36px_rgba(32,42,68,0.12)] transition hover:-translate-y-1",
                        isCorrect ? "ring-4 ring-[#7AE582]" : "",
                        isChosen && !isCorrect ? "ring-4 ring-[#FF8FAB]" : "",
                      ].join(" ")}
                    >
                      <div
                        className="relative h-28 w-28 rounded-[2rem] border-4 border-white shadow-[0_12px_0_rgba(0,0,0,0.12)] flex items-center justify-center overflow-hidden"
                        style={{
                          background: keyword.color,
                          boxShadow: `0 18px 30px ${keyword.shadow}`,
                        }}
                      >
                        {isNegativeKeyword(keyword) && (
                          <div className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-2xl font-black text-white shadow-[0_8px_16px_rgba(244,63,94,0.3)]">
                            ×
                          </div>
                        )}
                        {keyword.imageUrl ? (
                          <img
                            src={keyword.imageUrl}
                            alt={keyword.word}
                            className="w-full h-full object-contain p-3"
                          />
                        ) : (
                          <span className="text-6xl">{keyword.emoji}</span>
                        )}
                      </div>
                      <div className="mt-5 text-3xl font-black text-navy capitalize">
                        {keyword.word}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {activityType === "game" && isLesson1BoxGame && currentKeyword && (
            <section className="space-y-6">
              <div className="rounded-[2.5rem] border-4 border-white bg-white/90 p-5 md:p-6 shadow-[0_18px_46px_rgba(32,42,68,0.12)]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] font-black text-orange">
                      Surprise box
                    </div>
                    <div className="mt-1 text-3xl font-black text-navy">
                      What&apos;s in the Box?
                    </div>
                    <p className="mt-2 text-sm font-bold text-navy/55">
                      Appuie sur le cadeau, regarde le jouet sortir, puis choisis
                      la bonne phrase.
                    </p>
                  </div>
                  <div className="rounded-full bg-yellow/20 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-orange">
                    Jouet {exerciseIndex + 1} / {keywordsWithAssets.length}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!boxOpened) setBoxOpened(true);
                }}
                className="relative w-full overflow-hidden rounded-[2.8rem] border-4 border-white p-8 md:p-10 shadow-[0_18px_46px_rgba(32,42,68,0.14)] transition-transform hover:-translate-y-1"
                style={{
                  background: boxOpened
                    ? currentKeyword.color
                    : "linear-gradient(135deg, #FFF4BF 0%, #FFFFFF 52%, #DFF6FF 100%)",
                  boxShadow: boxOpened
                    ? `0 24px 40px ${currentKeyword.shadow}`
                    : undefined,
                }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.34),transparent_48%)]" />
                {!boxOpened ? (
                  <div className="relative flex flex-col items-center justify-center text-center">
                    <div className="text-8xl md:text-9xl drop-shadow-[0_12px_18px_rgba(32,42,68,0.16)]">
                      🎁
                    </div>
                    <h2 className="mt-5 text-3xl md:text-4xl font-black text-navy">
                      Tap the box
                    </h2>
                    <p className="mt-3 text-base md:text-lg font-bold text-navy/60">
                      Un jouet surprise va sortir...
                    </p>
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center justify-center text-center">
                    <div className="flex h-34 w-34 md:h-40 md:w-40 items-center justify-center rounded-full border-4 border-white/80 bg-white/20 shadow-[0_16px_30px_rgba(255,255,255,0.18)]">
                      {currentKeyword.imageUrl ? (
                        <img
                          src={currentKeyword.imageUrl}
                          alt={currentKeyword.word}
                          className="h-28 w-28 md:h-32 md:w-32 object-contain"
                        />
                      ) : (
                        <span className="text-7xl md:text-8xl">
                          {currentKeyword.emoji}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-6 text-3xl md:text-4xl font-black text-white drop-shadow-[0_6px_10px_rgba(32,42,68,0.2)]">
                      What is it?
                    </h2>
                    <p className="mt-3 text-base md:text-lg font-bold text-white/90">
                      Choisis la bonne phrase.
                    </p>
                  </div>
                )}
              </button>

              {boxOpened && (
                <div className="grid grid-cols-1 gap-4">
                  {boxChoices.map((keyword) => {
                    const isCorrect =
                      answeredId !== null && keyword.id === currentKeyword.id;
                    const isWrong =
                      answeredId === keyword.id &&
                      keyword.id !== currentKeyword.id;

                    return (
                      <button
                        key={keyword.id}
                        type="button"
                        onClick={() => handleBoxChoice(keyword)}
                        disabled={answeredId !== null}
                        className={[
                          "rounded-[2rem] border-4 bg-white px-5 py-5 text-center shadow-[0_16px_28px_rgba(32,42,68,0.1)] transition-all",
                          isCorrect
                            ? "border-green-300 bg-green-50 text-green-800"
                            : isWrong
                              ? "border-rose-300 bg-rose-50 text-rose-800"
                              : "border-white text-navy hover:-translate-y-0.5",
                        ].join(" ")}
                      >
                        <span className="text-lg md:text-xl font-black">
                          {buildKidSentence(pack.sentencePattern, keyword.word)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activityType === "game" && isLesson2SoundGame && (
            <section className="rounded-[2.5rem] border-4 border-white bg-white/90 p-5 md:p-6 shadow-[0_18px_46px_rgba(32,42,68,0.12)]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] font-black text-orange">
                    Listen and match
                  </div>
                  <div className="mt-1 text-3xl font-black text-navy">
                    Sound Match
                  </div>
                  <p className="mt-2 text-sm font-bold text-navy/55">
                    Appuie sur un son puis touche le jouet qui va avec.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-blue">
                    {matchedSoundIds.length} / {keywordsWithAssets.length} jouets
                  </div>
                  <button
                    type="button"
                    onClick={resetGame}
                    className="rounded-full bg-orange px-4 py-3 text-white font-black shadow-[0_10px_0_rgba(247,127,0,0.35)] flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restart
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.25fr] gap-6">
                <div className="rounded-[2.2rem] bg-[linear-gradient(180deg,rgba(33,158,188,0.09)_0%,rgba(255,255,255,0.96)_100%)] border-4 border-white p-4 md:p-5">
                  <div className="text-[11px] uppercase tracking-[0.18em] font-black text-blue">
                    Sounds
                  </div>
                  <div className="mt-4 space-y-3">
                    {soundPrompts.map((soundPrompt) => {
                      const isMatched = matchedSoundIds.includes(soundPrompt.id);
                      const isActive = activeSoundId === soundPrompt.id;

                      return (
                        <button
                          key={soundPrompt.id}
                          type="button"
                          onClick={() => handleSelectSound(soundPrompt.id)}
                          disabled={isMatched}
                          className={[
                            "w-full rounded-[1.8rem] border-4 px-4 py-4 text-left transition-all flex items-center justify-between gap-3",
                            isMatched
                              ? "border-green-200 bg-green-50 text-green-700"
                              : isActive
                                ? "border-blue bg-blue/10 text-blue shadow-[0_10px_20px_rgba(33,158,188,0.18)]"
                                : "border-white bg-white text-navy hover:-translate-y-0.5",
                          ].join(" ")}
                        >
                          <span className="flex items-center gap-3">
                            <span className="h-12 w-12 rounded-full bg-blue text-white flex items-center justify-center shadow-[0_6px_0_rgba(29,111,163,0.35)]">
                              <Volume2 className="w-5 h-5" />
                            </span>
                            <span>
                              <span className="block text-[11px] font-black uppercase tracking-[0.18em] opacity-60">
                                Son {soundPrompt.order}
                              </span>
                              <span className="block text-base font-black">
                                {isMatched
                                  ? "Trouvé"
                                  : isActive
                                    ? "Choisi"
                                    : "Écouter"}
                              </span>
                            </span>
                          </span>
                          <span className="text-xs font-black uppercase tracking-[0.18em] opacity-55">
                            {isMatched ? "OK" : "Tap"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-xs font-bold text-navy/45">
                    Le vrai son sera ajouté plus tard.
                  </p>
                </div>

                <div className="rounded-[2.2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,247,216,0.92)_100%)] border-4 border-white p-4 md:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] font-black text-orange">
                        Toys
                      </div>
                      <div className="mt-1 text-xl font-black text-navy">
                        {activeSoundId
                          ? "Trouve le bon jouet"
                          : "Choisis d'abord un son"}
                      </div>
                    </div>
                    {activeSoundId && (
                      <div className="rounded-full bg-yellow/30 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange">
                        Son actif
                      </div>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {soundGameToys.map((keyword) => {
                      const isMatched = matchedSoundIds.includes(keyword.id);
                      const isCorrectChoice =
                        selectedToyId === keyword.id && activeSoundId === keyword.id;
                      const isWrongChoice =
                        selectedToyId === keyword.id &&
                        activeSoundId !== null &&
                        activeSoundId !== keyword.id;

                      return (
                        <button
                          key={keyword.id}
                          type="button"
                          onClick={() => handleSelectSoundToy(keyword.id)}
                          disabled={!activeSoundId || isMatched}
                          className={[
                            "rounded-[2rem] border-4 bg-white p-4 text-center shadow-[0_16px_28px_rgba(32,42,68,0.1)] transition-all",
                            !activeSoundId || isMatched
                              ? "opacity-70 cursor-not-allowed"
                              : "hover:-translate-y-1",
                            isMatched
                              ? "border-green-300"
                              : isCorrectChoice
                                ? "border-green-300 ring-4 ring-green-100"
                                : isWrongChoice
                                  ? "border-rose-300 ring-4 ring-rose-100"
                                  : "border-white",
                          ].join(" ")}
                        >
                          <div
                            className="mx-auto h-24 w-24 rounded-[1.8rem] border-4 border-white shadow-[0_10px_0_rgba(0,0,0,0.10)] flex items-center justify-center overflow-hidden"
                            style={{
                              background: keyword.color,
                              boxShadow: `0 16px 24px ${keyword.shadow}`,
                            }}
                          >
                            {keyword.imageUrl ? (
                              <img
                                src={keyword.imageUrl}
                                alt={keyword.word}
                                className="w-full h-full object-contain p-2"
                              />
                            ) : (
                              <span className="text-5xl">{keyword.emoji}</span>
                            )}
                          </div>
                          <div className="mt-4 text-lg font-black text-navy capitalize">
                            {keyword.word}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activityType === "game" &&
            !isLesson1BoxGame &&
            !isLesson2SoundGame && (
            <section className="rounded-[2.5rem] border-4 border-white bg-white/90 p-5 md:p-6 shadow-[0_18px_46px_rgba(32,42,68,0.12)]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] font-black text-orange">
                    Find the pairs
                  </div>
                  <div className="mt-1 text-3xl font-black text-navy">
                    Memory Match
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-blue">
                    {matchedPairs.length} / {keywordsWithAssets.length} pairs
                  </div>
                  <button
                    type="button"
                    onClick={resetGame}
                    className="rounded-full bg-orange px-4 py-3 text-white font-black shadow-[0_10px_0_rgba(247,127,0,0.35)] flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restart
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {memoryDeck.map((card) => {
                  const keyword = keywordsWithAssets.find((item) => item.id === card.pairId);
                  const isOpen =
                    openCards.includes(card.id) || matchedPairs.includes(card.pairId);
                  if (!keyword) return null;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleMemoryCard(card.id, card.pairId)}
                      className="group aspect-square [perspective:1200px]"
                    >
                      <div
                        className={[
                          "relative h-full w-full rounded-[2rem] transition-transform duration-500 [transform-style:preserve-3d]",
                          isOpen ? "[transform:rotateY(180deg)]" : "",
                        ].join(" ")}
                      >
                        <div className="absolute inset-0 rounded-[2rem] border-4 border-white bg-linear-to-br from-blue to-lightBlue shadow-[0_14px_30px_rgba(33,158,188,0.22)] flex items-center justify-center text-white text-5xl font-black [backface-visibility:hidden]">
                          ★
                        </div>
                        <div className="absolute inset-0 rounded-[2rem] border-4 border-white bg-white shadow-[0_14px_30px_rgba(32,42,68,0.12)] [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center gap-3 p-4 text-navy">
                          <div
                            className="relative h-18 w-18 rounded-[1.4rem] border-4 border-white shadow-[0_10px_0_rgba(0,0,0,0.10)] flex items-center justify-center overflow-hidden"
                            style={{
                              background: keyword.color,
                              boxShadow: `0 16px 24px ${keyword.shadow}`,
                            }}
                          >
                          {isNegativeKeyword(keyword) && card.kind === "emoji" && (
                            <div className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-xl font-black text-white shadow-[0_8px_16px_rgba(244,63,94,0.28)]">
                              ×
                            </div>
                          )}
                          {card.kind === "emoji" ? (
                            keyword.imageUrl ? (
                              <img
                                  src={keyword.imageUrl}
                                  alt={keyword.word}
                                  className="w-full h-full object-contain p-2"
                                />
                              ) : (
                                <span className="text-4xl">{keyword.emoji}</span>
                              )
                            ) : (
                              "🔤"
                            )}
                          </div>
                          <div className="text-2xl font-black capitalize">
                            {pack.lesson === 3 && card.kind === "word"
                              ? buildKeywordSentence(pack.sentencePattern, keyword)
                              : keyword.word}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
