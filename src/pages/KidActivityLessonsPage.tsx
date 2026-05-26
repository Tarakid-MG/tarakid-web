import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LessonSelection } from "../components/lesson/LessonSelection";
import type { Lesson } from "../services/lesson.service";
import type { KidActivityType } from "../data/kidLessonActivities";

const KidActivityLessonsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activityType } = useParams<{ activityType: KidActivityType }>();

  const safeType: KidActivityType =
    activityType === "exercise" || activityType === "vocab" || activityType === "game"
      ? activityType
      : "exercise";

  const handleClose = () => {
    navigate("/kid-dashboard");
  };

  const handleSelectLesson = (lesson: Lesson) => {
    navigate(`/kid-activities/${safeType}/${lesson.id}`);
  };

  return (
    <div
      className="min-h-screen font-sans relative overflow-hidden select-none p-4 md:p-8 flex flex-col"
      style={{
        backgroundImage: "url('/images/classroom.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex-1 max-w-8xl mx-auto w-full">
        <LessonSelection
          onClose={handleClose}
          onSelectLesson={handleSelectLesson}
        />
      </div>
    </div>
  );
};

export default KidActivityLessonsPage;
