import React from "react";
import { useParams } from "react-router-dom";
import type { KidActivityType } from "../data/kidLessonActivities";
import { KidActivityLessonChooser } from "../components/kid-activities/KidActivityLessonChooser";

const KidActivityLessonsPage: React.FC = () => {
  const { activityType } = useParams<{ activityType: KidActivityType }>();

  const safeType: KidActivityType =
    activityType === "exercise" || activityType === "vocab" || activityType === "game"
      ? activityType
      : "exercise";

  return <KidActivityLessonChooser activityType={safeType} />;
};

export default KidActivityLessonsPage;
