import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import lessonService, {
  type Lesson,
  type RevisionAsset,
} from "../../services/lesson.service";
import {
  getKidLessonPack,
  type KidActivityType,
  type KidLessonKeyword,
  type KidLessonKeywordWithAsset,
} from "../../data/kidLessonActivities";
import { useKidMode } from "../../hooks/useKidMode";
import { kidActivityConfig } from "./activityConfig";
import { shuffle } from "./kidActivityHelpers";
import {
  ActivityCompletionBanner,
  KidActivityExperienceHeader,
} from "./KidActivityExperienceSections";
import { KidActivityScenarioRenderer } from "./scenarios";
import { hasKidActivityScenario } from "./scenarios/scenarioRegistry";
import {
  KidActivityLoadingCard,
  KidActivityPendingCard,
  KidActivityRewardBurst,
  KidActivityScene,
} from "./kidActivityShared";

interface KidActivityExperienceProps {
  activityType: KidActivityType;
}

export const KidActivityExperience: React.FC<KidActivityExperienceProps> = ({
  activityType,
}) => {
  const { lessonId } = useParams<{ lessonId: string }>();

  return (
    <KidActivityExperienceContent
      key={`${activityType}:${lessonId ?? "unknown-lesson"}`}
      activityType={activityType}
    />
  );
};

