import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKidMode } from "../../hooks/useKidMode";
import lessonService, { type Lesson, type Unit } from "../../services/lesson.service";
import { getKidLessonPack, type KidActivityType } from "../../data/kidLessonActivities";
import { kidActivityConfig } from "./activityConfig";
import { KidExerciseLessonChooser } from "./scenarios/exercise/KidExerciseLessonChooser";
import { KidGameChooser } from "./scenarios/game/KidGameChooser";
import {
  type LessonCardUnit,
  type KidLessonChooserScenarioProps,
} from "./scenarios/common/kidLessonChooserShared";
import { KidVocabLessonChooser } from "./scenarios/vocab/KidVocabLessonChooser";

interface KidActivityLessonChooserProps {
  activityType: KidActivityType;
}

export const KidActivityLessonChooser: React.FC<KidActivityLessonChooserProps> = ({ activityType }) => {
  const navigate = useNavigate();
  const { selectedKid, isKidMode } = useKidMode();
  const [units, setUnits] = useState<Unit[]>([]);
  const [suggestedLessonId, setSuggestedLessonId] = useState<string | null>(null);
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(null);
  const config = kidActivityConfig[activityType];

  const requestKey = isKidMode && selectedKid?.id && selectedKid.level ? `${selectedKid.id}:${selectedKid.level}` : null;
  const loading = requestKey !== null && resolvedRequestKey !== requestKey;

  useEffect(() => {
    if (!requestKey || !selectedKid?.id || !selectedKid.level) return;

    let cancelled = false;

    lessonService
      .getLessonsByKidAndLevel(selectedKid.id, selectedKid.level)
      .then((data) => {
        if (cancelled) return;
        setUnits(data.units);
        setSuggestedLessonId(data.suggestedLessonId);
        setResolvedRequestKey(requestKey);
      })
      .catch((error) => {
        console.error("Failed to load kid activity lessons", error);
        if (!cancelled) {
          setUnits([]);
          setSuggestedLessonId(null);
          setResolvedRequestKey(requestKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, selectedKid?.id, selectedKid?.level]);

  const lessonCards = useMemo<LessonCardUnit[]>(
    () =>
      units.map((unit) => ({
        ...unit,
        lessons: unit.lessons.map((lesson) => ({
          lesson,
          available: !!getKidLessonPack({
            level: selectedKid?.level,
            unit: unit.order,
            lesson: lesson.order,
          }),
        })),
      })),
    [selectedKid?.level, units],
  );

  const handleSelectLesson = (lesson: Lesson, available: boolean) => {
    if (lesson.isLocked || !available) return;
    navigate(`${config.routeBase}/${lesson.id}`);
  };

  const scenarioProps: KidLessonChooserScenarioProps = {
    config,
    kidName: selectedKid?.name,
    kidLevel: selectedKid?.level,
    avatarSrc: selectedKid?.avatarUrl,
    lessonCards,
    loading,
    suggestedLessonId,
    onBack: () => navigate("/kid-dashboard"),
    onSelectLesson: handleSelectLesson,
  };

  switch (activityType) {
    case "exercise":
      return <KidExerciseLessonChooser {...scenarioProps} />;
    case "vocab":
      return <KidVocabLessonChooser {...scenarioProps} />;
    case "game":
      return <KidGameChooser {...scenarioProps} />;
  }
};