const KidActivityExperienceContent: React.FC<KidActivityExperienceProps> = ({
  activityType,
}) => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { isKidMode, selectedKid } = useKidMode();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedUnitOrder, setSelectedUnitOrder] = useState<number | null>(
    null,
  );
  const [resolvedLessonRequestKey, setResolvedLessonRequestKey] = useState<
    string | null
  >(null);
  const [revisionAssets, setRevisionAssets] = useState<RevisionAsset[]>([]);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [exerciseScore, setExerciseScore] = useState(0);
  const [answeredId, setAnsweredId] = useState<string | null>(null);
  const [binaryChoice, setBinaryChoice] = useState<"have" | "have_not" | null>(
    null,
  );
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
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [prevLessonId, setPrevLessonId] = useState<string | null>(null);
  const rewardBurstIdRef = useRef(0);

  const config = kidActivityConfig[activityType];
  const lessonRequestKey =
    isKidMode && selectedKid?.id && selectedKid.level && lessonId
      ? `${selectedKid.id}:${selectedKid.level}:${lessonId}`
      : null;
  const loadingLesson =
    lessonRequestKey !== null && resolvedLessonRequestKey !== lessonRequestKey;
  const pack = getKidLessonPack({
    level: selectedKid?.level,
    unit: selectedUnitOrder ?? undefined,
    lesson: selectedLesson?.order,
  });

  useEffect(() => {
    if (
      !lessonRequestKey ||
      !selectedKid?.id ||
      !selectedKid.level ||
      !lessonId
    ) {
      return;
    }

    let cancelled = false;

    lessonService
      .getLessonsByKidAndLevel(selectedKid.id, selectedKid.level)
      .then((data) => {
        if (cancelled) return;

        let found = false;
        const allLessons = data.units.flatMap((u) => u.lessons);
        for (const unit of data.units) {
          const lessonIndex = unit.lessons.findIndex((item) => item.id === lessonId);
          if (lessonIndex !== -1) {
            setSelectedLesson(unit.lessons[lessonIndex]);
            setSelectedUnitOrder(unit.order);
            setResolvedLessonRequestKey(lessonRequestKey);
            
            const overallIndex = allLessons.findIndex((item) => item.id === lessonId);
            if (overallIndex !== -1) {
              if (overallIndex + 1 < allLessons.length) {
                setNextLessonId(allLessons[overallIndex + 1].id);
              } else {
                setNextLessonId(null);
              }
              if (overallIndex - 1 >= 0) {
                setPrevLessonId(allLessons[overallIndex - 1].id);
              } else {
                setPrevLessonId(null);
              }
            } else {
              setNextLessonId(null);
              setPrevLessonId(null);
            }
            
            found = true;
            break;
          }
        }

        if (!found) {
          setSelectedLesson(null);
          setSelectedUnitOrder(null);
          setNextLessonId(null);
          setPrevLessonId(null);
          setResolvedLessonRequestKey(lessonRequestKey);
        }
      })
      .catch((error) => {
        console.error("Failed to load kid lesson for activities", error);
        if (!cancelled) {
          setSelectedLesson(null);
          setSelectedUnitOrder(null);
          setNextLessonId(null);
          setPrevLessonId(null);
          setResolvedLessonRequestKey(lessonRequestKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lessonRequestKey, lessonId, selectedKid?.id, selectedKid?.level]);

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
      const keywordImageName = keyword.imageName.toLowerCase();
      const keywordFileName = keyword.imageName.split("/").pop()?.toLowerCase();
      const asset = revisionAssets.find(
        (item) => {
          const assetName = item.name.toLowerCase();
          return assetName === keywordImageName || assetName === keywordFileName;
        },
      );

      return {
        ...keyword,
        imageUrl:
          asset?.url ||
          (keyword.imageName ? `/images/lesson/${keyword.imageName}` : undefined),
      };
    });
  }, [pack, revisionAssets]);

  const isLesson2FamilyFeelingActivity =
    pack?.level === "L0" &&
    pack.unit === 2 &&
    pack.lesson === 1 &&
    (activityType === "exercise" || activityType === "game");

  const isL0U2L2ExtraActivity =
    pack?.level === "L0" &&
    pack.unit === 2 &&
    pack.lesson === 2 &&
    (activityType === "exercise" || activityType === "game");

  const familyFeelingKeywordsWithAssets = useMemo<KidLessonKeywordWithAsset[]>(() => {
    if (!isLesson2FamilyFeelingActivity) {
      return keywordsWithAssets;
    }

    const familyKeywordMap = new Map(
      keywordsWithAssets
        .filter((keyword) =>
          ["dad", "mom", "brother", "sister"].includes(keyword.id),
        )
        .map((keyword) => [keyword.id, keyword] as const),
    );

    const familyRounds = ["dad", "mom", "brother", "sister"]
      .map((familyId) => familyKeywordMap.get(familyId))
      .filter((keyword): keyword is KidLessonKeywordWithAsset => Boolean(keyword));

    const sentenceConfigs = [
      {
        id: "dad-happy",
        familyId: "dad",
        sentence: "Dad is happy.",
      },
      {
        id: "dad-sad",
        familyId: "dad",
        sentence: "Dad is sad.",
      },
      {
        id: "mom-happy",
        familyId: "mom",
        sentence: "Mom is happy.",
      },
      {
        id: "mom-sad",
        familyId: "mom",
        sentence: "Mom is sad.",
      },
      {
        id: "brother-happy",
        familyId: "brother",
        sentence: "My brother is happy.",
      },
      {
        id: "brother-sad",
        familyId: "brother",
        sentence: "My brother is sad.",
      },
      {
        id: "sister-happy",
        familyId: "sister",
        sentence: "My sister is happy.",
      },
      {
        id: "sister-sad",
        familyId: "sister",
        sentence: "My sister is sad.",
      },
    ] as const;

    const sentenceRounds = sentenceConfigs.map((config) => {
      const baseKeyword = familyKeywordMap.get(config.familyId);

      return {
        id: config.id,
        word: config.sentence,
        imageName: `feelings/${config.id}.png`,
        color: baseKeyword?.color ?? "linear-gradient(135deg, #6FE7FF 0%, #219EBC 100%)",
        shadow: baseKeyword?.shadow ?? "rgba(33, 158, 188, 0.28)",
        imageUrl: `/images/lesson/feelings/${config.id}.png`,
      };
    });

    return [...familyRounds, ...sentenceRounds];
  }, [isLesson2FamilyFeelingActivity, keywordsWithAssets]);

  const pronounsExtraKeywordsWithAssets = useMemo<KidLessonKeywordWithAsset[]>(() => {
    if (!isL0U2L2ExtraActivity) {
      return keywordsWithAssets;
    }

    const pronounKeywordMap = new Map(
      keywordsWithAssets
        .filter((keyword) =>
          ["i", "you", "he", "she", "it"].includes(keyword.id),
        )
        .map((keyword) => [keyword.id, keyword] as const),
    );

    const pronounRounds = ["i", "you", "he", "she", "it"]
      .map((pronounId) => pronounKeywordMap.get(pronounId))
      .filter((keyword): keyword is KidLessonKeywordWithAsset => Boolean(keyword));

    const sentenceConfigs = [
      {
        id: "i-am-happy",
        pronounId: "i",
        sentence: "I am happy.",
        imagePath: "feelings/happy.png",
      },
      {
        id: "you-are-sad",
        pronounId: "you",
        sentence: "You are sad.",
        imagePath: "feelings/sad.png",
      },
      {
        id: "he-is-happy",
        pronounId: "he",
        sentence: "He is happy.",
        imagePath: "feelings/happy.png",
      },
      {
        id: "she-is-sad",
        pronounId: "she",
        sentence: "She is sad.",
        imagePath: "feelings/sad.png",
      },
      {
        id: "ive-got-a-sister",
        pronounId: "i",
        sentence: "I've got a sister.",
        imagePath: "family/sister.png",
      },
      {
        id: "ive-got-a-brother",
        pronounId: "i",
        sentence: "I've got a brother.",
        imagePath: "family/brother.png",
      },
    ] as const;

    const sentenceRounds = sentenceConfigs.map((config) => {
      const baseKeyword = pronounKeywordMap.get(config.pronounId);

      let color = baseKeyword?.color ?? "linear-gradient(135deg, #7DD3FC 0%, #0EA5E9 100%)";
      let shadow = baseKeyword?.shadow ?? "rgba(14, 165, 233, 0.28)";

      if (config.id.includes("sister")) {
        color = "linear-gradient(135deg, #F9A8D4 0%, #EC4899 100%)";
        shadow = "rgba(236, 72, 153, 0.28)";
      } else if (config.id.includes("brother")) {
        color = "linear-gradient(135deg, #FFD166 0%, #F77F00 100%)";
        shadow = "rgba(247, 127, 0, 0.28)";
      } else if (config.id === "i-am-happy" || config.id === "he-is-happy") {
        color = "linear-gradient(135deg, #FFE066 0%, #FFB703 100%)";
        shadow = "rgba(255, 183, 3, 0.28)";
      } else if (config.id === "you-are-sad" || config.id === "she-is-sad") {
        color = "linear-gradient(135deg, #A0D8FF 0%, #3A86FF 100%)";
        shadow = "rgba(58, 134, 255, 0.28)";
      }

      return {
        id: config.id,
        word: config.sentence,
        imageName: config.imagePath,
        color,
        shadow,
        imageUrl: `/images/lesson/${config.imagePath}`,
      };
    });

    return [...pronounRounds, ...sentenceRounds];
  }, [isL0U2L2ExtraActivity, keywordsWithAssets]);

  const exerciseKeywordsWithAssets =
    activityType === "exercise" && isLesson2FamilyFeelingActivity
      ? familyFeelingKeywordsWithAssets
      : activityType === "exercise" && isL0U2L2ExtraActivity
        ? pronounsExtraKeywordsWithAssets
        : keywordsWithAssets;

  const soundGameKeywordsWithAssets =
    activityType === "game" && isLesson2FamilyFeelingActivity
      ? familyFeelingKeywordsWithAssets
      : activityType === "game" && isL0U2L2ExtraActivity
        ? pronounsExtraKeywordsWithAssets
        : keywordsWithAssets;

  const scenarioKeywordsWithAssets =
    activityType === "exercise"
      ? exerciseKeywordsWithAssets
      : activityType === "game"
        ? soundGameKeywordsWithAssets
        : keywordsWithAssets;

  const exerciseSequence = useMemo(() => {
    if (!(activityType === "exercise" && (isLesson2FamilyFeelingActivity || isL0U2L2ExtraActivity))) {
      return shuffle(exerciseKeywordsWithAssets);
    }

    if (isLesson2FamilyFeelingActivity) {
      const familyRounds = exerciseKeywordsWithAssets.filter(
        (keyword) => !keyword.id.includes("-"),
      );
      const sentenceRounds = exerciseKeywordsWithAssets.filter((keyword) =>
        keyword.id.includes("-"),
      );

      return [...shuffle(familyRounds), ...shuffle(sentenceRounds)];
    }

    // For L0U2L2
    const pronounRounds = exerciseKeywordsWithAssets.filter(
      (keyword) => !keyword.id.includes("-") && !keyword.id.startsWith("ive"),
    );
    const sentenceRounds = exerciseKeywordsWithAssets.filter((keyword) =>
      keyword.id.includes("-") || keyword.id.startsWith("ive"),
    );

    return [...shuffle(pronounRounds), ...shuffle(sentenceRounds)];
  }, [activityType, exerciseKeywordsWithAssets, isLesson2FamilyFeelingActivity, isL0U2L2ExtraActivity]);

  const currentKeyword =
    exerciseSequence.length > 0
      ? exerciseSequence[exerciseIndex % exerciseSequence.length]
      : null;
  const isSoundGame =
    activityType === "game" &&
    pack?.level === "L0" &&
    ((pack.unit === 1 && pack.lesson === 2) ||
      (pack.unit === 2 && (pack.lesson === 1 || pack.lesson === 2)));
  const isLesson1BoxGame =
    activityType === "game" &&
    pack?.level === "L0" &&
    pack.unit === 1 &&
    pack.lesson === 1;
  const isLesson3BinaryGame =
    activityType === "game" &&
    pack?.level === "L0" &&
    pack.unit === 1 &&
    pack.lesson === 3;
  const isNegativeLesson = pack?.sentencePattern.includes("haven't") ?? false;

  const memoryDeck = useMemo(() => {
    if (!keywordsWithAssets.length) return [];

    return shuffle(
      keywordsWithAssets.flatMap((keyword) => [
        {
          id: `${keyword.id}-emoji`,
          pairId: keyword.id,
          kind: "emoji" as const,
        },
        { id: `${keyword.id}-word`, pairId: keyword.id, kind: "word" as const },
      ]),
    );
  }, [keywordsWithAssets]);

  const exerciseChoices = useMemo(() => {
    if (!currentKeyword) return [];

    const sourceChoices =
      activityType === "exercise" &&
      isLesson2FamilyFeelingActivity &&
      currentKeyword.id.includes("-")
        ? exerciseKeywordsWithAssets.filter((keyword) => keyword.id.includes("-"))
        : activityType === "exercise" && isLesson2FamilyFeelingActivity
          ? exerciseKeywordsWithAssets.filter((keyword) => !keyword.id.includes("-"))
          : activityType === "exercise" &&
            isL0U2L2ExtraActivity &&
            (currentKeyword.id.includes("-") || currentKeyword.id.startsWith("ive"))
            ? exerciseKeywordsWithAssets.filter(
                (keyword) => keyword.id.includes("-") || keyword.id.startsWith("ive"),
              )
            : activityType === "exercise" && isL0U2L2ExtraActivity
              ? exerciseKeywordsWithAssets.filter(
                  (keyword) => !keyword.id.includes("-") && !keyword.id.startsWith("ive"),
                )
              : exerciseKeywordsWithAssets;

    const distractors = shuffle(
      sourceChoices.filter((keyword) => keyword.id !== currentKeyword.id),
    ).slice(0, Math.min(3, Math.max(0, sourceChoices.length - 1)));

    return shuffle([currentKeyword, ...distractors]);
  }, [activityType, currentKeyword, exerciseKeywordsWithAssets, isLesson2FamilyFeelingActivity, isL0U2L2ExtraActivity]);

  const soundPrompts = useMemo(
    () =>
      shuffle(
        soundGameKeywordsWithAssets.map((keyword, index) => ({
          id: keyword.id,
          order: index + 1,
        })),
      ),
    [soundGameKeywordsWithAssets],
  );

  const soundGameToys = useMemo(
    () => shuffle(soundGameKeywordsWithAssets),
    [soundGameKeywordsWithAssets],
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
    exerciseKeywordsWithAssets.length > 0 &&
    answeredId !== null &&
    exerciseIndex === exerciseKeywordsWithAssets.length - 1;
  const vocabFinished =
    activityType === "vocab" &&
    keywordsWithAssets.length > 0 &&
    flippedVocabIds.length === keywordsWithAssets.length;
  const soundGameFinished =
    isSoundGame &&
    soundGameKeywordsWithAssets.length > 0 &&
    matchedSoundIds.length === soundGameKeywordsWithAssets.length;
  const boxGameFinished =
    isLesson1BoxGame &&
    keywordsWithAssets.length > 0 &&
    answeredId !== null &&
    exerciseIndex === keywordsWithAssets.length - 1;
  const binaryGameFinished =
    isLesson3BinaryGame &&
    keywordsWithAssets.length > 0 &&
    answeredId !== null &&
    exerciseIndex === keywordsWithAssets.length - 1;
  const memoryGameFinished =
    activityType === "game" &&
    !isLesson1BoxGame &&
    !isSoundGame &&
    !isLesson3BinaryGame &&
    keywordsWithAssets.length > 0 &&
    matchedPairs.length === keywordsWithAssets.length;
  const activityFinished =
    exerciseFinished ||
    vocabFinished ||
    soundGameFinished ||
    boxGameFinished ||
    binaryGameFinished ||
    memoryGameFinished;
  const scenarioExerciseFinished =
    exerciseFinished || boxGameFinished || binaryGameFinished;
  const hasScenario = pack
    ? hasKidActivityScenario(activityType, pack.level, pack.unit, pack.lesson)
    : false;

  const triggerRewardBurst = (text: string) => {
    rewardBurstIdRef.current += 1;
    setRewardBurst({ id: rewardBurstIdRef.current, text });
  };

  const toggleVocabCard = (keywordId: string) => {
    const shouldCelebrate = !flippedVocabIds.includes(keywordId);
    setFlippedVocabIds((prev) =>
      prev.includes(keywordId)
        ? prev.filter((id) => id !== keywordId)
        : [...prev, keywordId],
    );
    if (shouldCelebrate) {
      triggerRewardBurst("Super !");
    }
  };

  const handleExerciseChoice = (keyword: KidLessonKeyword) => {
    if (answeredId || !currentKeyword) return;
    setAnsweredId(keyword.id);
    if (keyword.id === currentKeyword.id) {
      setExerciseScore((prev) => prev + 1);
      triggerRewardBurst("Bravo !");
    }
  };

  const handleNextExercise = () => {
    setExerciseIndex((prev) =>
      keywordsWithAssets.length > 0
        ? (prev + 1) % exerciseKeywordsWithAssets.length
        : 0,
    );
    setAnsweredId(null);
    setBinaryChoice(null);
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
    setBinaryChoice(null);
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
      triggerRewardBurst("Bravo !");
      window.setTimeout(() => {
        if (exerciseIndex < keywordsWithAssets.length - 1) {
          setExerciseIndex((prev) => prev + 1);
          setAnsweredId(null);
          setBoxOpened(false);
          return;
        }
      }, 1100);
      return;
    }

    window.setTimeout(() => {
      setAnsweredId(null);
    }, 900);
  };

  const handleBinaryGameChoice = (
    keyword: KidLessonKeywordWithAsset,
    choice: "have" | "have_not",
  ) => {
    if (answeredId || !currentKeyword) return;

    setAnsweredId(keyword.id);
    setBinaryChoice(choice);

    const currentPossession =
      currentKeyword.possession === "have_not" ? "have_not" : "have";
    const isCorrect =
      keyword.id === currentKeyword.id && choice === currentPossession;

    if (isCorrect) {
      setExerciseScore((prev) => prev + 1);
      triggerRewardBurst("Bravo !");
    }
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
          triggerRewardBurst("Bien joué !");
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
      new Audio("/audio/feedback/correct.mp3").play().catch(console.error);
      window.setTimeout(() => {
        setMatchedSoundIds((prev) => [...prev, toyId]);
        setActiveSoundId(null);
        setSelectedToyId(null);
        triggerRewardBurst("Oui !");
      }, 250);
      return;
    }

    new Audio("/audio/feedback/wrong.mp3").play().catch(console.error);

    window.setTimeout(() => {
      setSelectedToyId(null);
    }, 700);
  };

  useEffect(() => {
    if (!isSoundGame) return;
    if (!soundGameKeywordsWithAssets.length) return;
    if (matchedSoundIds.length !== soundGameKeywordsWithAssets.length) return;

    new Audio("/audio/feedback/win.mp3").play().catch(console.error);
  }, [isSoundGame, matchedSoundIds.length, soundGameKeywordsWithAssets.length]);

  if (!isKidMode || !selectedKid) {
    navigate("/kid-dashboard", { replace: true });
    return null;
  }

  if (loadingLesson) {
    return (
      <KidActivityScene variant="chooser">
        <KidActivityLoadingCard
          title="Préparation de ta leçon"
          description="Nous retrouvons l'activité choisie..."
          pulse
        />
      </KidActivityScene>
    );
  }

  if (!pack) {
    return (
      <KidActivityScene variant="chooser">
        <KidActivityPendingCard
          title="Activité bientôt prête"
          description="Nous préparons encore cette activité pour la leçon choisie."
          buttonLabel="Retour aux leçons"
          onBack={() => navigate(config.routeBase)}
        />
      </KidActivityScene>
    );
  }

  if (!currentKeyword && activityType === "exercise") {
    return (
      <KidActivityScene variant="chooser">
        <KidActivityLoadingCard
          title="Préparation des images"
          description="Nous chargeons les images du cours..."
          pulse
        />
      </KidActivityScene>
    );
  }

  if (!hasScenario) {
    return (
      <KidActivityScene variant="chooser">
        <KidActivityPendingCard
          title="Activité en préparation"
          description="Cette activité n'a pas encore son composant dédié."
          buttonLabel="Retour aux leçons"
          onBack={() => navigate(config.routeBase)}
        />
      </KidActivityScene>
    );
  }

  return (
    <KidActivityScene variant="experience">
      {rewardBurst && (
        <KidActivityRewardBurst id={rewardBurst.id} text={rewardBurst.text} />
      )}

      <div className="relative mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8">
        <KidActivityExperienceHeader
          config={config}
          currentActivityType={activityType}
          kidAvatarSrc={selectedKid.avatarUrl}
          kidLevel={selectedKid.level}
          kidName={selectedKid.name}
          lessonTitle={selectedLesson?.title}
          lessonId={lessonId}
          pack={pack}
          onBack={() => navigate(config.routeBase)}
          onNavigateToActivity={(target) => {
            if (!lessonId) return;

            if (target === "video") {
              navigate(`/lesson/${lessonId}`);
              return;
            }

            const routeMap = {
              vocab: "/kid-vocabulary",
              exercise: "/kid-exercises",
              game: "/kid-games",
            } as const;

            navigate(`${routeMap[target]}/${lessonId}`);
          }}
          onPrevLesson={
            prevLessonId
              ? () => navigate(`${config.routeBase}/${prevLessonId}`)
              : undefined
          }
          onNextLesson={
            nextLessonId
              ? () => navigate(`${config.routeBase}/${nextLessonId}`)
              : undefined
          }
        />

        <main className="mt-6">
          {activityFinished && (
            <ActivityCompletionBanner
              activityType={activityType}
              exerciseScore={exerciseScore}
              isLesson1BoxGame={isLesson1BoxGame}
              isLesson2SoundGame={isSoundGame}
              onReplay={resetActivity}
              onChooseAnotherLesson={() => navigate(config.routeBase)}
              onNextLesson={
                nextLessonId
                  ? () => navigate(`${config.routeBase}/${nextLessonId}`)
                  : undefined
              }
            />
          )}

          <KidActivityScenarioRenderer
            activityType={activityType}
            level={pack.level}
            unit={pack.unit}
            lesson={pack.lesson}
            answeredId={answeredId}
            activeSoundId={activeSoundId}
            binaryChoice={binaryChoice}
            boxChoices={boxChoices}
            boxOpened={boxOpened}
            currentKeyword={currentKeyword}
            exerciseChoices={exerciseChoices}
            exerciseFinished={scenarioExerciseFinished}
            exerciseIndex={exerciseIndex}
            exerciseScore={exerciseScore}
            flippedVocabIds={flippedVocabIds}
            isNegativeLesson={isNegativeLesson}
            keywordsWithAssets={scenarioKeywordsWithAssets}
            matchedPairs={matchedPairs}
            matchedSoundIds={matchedSoundIds}
            memoryDeck={memoryDeck}
            openCards={openCards}
            pack={pack}
            selectedToyId={selectedToyId}
            soundGameToys={soundGameToys}
            soundPrompts={soundPrompts}
            onBoxChoose={handleBoxChoice}
            onChooseBinaryGame={handleBinaryGameChoice}
            onCardClick={handleMemoryCard}
            onChooseExercise={handleExerciseChoice}
            onNextExercise={handleNextExercise}
            onOpenBox={() => {
              if (!boxOpened) setBoxOpened(true);
            }}
            onResetGame={resetGame}
            onSelectSound={handleSelectSound}
            onSelectToy={handleSelectSoundToy}
            onToggleVocabCard={toggleVocabCard}
          />
        </main>
      </div>
    </KidActivityScene>
  );
};
